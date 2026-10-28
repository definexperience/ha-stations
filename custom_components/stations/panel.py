"""Register the Stations sidebar panel."""

from __future__ import annotations

import json
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    PANEL_COMPONENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    STATIC_URL,
)

FRONTEND_DIR = Path(__file__).parent / "frontend"
MANIFEST = Path(__file__).parent / "manifest.json"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Serve the panel's JavaScript and add the panel to the sidebar."""
    version = await hass.async_add_executor_job(
        lambda: json.loads(MANIFEST.read_text(encoding="utf-8"))["version"]
    )
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=False)]
    )
    # The icon set must be loaded on every page, before the sidebar draws.
    frontend.add_extra_js_url(hass, f"{STATIC_URL}/stations-icons.js?v={version}")
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_COMPONENT,
        frontend_url_path=PANEL_URL_PATH,
        module_url=f"{STATIC_URL}/stations-panel.js?v={version}",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={},
    )
