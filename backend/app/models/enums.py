"""Domain enums for CI Ledger models."""
from enum import Enum


class EventType(str, Enum):
    TOOL_INSTALL = "tool_install"
    TOOL_UPDATE = "tool_update"
    TOOL_REMOVAL = "tool_removal"
    OUTAGE = "outage"
    PATCH = "patch"
    ROLLOUT = "rollout"
    CONFIG_CHANGE = "config_change"


class EventSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class EventSource(str, Enum):
    MANUAL = "manual"
    AUTOMATED = "automated"
    WEBHOOK = "webhook"


class AgentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class ToolType(str, Enum):
    DOCKER_IMAGE = "docker_image"
    PYTHON_PACKAGE = "python_package"
    BINARY = "binary"
    SDK = "sdk"
    OTHER = "other"


class ToolCategory(str, Enum):
    LANGUAGE_RUNTIME = "language_runtime"
    BUILD_TOOL = "build_tool"
    CONTAINER = "container"
    CUSTOM = "custom"
    OTHER = "other"
