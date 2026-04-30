import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from ...configs.settings import settings


def create_access_token(
        subject: str | int, role: str = "user",
        expires_delta: timedelta | None = None
) -> str:
    """
    Create Access Token contains infor.
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode = {
        "exp": expire,
        "iat": now,
        "sub": str(subject),
        "role": role,
        "type": "access"
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
        subject: str | int, role: str = "user",
        expires_delta: timedelta | None = None
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))

    to_encode = {
        "exp": expire,
        "iat": now,
        "sub": str(subject),
        "role": role,
        "type": "refresh"
    }

    return jwt.encode(
        to_encode, settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(
            token, settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token.")