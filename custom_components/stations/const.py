"""Constants for the Stations integration."""

from __future__ import annotations

DOMAIN = "stations"

CONF_LABEL_ID = "label_id"
CONF_AREA_ID = "area_id"
CONF_POWER_ON_LABEL = "power_on_label"
CONF_POWER_OFF_LABEL = "power_off_label"
CONF_USE_POWER_LABELS = "use_power_labels"

# Labels suggested for power on / power off in the config flow
DEFAULT_POWER_ON_LABEL = "Power on"
DEFAULT_POWER_OFF_LABEL = "Power off"
POWER_ON_LABEL_ICON = "mdi:power"
POWER_OFF_LABEL_ICON = "mdi:power"
POWER_ON_LABEL_COLOR = "green"
POWER_OFF_LABEL_COLOR = "red"

# Panel
PANEL_URL_PATH = "stations"
PANEL_TITLE = "Stations"
PANEL_ICON = "stations:logo"
PANEL_COMPONENT = "stations-panel"
STATIC_URL = "/stations_static"

# Storage
STORAGE_KEY = "stations.docs"
STORAGE_VERSION = 1
FILES_DIR = "stations"  # relative to the HA config directory

# Uploads
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
# Longest side, in pixels, of the small photo copies used in lists and galleries
SMALL_IMAGE_EDGE = 640
ALLOWED_CONTENT_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
}

# Internal dispatcher signal: fired whenever anything about any station changes
SIGNAL_STATIONS_CHANGED = f"{DOMAIN}_changed"

DEFAULT_LABEL_ICON = "stations:logo"
DEFAULT_LABEL_COLOR = "indigo"
