import enum

class UserRoleEnum(enum.StrEnum): # Dùng StrEnum (Python 3.11+) để dễ serialize
    ADMIN = "admin"
    EMPLOYEE = "employee"

class FormStatusEnum(enum.StrEnum):
    ACTIVE = "active"
    DRAFT = "draft"

class FieldTypeEnum(enum.StrEnum):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    COLOR = "color"
    SELECT = "select"
    FILE = "file"