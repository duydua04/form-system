from fastapi import APIRouter, Depends, Response, Request, status
from ...schemas.common.auth_schema import (
    RegisterRequest, LoginRequest,
    AuthSuccessResponse, LogoutResponse,
    UserResponse, AdminResponse
)
from ...controllers.common.auth_controller import AuthController, get_auth_controller
from ...middleware.auth import require_user, require_admin

auth_router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@auth_router.post("/login", response_model=AuthSuccessResponse, status_code=status.HTTP_200_OK)
async def login_user(
    payload: LoginRequest,
    response: Response,
    controller: AuthController = Depends(get_auth_controller)
):
    return await controller.login_user(payload, response)

@auth_router.post("/admin/login", response_model=AuthSuccessResponse, status_code=status.HTTP_200_OK)
async def login_admin(
    payload: LoginRequest,
    response: Response,
    controller: AuthController = Depends(get_auth_controller)
):
    return await controller.login_admin(payload, response)

@auth_router.post("/logout", response_model=LogoutResponse, status_code=status.HTTP_200_OK)
async def logout(
    response: Response,
    controller: AuthController = Depends(get_auth_controller)
):
    return await controller.logout(response)

@auth_router.post("/refresh", response_model=AuthSuccessResponse, status_code=status.HTTP_200_OK)
async def refresh_token(
    request: Request,
    response: Response,
    controller: AuthController = Depends(get_auth_controller)
):
    return await controller.refresh_token(request, response)


@auth_router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user_me(
    user_id: int = Depends(require_user),
    controller: AuthController = Depends(get_auth_controller)
):
    return await controller.get_user_me(user_id)

@auth_router.get("/admin/me", response_model=AdminResponse, status_code=status.HTTP_200_OK)
async def get_admin_me(
    admin_id: int = Depends(require_admin),
    controller: AuthController = Depends(get_auth_controller)
):
    return await controller.get_admin_me(admin_id)