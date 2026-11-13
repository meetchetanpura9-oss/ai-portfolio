"""
Case studies: admin CMS, public read API, image uploads, and share/sitemap helpers.

Public routes only ever return published case studies; drafts answer 404 exactly like
a slug that does not exist.
"""

import html
import logging
import re
import secrets
import unicodedata
from xml.sax.saxutils import escape as xml_escape

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.db import get_db
from app.models.newsletter_model import (
    CASE_STUDY_CATEGORIES,
    CaseStudy,
    MediaAsset,
    NewsletterCampaign,
)
from app.routes.newsletter_routes import api_base_url
from app.schemas.newsletter_schema import CaseStudyWrite
from app.services import campaign_service as campaigns
from app.services.auth_service import require_admin
from app.services.markdown_renderer import render_markdown, safe_url
from app.services.newsletter_service import utcnow
from app.services.rate_limiter import RateLimiter, get_client_ip

logger = logging.getLogger(__name__)

public_router = APIRouter(tags=["Case Studies"])
admin_router = APIRouter(prefix="/admin", tags=["Admin · Case Studies"], dependencies=[Depends(require_admin)])

# Public reads: generous per-IP cap, separate from the form limiters.
read_limiter = RateLimiter(max_requests=90, window_seconds=60)

SECTION_FIELDS = (
    "problem_statement", "project_overview", "solution", "technical_architecture",
    "implementation", "results", "challenges", "lessons_learned",
)
MAX_IMAGE_BYTES = 2 * 1024 * 1024
# content type -> (file signature check, extension)
_IMAGE_TYPES = {
    "image/png": (lambda b: b.startswith(b"\x89PNG\r\n\x1a\n"), "png"),
    "image/jpeg": (lambda b: b.startswith(b"\xff\xd8\xff"), "jpg"),
    "image/webp": (lambda b: b[:4] == b"RIFF" and b[8:12] == b"WEBP", "webp"),
    "image/gif": (lambda b: b[:6] in (b"GIF87a", b"GIF89a"), "gif"),
}


# --- Helpers -----------------------------------------------------------------------
def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value[:120].strip("-") or "case-study"


def unique_slug(db: Session, wanted: str, exclude_id: int | None = None) -> str:
    base = slugify(wanted)
    slug, n = base, 2
    while True:
        query = db.query(CaseStudy.id).filter(CaseStudy.slug == slug)
        if exclude_id is not None:
            query = query.filter(CaseStudy.id != exclude_id)
        if query.first() is None:
            return slug
        slug = f"{base}-{n}"
        n += 1


def _clean_url(value: str | None, field: str) -> str | None:
    value = (value or "").strip()
    if not value:
        return None
    if safe_url(value) is None:
        raise HTTPException(422,
                            f"{field} must be an http(s) link or a path starting with /")
    return value


def _summary(study: CaseStudy) -> dict:
    return {
        "id": study.id,
        "title": study.title,
        "slug": study.slug,
        "summary": study.summary or "",
        "category": study.category,
        "cover_image_url": study.cover_image_url,
        "technologies": study.technologies or [],
        "featured": bool(study.featured),
        "status": study.status,
        "published_at": study.published_at,
        "updated_at": study.updated_at,
    }


def _detail(study: CaseStudy, include_source: bool = False) -> dict:
    settings = get_settings()
    data = {
        **_summary(study),
        "architecture_steps": study.architecture_steps or [],
        "key_features": study.key_features or [],
        "screenshots": study.screenshots or [],
        "github_url": study.github_url,
        "live_demo_url": study.live_demo_url,
        "seo_title": study.seo_title or study.title,
        "seo_description": study.seo_description or (study.summary or "")[:300],
        "canonical_url": f"{settings.app_base_url}/case-studies/{study.slug}",
        # Rendered by the server-side safe renderer; empty sections come back as "".
        "sections": {
            name: render_markdown(getattr(study, name) or "", mode="web") for name in SECTION_FIELDS
        },
    }
    if include_source:
        data["source"] = {name: getattr(study, name) or "" for name in SECTION_FIELDS}
        data["seo_title_raw"] = study.seo_title
        data["seo_description_raw"] = study.seo_description
        data["created_at"] = study.created_at
    return data


