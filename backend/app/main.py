# IMPORT LIBRARY
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .utils.error_helper.error_handlers import setup_exception_handlers

from .configs.settings import settings

#IMPORT COMMON ROUTER
from .routes.common.auth_route import auth_router
from .routes.common.upload_route import upload_router

#IMPORT ADMIN ROUTER
from .routes.admin.admin_form_route import admin_form_router
from .routes.admin.admin_field_route import field_router
from .routes.admin.admin_submission_route import admin_submission_router

#IMPORT USER ROUTER
from .routes.user.user_submission_route import user_form_router

app = FastAPI(
    title="DForm Website",
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:5175", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
setup_exception_handlers(app)

#CALL COMMON API
app.include_router(auth_router)
app.include_router(upload_router)

#CALL ADMIN API
app.include_router(admin_form_router)
app.include_router(field_router)
app.include_router(admin_submission_router)

#CALL USER API
app.include_router(user_form_router)
