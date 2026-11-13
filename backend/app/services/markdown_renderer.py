"""
Small, safe Markdown renderer for newsletters and case studies.

Security model: the input is HTML-escaped first, and only the tags written in this file
are ever emitted, so admin-entered content can never inject markup or scripts. Link and
image targets must be http(s), mailto, a site-relative path, or the Resend unsubscribe
placeholder — `javascript:` and friends are dropped.

Supported syntax
    # / ## / ###  headings            **bold**  *italic*  `code`
    [text](url)                       ![alt](url)           (image on its own line)
    - item / 1. item                  > quote     ---  (divider)
    ``` fenced code ```
    [[button: Label | https://url]]   call-to-action button

mode="email" emits inline styles (email clients ignore stylesheets);
mode="web" emits plain semantic tags that the site styles with CSS.
"""

import html
import re

UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}"

_URL_OK = re.compile(r"^(https?://|mailto:)[^\s<>\"']+$", re.IGNORECASE)
_BUTTON = re.compile(r"^\[\[\s*button\s*:\s*(.+?)\s*\|\s*(.+?)\s*\]\]$", re.IGNORECASE)
_IMAGE = re.compile(r"^!\[([^\]]*)\]\(([^)\s]+)\)$")
_HEADING = re.compile(r"^(#{1,3})\s+(.+)$")
_ULI = re.compile(r"^[-*]\s+(.+)$")
_OLI = re.compile(r"^\d+[.)]\s+(.+)$")

_EMAIL_STYLES = {
    "h1": "margin:28px 0 12px;font-size:26px;line-height:1.25;color:#0b1530;font-weight:700;",
    "h2": "margin:28px 0 10px;font-size:20px;line-height:1.3;color:#0b1530;font-weight:700;",
    "h3": "margin:24px 0 8px;font-size:16px;line-height:1.35;color:#0b1530;font-weight:700;",
    "p": "margin:0 0 16px;font-size:16px;line-height:1.65;color:#334155;",
    "ul": "margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.65;color:#334155;",
    "ol": "margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.65;color:#334155;",
    "li": "margin:0 0 6px;",
    "a": "color:#2563eb;text-decoration:underline;",
    "blockquote": "margin:0 0 16px;padding:4px 0 4px 16px;border-left:3px solid #c7d2fe;color:#475569;font-size:16px;line-height:1.65;",
    "pre": "margin:0 0 16px;padding:14px 16px;background:#0f172a;color:#e2e8f0;border-radius:10px;font-size:13px;line-height:1.55;overflow-x:auto;white-space:pre-wrap;font-family:Consolas,Menlo,monospace;",
    "code": "padding:1px 5px;background:#eef2ff;border-radius:4px;font-size:0.92em;font-family:Consolas,Menlo,monospace;",
    "hr": "margin:28px 0;border:none;border-top:1px solid #e2e8f0;",
    "img": "display:block;width:100%;max-width:100%;height:auto;border-radius:12px;margin:0 0 16px;border:0;",
    "button": "display:inline-block;padding:12px 22px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;",
    "button_wrap": "margin:8px 0 24px;",
}


def safe_url(url: str, base_url: str = "") -> str | None:
    """Return a safe absolute/relative URL, or None when the scheme is not allowed."""
    url = html.unescape((url or "").strip())
    if url == UNSUBSCRIBE_PLACEHOLDER:
        return url
    if url.startswith("/") and not url.startswith("//"):
        url = (base_url.rstrip("/") + url) if base_url else url
        return html.escape(url, quote=True) if re.match(r"^[^\s<>\"']+$", url) else None
    if _URL_OK.match(url):
        return html.escape(url, quote=True)
    return None


