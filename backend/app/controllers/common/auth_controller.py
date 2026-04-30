from fastapi import Response, Depends
from ...services.common.auth_service import AuthService, get_auth_service
from ...schemas.common.auth_schema import (
    RegisterRequest, LoginRequest,
    AuthSuccessResponse, LogoutResponse,
    UserResponse,AdminResponse
)
from ...utils.security.token import create_access_token, create_refresh_token


class AuthController:
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    def _set_auth_cookies(self, response: Response, account_id: int, role: str):
        """Hàm nội bộ: Khởi tạo JWT và gắn vào HTTP-Only Cookies."""
        access_token = create_access_token(subject=account_id, role=role)
        refresh_token = create_refresh_token(subject=account_id, role=role)

        response.set_cookie(
            key="access_token", value=access_token,
            httponly=True, samesite="lax",
            max_age=30 * 60
        )
        response.set_cookie(
            key="refresh_token", value=refresh_token,
            httponly=True, samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

    async def register_user(self, payload: RegisterRequest) -> AuthSuccessResponse:
        user = await self.auth_service.register_user(payload)
        return AuthSuccessResponse(message="User registered successfully.", account=user)

    async def register_admin(self, payload: RegisterRequest) -> AuthSuccessResponse:
        admin = await self.auth_service.register_admin(payload)
        return AuthSuccessResponse(message="Admin registered successfully.", account=admin)

    async def login_user(self, payload: LoginRequest, response: Response) -> AuthSuccessResponse:
        user = await self.auth_service.authenticate_user(payload)
        self._set_auth_cookies(response, user.id, "user")
        return AuthSuccessResponse(message="User logged in successfully.", account=user)

    async def get_user_me(self, user_id: int) -> UserResponse:
        return await self.auth_service.get_user_by_id(user_id)

    async def login_admin(self, payload: LoginRequest, response: Response) -> AuthSuccessResponse:
        admin = await self.auth_service.authenticate_admin(payload)
        self._set_auth_cookies(response, admin.id, "admin")
        return AuthSuccessResponse(message="Admin logged in successfully.", account=admin)

    async def get_admin_me(self, admin_id: int) -> AdminResponse:
        return await self.auth_service.get_admin_by_id(admin_id)

    async def logout(self, response: Response) -> LogoutResponse:
        response.delete_cookie(key="access_token", httponly=True, samesite="lax")
        response.delete_cookie(key="refresh_token", httponly=True, samesite="lax")
        return LogoutResponse(message="Logged out successfully.")


def get_auth_controller(service: AuthService = Depends(get_auth_service)) -> AuthController:
    return AuthController(service)