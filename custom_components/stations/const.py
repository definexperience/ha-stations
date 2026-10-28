"""Constants for the Stations integration."""

from __future__ import annotations

DOMAIN = "stations"

CONF_LABEL_ID = "label_id"
CONF_AREA_ID = "area_id"

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
