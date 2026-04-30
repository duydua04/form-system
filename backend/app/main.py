# IMPORT LIBRARY
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .configs.settings import settings

#IMPORT COMMON ROUTER
from .routes.common.auth_route import auth_router
from .utils.error_helper.error_handlers import setup_exception_handlers

app = FastAPI(
    title="DForm Website",
)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
setup_exception_handlers(app)

#CALL COMMON API
app.include_router(auth_router)