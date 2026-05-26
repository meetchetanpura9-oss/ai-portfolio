"""
Simple in-memory rate limiter keyed by client IP.
For multi-instance production, replace with Redis (e.g. slowapi + redis).
"""

from collections import defaultdict
from time import time
from typing import DefaultDict, List

from fastapi import HTTPException, Request, status

from app.core.config import get_settings


class RateLimiter:
    def __init__(self) -> None:
        self._hits: DefaultDict[str, List[float]] = defaultdict(list)

    def check(self, client_id: str) -> None:
        settings = get_settings()
        now = time()
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        max_requests = settings.RATE_LIMIT_REQUESTS

        self._hits[client_id] = [
            t for t in self._hits[client_id] if now - t < window
        ]

        if len(self._hits[client_id]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again in a minute.",
            )

        self._hits[client_id].append(now)


rate_limiter = RateLimiter()


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request) -> None:
    rate_limiter.check(get_client_ip(request))
