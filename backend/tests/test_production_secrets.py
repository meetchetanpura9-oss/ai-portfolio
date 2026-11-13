"""
Production signing-secret enforcement.

In production (APP_ENV=production, or on Render where RENDER=true) the app must refuse to
start unless JWT_SECRET and NEWSLETTER_CONFIRMATION_SECRET are set, differ from each other,
are not development placeholders and are not part of DATABASE_URL. Nothing may ever be
derived from the database credentials. Outside production, labelled dev secrets are used.
"""

import os
import subprocess
import sys
from pathlib import Path

import pytest

import test_health_and_routes  # noqa: F401 — isolated test settings, imported first

from app.core.config import (
    DEV_JWT_SECRET,
    DEV_NEWSLETTER_SECRET,
    SecretConfigError,
    Settings,
    get_settings,
    resolve_secrets,
)
from app.services import auth_service

BACKEND_DIR = Path(__file__).resolve().parents[1]
DB_URL = "postgresql://neon_user:Db-Password-123@ep-fake-123.neon.tech/neondb?sslmode=require"
GOOD_JWT = "prod-jwt-" + "a" * 40
GOOD_NL = "prod-newsletter-" + "b" * 40


def make(monkeypatch, *, app_env="production", render=None, jwt="", newsletter="", db=DB_URL) -> Settings:
    """Settings built only from the given values (no .env file, no inherited env vars)."""
    for name in ("APP_ENV", "JWT_SECRET", "NEWSLETTER_CONFIRMATION_SECRET", "RENDER"):
        monkeypatch.delenv(name, raising=False)
    if render is not None:
        monkeypatch.setenv("RENDER", render)
    return Settings(_env_file=None, APP_ENV=app_env, JWT_SECRET=jwt,
                    NEWSLETTER_CONFIRMATION_SECRET=newsletter, DATABASE_URL=db)


# --- Production: refuse to start ------------------------------------------------------
def test_production_requires_jwt_secret(monkeypatch):
    with pytest.raises(SecretConfigError, match="JWT_SECRET is not set"):
        resolve_secrets(make(monkeypatch, newsletter=GOOD_NL))


def test_production_requires_newsletter_secret(monkeypatch):
    with pytest.raises(SecretConfigError, match="NEWSLETTER_CONFIRMATION_SECRET is not set"):
        resolve_secrets(make(monkeypatch, jwt=GOOD_JWT))


def test_production_requires_both_and_reports_both(monkeypatch):
    with pytest.raises(SecretConfigError) as exc:
        resolve_secrets(make(monkeypatch))
    message = str(exc.value)
    assert "JWT_SECRET is not set" in message and "NEWSLETTER_CONFIRMATION_SECRET is not set" in message


def test_production_secrets_must_differ(monkeypatch):
    with pytest.raises(SecretConfigError, match="must be different"):
        resolve_secrets(make(monkeypatch, jwt=GOOD_JWT, newsletter=GOOD_JWT))


@pytest.mark.parametrize("derived", ["Db-Password-123", "neondb?sslmode=require", "neon_user"])
def test_production_rejects_secrets_taken_from_database_url(monkeypatch, derived):
    with pytest.raises(SecretConfigError, match="must not be part of DATABASE_URL"):
        resolve_secrets(make(monkeypatch, jwt=derived, newsletter=GOOD_NL))
    with pytest.raises(SecretConfigError, match="must not be part of DATABASE_URL"):
        resolve_secrets(make(monkeypatch, jwt=GOOD_JWT, newsletter=derived))


def test_production_rejects_dev_placeholders(monkeypatch):
    with pytest.raises(SecretConfigError, match="development placeholder"):
        resolve_secrets(make(monkeypatch, jwt=DEV_JWT_SECRET, newsletter=GOOD_NL))
    with pytest.raises(SecretConfigError, match="development placeholder"):
        resolve_secrets(make(monkeypatch, jwt=GOOD_JWT, newsletter=DEV_NEWSLETTER_SECRET))