def _apply(study: CaseStudy, payload: CaseStudyWrite, db: Session) -> None:
    if payload.category and payload.category not in CASE_STUDY_CATEGORIES:
        raise HTTPException(422,
                            f"Category must be one of: {', '.join(CASE_STUDY_CATEGORIES)}")
    study.title = payload.title.strip()
    study.slug = unique_slug(db, payload.slug or study.slug or payload.title, exclude_id=study.id)
    study.summary = payload.summary.strip()
    study.category = payload.category
    study.cover_image_url = _clean_url(payload.cover_image_url, "Cover image")
    for name in SECTION_FIELDS:
        setattr(study, name, getattr(payload, name))
    study.architecture_steps = payload.architecture_steps
    study.technologies = payload.technologies
    study.key_features = payload.key_features
    study.screenshots = [
        {"src": _clean_url(shot.src, "Screenshot"), "alt": shot.alt.strip()}
        for shot in payload.screenshots if shot.src.strip()
    ]
    study.github_url = _clean_url(payload.github_url, "GitHub link")
    study.live_demo_url = _clean_url(payload.live_demo_url, "Live demo link")
    study.seo_title = (payload.seo_title or "").strip() or None
    study.seo_description = (payload.seo_description or "").strip() or None
    study.featured = payload.featured


def _get(db: Session, study_id: int) -> CaseStudy:
    study = db.get(CaseStudy, study_id)
    if study is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case study not found")
    return study


# ===================================================================================
# Admin CMS
# ===================================================================================
@admin_router.get("/case-studies", summary="List all case studies, drafts included")
def admin_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status", pattern="^(draft|published)$"),
    search: str | None = Query(None, max_length=200),
    db: Session = Depends(get_db),
):
    query = db.query(CaseStudy)
    if status_filter:
        query = query.filter(CaseStudy.status == status_filter)
    if search and search.strip():
        term = search.strip().replace("\\", "\\\\").replace("%", r"\%").replace("_", r"\_")
        query = query.filter(CaseStudy.title.ilike(f"%{term}%", escape="\\"))
    total = query.count()
    rows = (query.order_by(CaseStudy.updated_at.desc(), CaseStudy.id.desc())
            .offset((page - 1) * page_size).limit(page_size).all())
    return {"items": [_summary(s) for s in rows], "total": total, "page": page, "page_size": page_size,
            "categories": list(CASE_STUDY_CATEGORIES)}


@admin_router.post("/case-studies", status_code=status.HTTP_201_CREATED, summary="Create a draft case study")
def admin_create(payload: CaseStudyWrite, db: Session = Depends(get_db)):
    study = CaseStudy(status="draft")
    _apply(study, payload, db)
    db.add(study)
    db.commit()
    db.refresh(study)
    return _detail(study, include_source=True)


@admin_router.get("/case-studies/{study_id}", summary="Case study with editable source (also the preview)")
def admin_get(study_id: int, db: Session = Depends(get_db)):
    return _detail(_get(db, study_id), include_source=True)


@admin_router.put("/case-studies/{study_id}", summary="Edit a case study")
def admin_update(study_id: int, payload: CaseStudyWrite, db: Session = Depends(get_db)):
    study = _get(db, study_id)
    _apply(study, payload, db)
    db.commit()
    db.refresh(study)
    return _detail(study, include_source=True)


@admin_router.delete("/case-studies/{study_id}", status_code=status.HTTP_204_NO_CONTENT,
                     summary="Delete a case study (requires ?confirm=true)")
def admin_delete(study_id: int, confirm: bool = Query(False), db: Session = Depends(get_db)):
    if not confirm:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Deleting requires confirm=true.")
    study = _get(db, study_id)
    # Campaigns that referenced it are kept; only the link is cleared.
    db.execute(update(NewsletterCampaign).where(NewsletterCampaign.case_study_id == study.id)
               .values(case_study_id=None))
    db.delete(study)
    db.commit()
    return None


