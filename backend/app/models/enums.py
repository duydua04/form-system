import enum

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