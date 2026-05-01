from fastapi import Request, Depends, status
from fastapi.security import APIKeyCookie

from ..utils.security.token import decode_token
from ..utils.error_helper.exceptions import AppException

cookie_scheme = APIKeyCookie(name="access_token", auto_error=False)

def get_token_payload(token: str = Depends(cookie_scheme)) -> dict:
    """
    Base Dependency
    """
    if not token:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="MISSING_TOKEN",
            message="Authentication required. Please log in."
        )

    try:
        payload = decode_token(token)
        return payload
    except Exception as e:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="INVALID_TOKEN",
            message="Your session has expired or the token is invalid."
        )


def require_user(payload: dict = Depends(get_token_payload)) -> int:
    role = payload.get("role")
    if role != "user":
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ACCESS_DENIED",
            message="This resource strictly requires User privileges."
        )
    return int(payload.get("sub"))


def require_admin(payload: dict = Depends(get_token_payload)) -> int:
    role = payload.get("role")

    if role != "admin":
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ACCESS_DENIED",
            message="This resource strictly requires Administrator privileges."
        )
    return int(payload.get("sub"))