class _Renderer:
    def __init__(self, mode: str, base_url: str):
        self.email = mode == "email"
        self.base_url = base_url

    def tag(self, name: str, inner: str, style_key: str | None = None, attrs: str = "") -> str:
        style = f' style="{_EMAIL_STYLES[style_key or name]}"' if self.email else ""
        return f"<{name}{attrs}{style}>{inner}</{name}>"

    def inline(self, text: str) -> str:
        text = html.escape(text, quote=True)
        codes: list[str] = []

        def stash_code(m: re.Match) -> str:
            codes.append(self.tag("code", m.group(1)))
            return f"\x00{len(codes) - 1}\x00"

        text = re.sub(r"`([^`]+)`", stash_code, text)

        def link(m: re.Match) -> str:
            url = safe_url(m.group(2), self.base_url)
            if not url:
                return m.group(1)
            rel = "" if self.email else ' rel="noopener noreferrer" target="_blank"'
            return self.tag("a", m.group(1), attrs=f' href="{url}"{rel}')

        text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)
        text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"(?<![*\w])\*([^*\n]+)\*(?![*\w])", r"<em>\1</em>", text)
        return re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], text)

    def render(self, source: str) -> str:
        lines = (source or "").replace("\r\n", "\n").replace("\r", "\n").split("\n")
        out: list[str] = []
        para: list[str] = []
        i = 0

        def flush() -> None:
            if para:
                out.append(self.tag("p", "<br>".join(self.inline(x) for x in para)))
                para.clear()

        while i < len(lines):
            line = lines[i].rstrip()
            stripped = line.strip()

            if stripped.startswith("```"):
                flush()
                block: list[str] = []
                i += 1
                while i < len(lines) and not lines[i].strip().startswith("```"):
                    block.append(lines[i])
                    i += 1
                i += 1
                out.append(self.tag("pre", html.escape("\n".join(block), quote=True)))
                continue

            if not stripped:
                flush()
                i += 1
                continue

            if re.fullmatch(r"(-{3,}|\*{3,}|_{3,})", stripped):
                flush()
                out.append(f'<hr style="{_EMAIL_STYLES["hr"]}">' if self.email else "<hr>")
                i += 1
                continue

            m = _HEADING.match(stripped)
            if m:
                flush()
                out.append(self.tag(f"h{len(m.group(1))}", self.inline(m.group(2))))
                i += 1
                continue

            m = _BUTTON.match(stripped)
            if m:
                flush()
                url = safe_url(m.group(2), self.base_url)
                label = html.escape(m.group(1), quote=True)
                if url:
                    if self.email:
                        out.append(
                            f'<p style="{_EMAIL_STYLES["button_wrap"]}">'
                            f'<a href="{url}" style="{_EMAIL_STYLES["button"]}">{label}</a></p>'
                        )
                    else:
                        out.append(f'<p><a class="md-button" href="{url}" rel="noopener noreferrer">{label}</a></p>')
                i += 1
                continue

            m = _IMAGE.match(stripped)
            if m:
                flush()
                url = safe_url(m.group(2), self.base_url)
                alt = html.escape(m.group(1), quote=True)
                if url:
                    style = f' style="{_EMAIL_STYLES["img"]}"' if self.email else ' loading="lazy"'
                    out.append(f'<img src="{url}" alt="{alt}"{style}>')
                i += 1
                continue

            if stripped.startswith(">"):
                flush()
                quote: list[str] = []
                while i < len(lines) and lines[i].strip().startswith(">"):
                    quote.append(self.inline(lines[i].strip()[1:].strip()))
                    i += 1
                out.append(self.tag("blockquote", "<br>".join(quote)))
                continue

            for pattern, list_tag in ((_ULI, "ul"), (_OLI, "ol")):
                if pattern.match(stripped):
                    flush()
                    items: list[str] = []
                    while i < len(lines) and pattern.match(lines[i].strip()):
                        items.append(self.tag("li", self.inline(pattern.match(lines[i].strip()).group(1))))
                        i += 1
                    out.append(self.tag(list_tag, "".join(items)))
                    break
            else:
                para.append(stripped)
                i += 1

        flush()
        return "\n".join(out)


def render_markdown(source: str, mode: str = "web", base_url: str = "") -> str:
    """Render Markdown to safe HTML. mode is "web" or "email"."""
    return _Renderer(mode, base_url).render(source)