def test_error_message_never_contains_secret_values(monkeypatch):
    with pytest.raises(SecretConfigError) as exc:
        resolve_secrets(make(monkeypatch, jwt="Db-Password-123", newsletter="Db-Password-123"))
    message = str(exc.value)
    assert "Db-Password-123" not in message and DB_URL not in message


def test_production_accepts_independent_secrets_unchanged(monkeypatch):
    settings = make(monkeypatch, jwt=GOOD_JWT, newsletter=GOOD_NL)
    assert resolve_secrets(settings) == (GOOD_JWT, GOOD_NL)  # used exactly as configured
    assert settings.jwt_secret == GOOD_JWT and settings.newsletter_secret == GOOD_NL


# --- Environment detection ---------------------------------------------------------------
def test_render_is_detected_as_production(monkeypatch):
    settings = make(monkeypatch, app_env="", render="true")
    assert settings.is_production
    with pytest.raises(SecretConfigError):
        resolve_secrets(settings)


@pytest.mark.parametrize("app_env", ["development", "test", "DEVELOPMENT", " test ", "staging", "production", ""])
def test_render_always_means_production_whatever_app_env_says(monkeypatch, app_env):
    settings = make(monkeypatch, app_env=app_env, render="true")
    assert settings.environment == "production" and settings.is_production
    # An accidental APP_ENV=development on Render must not bypass the secret checks.
    with pytest.raises(SecretConfigError, match="JWT_SECRET is not set"):
        resolve_secrets(settings)


@pytest.mark.parametrize("render", ["TRUE", " true "])
def test_render_flag_is_case_and_whitespace_insensitive(monkeypatch, render):
    assert make(monkeypatch, app_env="development", render=render).is_production


@pytest.mark.parametrize("app_env,expected", [
    ("development", "development"), ("test", "test"), ("production", "production"), ("", "development"),
])
def test_app_env_is_used_when_not_on_render(monkeypatch, app_env, expected):
    assert make(monkeypatch, app_env=app_env, render=None).environment == expected


@pytest.mark.parametrize("render", ["false", "", "0"])
def test_render_other_than_true_does_not_force_production(monkeypatch, render):
    assert make(monkeypatch, app_env="development", render=render).environment == "development"


# --- Secret strength -----------------------------------------------------------------
SHORT = "x" * 31  # MIN_SECRET_LENGTH - 1


@pytest.mark.parametrize("which", ["JWT_SECRET", "NEWSLETTER_CONFIRMATION_SECRET"])
def test_production_rejects_short_secrets(monkeypatch, which):
    jwt, nl = (SHORT, GOOD_NL) if which == "JWT_SECRET" else (GOOD_JWT, SHORT)
    with pytest.raises(SecretConfigError) as exc:
        resolve_secrets(make(monkeypatch, jwt=jwt, newsletter=nl))
    message = str(exc.value)
    assert f"{which} must be at least 32 characters long." in message
    assert SHORT not in message and GOOD_JWT not in message and GOOD_NL not in message
    assert "31" not in message  # not even the actual length is disclosed


def test_production_reports_both_short_secrets(monkeypatch):
    with pytest.raises(SecretConfigError) as exc:
        resolve_secrets(make(monkeypatch, jwt="a" * 10, newsletter="b" * 20))
    assert str(exc.value).count("must be at least 32 characters long") == 2


def test_production_accepts_exactly_32_character_secrets(monkeypatch):
    jwt, nl = "J" * 32, "N" * 32
    assert resolve_secrets(make(monkeypatch, jwt=jwt, newsletter=nl)) == (jwt, nl)


def test_short_secret_rejection_logs_nothing_secret(monkeypatch, caplog):
    caplog.set_level("DEBUG")
    with pytest.raises(SecretConfigError):
        resolve_secrets(make(monkeypatch, jwt=SHORT, newsletter=GOOD_NL))
    assert SHORT not in caplog.text and GOOD_NL not in caplog.text


