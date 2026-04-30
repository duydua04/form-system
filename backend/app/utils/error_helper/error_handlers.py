from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .exceptions import AppException
from ...schemas.common.error_schema import ErrorResponse, ErrorDetailItem


def setup_exception_handlers(app: FastAPI) -> None:
    """
    Registers exception.
    """

    # 1. Handle our custom AppExceptions (Business Logic Errors)
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        error_response = ErrorResponse(
            success=False,
            error_code=exc.error_code,
            message=exc.message,
            details=exc.details
        )

        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.model_dump(exclude_none=True)
        )

    # 2. Handle FastAPI/Starlette standard HTTPExceptions
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        error_code = "HTTP_ERROR"
        if exc.status_code == status.HTTP_404_NOT_FOUND:
            error_code = "NOT_FOUND"
        elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = "UNAUTHORIZED"
        elif exc.status_code == status.HTTP_403_FORBIDDEN:
            error_code = "FORBIDDEN"

        error_response = ErrorResponse(
            success=False,
            error_code=error_code,
            message=str(exc.detail)
        )

        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.model_dump(exclude_none=True)
        )

    # 3. Handle Pydantic Validation Errors
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        formatted_details = []
        for err in exc.errors():
            field_name = str(err["loc"][-1]) if len(err["loc"]) > 0 else "unknown_field"
            formatted_details.append(ErrorDetailItem(field=field_name, issue=err["msg"]))

        error_response = ErrorResponse(
            success=False,
            error_code="VALIDATION_ERROR",
            message="Input validation failed. Please check the provided data.",
            details=formatted_details
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response.model_dump(exclude_none=True)
        )

    # 4. Handle Global Unhandled Exceptions (Server Crashes)
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        error_response = ErrorResponse(
            success=False,
            error_code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred. Please try again later."
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response.model_dump(exclude_none=True)
        )

