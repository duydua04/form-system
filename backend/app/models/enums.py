import enum

class FormStatusEnum(enum.StrEnum):
    active = "active"
    draft = "draft"

class FieldTypeEnum(enum.StrEnum):
    text = "text"
    number = "number"
    date = "date"
    color = "color"
    select = "select"
    file = "file"