from enum import Enum


class TimeFilterEnum(str, Enum):
    TODAY = "today"
    THIS_WEEK = "this_week"