@admin_router.post("/case-studies/{study_id}/publish", summary="Publish (makes the page public)")
def admin_publish(study_id: int, db: Session = Depends(get_db)):
    """Publishing never sends email. A newsletter is a separate, explicit action."""
    study = _get(db, study_id)
    missing = []
    if not (study.summary or "").strip():
        missing.append("a summary")
    if not study.category:
        missing.append("a category")
    if not any((getattr(study, name) or "").strip() for name in SECTION_FIELDS):
        missing.append("at least one content section")
    if missing:
        raise HTTPException(422,
                            f"Before publishing, add {', '.join(missing)}.")
    study.status = "published"
    study.published_at = study.published_at or utcnow()
    db.commit()
    db.refresh(study)
    return _detail(study, include_source=True)


@admin_router.post("/case-studies/{study_id}/unpublish", summary="Unpublish (back to draft)")
def admin_unpublish(study_id: int, db: Session = Depends(get_db)):
    study = _get(db, study_id)
    study.status = "draft"
    db.commit()
    db.refresh(study)
    return _detail(study, include_source=True)


@admin_router.post("/case-studies/{study_id}/newsletter", status_code=status.HTTP_201_CREATED,
                   summary="Create a newsletter DRAFT from a published case study")
def admin_newsletter_from_case_study(study_id: int, db: Session = Depends(get_db)):
    """Creates a draft only. Nothing is sent until the admin reviews, tests and confirms it."""
    study = _get(db, study_id)
    if study.status != "published":
        raise HTTPException(status.HTTP_409_CONFLICT, "Publish the case study before creating a newsletter from it.")
    settings = get_settings()
    draft = campaigns.draft_from_case_study(settings, study)
    campaign = NewsletterCampaign(
        **draft,
        html_content=campaigns.render_campaign_html(settings, draft["content"], draft["preview_text"]),
        status="draft",
        case_study_id=study.id,
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return {"campaign_id": campaign.id, "title": campaign.title, "status": campaign.status}


# --- Images ------------------------------------------------------------------------
def _media_row(asset, base: str) -> dict:
    return {
        "id": asset.id,
        "filename": asset.filename,
        "content_type": asset.content_type,
        "size": asset.size,
        "url": f"{base}/media/{asset.public_id}/{asset.filename}",
        "created_at": asset.created_at,
    }


@admin_router.get("/media", summary="Recently uploaded images")
def admin_media_list(request: Request, limit: int = Query(40, ge=1, le=100), db: Session = Depends(get_db)):
    rows = (
        db.query(MediaAsset.id, MediaAsset.public_id, MediaAsset.filename, MediaAsset.content_type,
                 MediaAsset.size, MediaAsset.created_at)  # never loads the image bytes
        .order_by(MediaAsset.id.desc()).limit(limit).all()
    )
    base = api_base_url(request)
    return {"items": [_media_row(r, base) for r in rows], "max_bytes": MAX_IMAGE_BYTES}


@admin_router.post("/media", status_code=status.HTTP_201_CREATED, summary="Upload an image (raw request body)")
async def admin_media_upload(
    request: Request,
    filename: str = Query("image", max_length=120),
    db: Session = Depends(get_db),
):
    """
    Send the file bytes as the request body with its image Content-Type.
    PNG, JPEG, WebP or GIF, up to 2 MB. The type is verified from the file signature.
    """
    content_type = (request.headers.get("content-type") or "").split(";")[0].strip().lower()
    if content_type not in _IMAGE_TYPES:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Upload a PNG, JPEG, WebP or GIF image.")
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Images can be at most 2 MB.")

    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(413, "Images can be at most 2 MB.")
    signature_ok, extension = _IMAGE_TYPES[content_type]
    if not data or not signature_ok(bytes(data[:16])):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "The file is not a valid image of that type.")

    stem = slugify(filename.rsplit(".", 1)[0])[:60]
    asset = MediaAsset(
        public_id=secrets.token_urlsafe(12),
        filename=f"{stem}.{extension}",
        content_type=content_type,
        size=len(data),
        data=bytes(data),
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return _media_row(asset, api_base_url(request))


@admin_router.delete("/media/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an uploaded image")
def admin_media_delete(asset_id: int, db: Session = Depends(get_db)):
    asset = db.get(MediaAsset, asset_id)
    if asset is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")
    db.delete(asset)
    db.commit()
    return None


@public_router.get("/media/{public_id}/{filename}", summary="Serve an uploaded image", include_in_schema=False)
def serve_media(public_id: str, filename: str, db: Session = Depends(get_db)):
    asset = db.query(MediaAsset).filter(MediaAsset.public_id == public_id).first()
    if asset is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")
    return Response(content=asset.data, media_type=asset.content_type, headers={
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
    })


# ===================================================================================
# Public
# ===================================================================================
def _published(db: Session):
    return db.query(CaseStudy).filter(CaseStudy.status == "published")


@public_router.get("/case-studies", summary="Published case studies")
def public_list(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=24),
    category: str | None = Query(None, max_length=60),
    db: Session = Depends(get_db),
):
    read_limiter.check(get_client_ip(request))
    query = _published(db)
    if category:
        query = query.filter(CaseStudy.category == category)
    total = query.count()
    rows = (query.order_by(CaseStudy.featured.desc(), CaseStudy.published_at.desc(), CaseStudy.id.desc())
            .offset((page - 1) * page_size).limit(page_size).all())
    categories = [c for (c,) in _published(db).with_entities(CaseStudy.category).distinct().all() if c]
    return {"items": [_summary(s) for s in rows], "total": total, "page": page, "page_size": page_size,
            "categories": sorted(categories)}


