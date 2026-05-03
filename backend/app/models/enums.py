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
    multi_select = "multi_select"
    file = "file"