def test_development_does_not_enforce_length(monkeypatch):
    # Local/CI convenience: short explicit dev values still work outside production.
    assert resolve_secrets(make(monkeypatch, app_env="development", jwt="short", newsletter="also-short")) \
        == ("short", "also-short")


# --- Development / test ----------------------------------------------------------------
def test_development_uses_labelled_dev_secrets_never_database_url(monkeypatch):
    settings = make(monkeypatch, app_env="development")
    jwt_secret, newsletter_secret = resolve_secrets(settings)
    assert (jwt_secret, newsletter_secret) == (DEV_JWT_SECRET, DEV_NEWSLETTER_SECRET)
    for value in (jwt_secret, newsletter_secret):
        assert value not in DB_URL and "neondb" not in value and "Db-Password" not in value


def test_test_suite_runs_with_explicit_independent_secrets():
    settings = get_settings()
    assert settings.environment == "test"
    assert settings.jwt_secret == os.environ["JWT_SECRET"] == auth_service.JWT_SECRET
    assert settings.newsletter_secret == os.environ["NEWSLETTER_CONFIRMATION_SECRET"]
    assert settings.jwt_secret != settings.newsletter_secret


# --- Real startup ----------------------------------------------------------------------
def _start_app(tmp_path, **env_overrides) -> subprocess.CompletedProcess:
    """Import app.main in a fresh interpreter, as uvicorn does on Render (no .env file)."""
    env = {k: v for k, v in os.environ.items()
           if k not in ("APP_ENV", "JWT_SECRET", "NEWSLETTER_CONFIRMATION_SECRET", "RENDER")}
    env.update(PYTHONPATH=str(BACKEND_DIR), DATABASE_URL=f"sqlite:///{tmp_path / 'startup.db'}",
               RESEND_API_KEY="", **env_overrides)
    return subprocess.run([sys.executable, "-c", "import app.main"], cwd=tmp_path, env=env,
                          capture_output=True, text=True, timeout=120)


def test_startup_fails_on_render_without_secrets(tmp_path):
    result = _start_app(tmp_path, RENDER="true")
    assert result.returncode != 0
    assert "SecretConfigError" in result.stderr
    assert "Refusing to start in production" in result.stderr
    assert "JWT_SECRET is not set" in result.stderr


def test_startup_fails_in_production_with_shared_secret(tmp_path):
    result = _start_app(tmp_path, APP_ENV="production", JWT_SECRET=GOOD_JWT,
                        NEWSLETTER_CONFIRMATION_SECRET=GOOD_JWT)
    assert result.returncode != 0 and "must be different" in result.stderr


def test_startup_succeeds_in_production_with_independent_secrets(tmp_path):
    result = _start_app(tmp_path, APP_ENV="production", JWT_SECRET=GOOD_JWT,
                        NEWSLETTER_CONFIRMATION_SECRET=GOOD_NL)
    assert result.returncode == 0, result.stderr[-2000:]


def test_startup_fails_on_render_even_with_app_env_development(tmp_path):
    result = _start_app(tmp_path, RENDER="true", APP_ENV="development")
    assert result.returncode != 0 and "Refusing to start in production" in result.stderr


def test_startup_fails_in_production_with_short_secret(tmp_path):
    short = "s" * 31
    result = _start_app(tmp_path, RENDER="true", JWT_SECRET=short, NEWSLETTER_CONFIRMATION_SECRET=GOOD_NL)
    assert result.returncode != 0
    assert "JWT_SECRET must be at least 32 characters long." in result.stderr
    assert short not in result.stderr and GOOD_NL not in result.stderr


def test_startup_succeeds_on_render_with_32_plus_character_secrets(tmp_path):
    result = _start_app(tmp_path, RENDER="true", JWT_SECRET="J" * 32, NEWSLETTER_CONFIRMATION_SECRET="N" * 48)
    assert result.returncode == 0, result.stderr[-2000:]