@public_router.get("/case-studies/sitemap.xml", include_in_schema=False)
def public_sitemap(db: Session = Depends(get_db)):
    base = get_settings().app_base_url
    rows = _published(db).with_entities(CaseStudy.slug, CaseStudy.updated_at).order_by(CaseStudy.id).all()
    urls = [f"  <url><loc>{xml_escape(base)}/case-studies</loc></url>"]
    for slug, updated in rows:
        lastmod = f"<lastmod>{updated.date().isoformat()}</lastmod>" if updated else ""
        urls.append(f"  <url><loc>{xml_escape(base)}/case-studies/{xml_escape(slug)}</loc>{lastmod}</url>")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(urls) + "\n</urlset>\n")
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})


def _published_by_slug(db: Session, slug: str) -> CaseStudy:
    study = _published(db).filter(CaseStudy.slug == slug).first()
    if study is None:
        # Same answer for "draft" and "does not exist": drafts are not discoverable.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case study not found")
    return study


@public_router.get("/case-studies/{slug}", summary="One published case study")
def public_detail(slug: str, request: Request, db: Session = Depends(get_db)):
    read_limiter.check(get_client_ip(request))
    study = _published_by_slug(db, slug)
    related = (
        _published(db).filter(CaseStudy.id != study.id)
        # Same category first, then the most recent.
        .order_by((CaseStudy.category == study.category).desc(), CaseStudy.published_at.desc())
        .limit(3).all()
    )
    return {**_detail(study), "related": [_summary(r) for r in related]}


@public_router.get("/case-studies/{slug}/share", response_class=HTMLResponse, include_in_schema=False)
def public_share(slug: str, db: Session = Depends(get_db)):
    """
    Static HTML with Open Graph tags for link-preview crawlers (which do not run the
    site's JavaScript). Humans are redirected to the real page.
    """
    study = _published_by_slug(db, slug)
    settings = get_settings()
    canonical = f"{settings.app_base_url}/case-studies/{study.slug}"
    e = lambda value: html.escape(value or "", quote=True)  # noqa: E731
    title = e(study.seo_title or study.title)
    description = e(study.seo_description or (study.summary or "")[:300])
    image = study.cover_image_url or ""
    if image.startswith("/"):
        image = settings.app_base_url + image
    image_tags = (
        f'<meta property="og:image" content="{e(image)}">\n<meta name="twitter:image" content="{e(image)}">'
        if image else ""
    )
    return HTMLResponse(f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="{e(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Meet Chetanpura">
<meta property="og:url" content="{e(canonical)}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
{image_tags}
<meta http-equiv="refresh" content="0; url={e(canonical)}">
</head><body><p><a href="{e(canonical)}">{title}</a></p></body></html>""",
                        headers={"Cache-Control": "public, max-age=600"})

