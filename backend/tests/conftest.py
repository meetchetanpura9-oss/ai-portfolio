"""
Global test safety net: no test may reach the network or a mail server.

Resend, SMTP, WhatsApp and IP-geolocation calls are mocked inside the individual tests.
This guard makes sure that a test which forgets a mock fails loudly instead of sending a
real email or newsletter. (Database connections to TEST_POSTGRES_URL use psycopg sockets,
not urllib/smtplib, so they are unaffected.)
"""

import smtplib
import urllib.request

import pytest


class OutboundCallBlocked(RuntimeError):
    pass


def _blocked(*args, **kwargs):
    target = args[0] if args else kwargs.get("url") or kwargs.get("host")
    target = getattr(target, "full_url", target)
    raise OutboundCallBlocked(f"Outbound network/email call blocked during tests: {target!r}")


@pytest.fixture(autouse=True)
def _no_outbound_network(monkeypatch):
    monkeypatch.setattr(urllib.request, "urlopen", _blocked)
    monkeypatch.setattr(smtplib, "SMTP", _blocked)
    monkeypatch.setattr(smtplib, "SMTP_SSL", _blocked)
    try:  # fastapi-mail sends through aiosmtplib
        import aiosmtplib

        async def _blocked_async(*args, **kwargs):
            _blocked("aiosmtplib")

        monkeypatch.setattr(aiosmtplib.SMTP, "connect", _blocked_async)
    except ImportError:
        pass
    try:  # Twilio SDK sends through requests
        import requests

        monkeypatch.setattr(requests.Session, "request", lambda self, method, url, *a, **k: _blocked(url))
    except ImportError:
        pass
