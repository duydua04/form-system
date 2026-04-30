from fastapi import status
from typing import Optional

class AppException(Exception):
    """
    Base exception for all custom business logic errors in the application.
    """
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        error_code: str = "BAD_REQUEST",
        message: str = "An application error occurred.",
        details: Optional[list] = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details
        super().__init__(self.message)