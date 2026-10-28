"""Persistent storage of station documentation and attached files.

Text lives in .storage/stations.docs, files live in <config>/stations/<entry_id>/.
Both are inside the config directory, so they are part of normal HA backups.
"""

from __future__ import annotations

import os
from pathlib import Path
import shutil
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import FILES_DIR, STORAGE_KEY, STORAGE_VERSION


def _empty_doc() -> dict[str, Any]:
    return {
        "markdown": "",
        "updated_at": None,
        "updated_by": None,
        "cover": None,
        "files": [],
        "device_display": {},
    }


class DocsStore:
    """Documentation for all stations."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialise the store."""
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        """Load from disk."""
        stored = await self._store.async_load()
        self._data = (stored or {}).get("stations", {})

    async def _async_save(self) -> None:
        await self._store.async_save({"stations": self._data})

    # ------------------------------------------------------------------ files
    def station_dir(self, entry_id: str) -> Path:
        """Folder holding the files of one station."""
        return Path(self.hass.config.path(FILES_DIR, entry_id))

    def file_path(self, entry_id: str, file: dict[str, Any]) -> Path:
        """Location on disk of a stored file."""
        return self.station_dir(entry_id) / f"{file['id']}{file['ext']}"

    # ------------------------------------------------------------------- read
    def get(self, entry_id: str) -> dict[str, Any]:
        """Return the documentation of a station (never None)."""
        return self._data.get(entry_id) or _empty_doc()

    def get_file(self, entry_id: str, file_id: str) -> dict[str, Any] | None:
        """Return one file record."""
        return next(
            (f for f in self.get(entry_id)["files"] if f["id"] == file_id), None
        )

    def _doc(self, entry_id: str) -> dict[str, Any]:
        return self._data.setdefault(entry_id, _empty_doc())

    # ------------------------------------------------------------------ write
    async def async_set_markdown(
        self, entry_id: str, markdown: str, user: str | None
    ) -> dict[str, Any]:
        """Replace the documentation text."""
        doc = self._doc(entry_id)
        doc["markdown"] = markdown
        doc["updated_at"] = dt_util.utcnow().isoformat()
        doc["updated_by"] = user
        await self._async_save()
        return doc

    async def async_set_power(self, entry_id: str, power: dict[str, Any]) -> None:
        """Store what power on / power off do."""
        self._doc(entry_id)["power"] = power
        await self._async_save()

    async def async_set_device_display(
        self, entry_id: str, device_id: str, settings: dict[str, Any] | None
    ) -> None:
        """Store (or with None: remove) what to show for a device in a station."""
        display = self._doc(entry_id).setdefault("device_display", {})
        if settings is None:
            display.pop(device_id, None)
        else:
            display[device_id] = settings
        await self._async_save()

    async def async_add_file(
        self,
        entry_id: str,
        file_id: str,
        *,
        filename: str,
        content_type: str,
        ext: str,
        size: int,
        caption: str,
        user: str | None,
        data: bytes,
    ) -> dict[str, Any]:
        """Write a file to disk and record it."""
        record = {
            "id": file_id,
            "filename": filename,
            "content_type": content_type,
            "ext": ext,
            "size": size,
            "caption": caption,
            "uploaded_at": dt_util.utcnow().isoformat(),
            "uploaded_by": user,
        }
        path = self.file_path(entry_id, record)

        def _write() -> None:
            path.parent.mkdir(parents=True, exist_ok=True)
            tmp = path.with_suffix(path.suffix + ".part")
            tmp.write_bytes(data)
            os.replace(tmp, path)

        await self.hass.async_add_executor_job(_write)
        doc = self._doc(entry_id)
        doc["files"].append(record)
        if doc["cover"] is None and content_type.startswith("image/"):
            doc["cover"] = file_id
        await self._async_save()
        return record

    async def async_update_file(
        self, entry_id: str, file_id: str, caption: str
    ) -> dict[str, Any] | None:
        """Change the caption of a file."""
        if (record := self.get_file(entry_id, file_id)) is None:
            return None
        record["caption"] = caption
        await self._async_save()
        return record

    async def async_move_file(self, entry_id: str, file_id: str, index: int) -> bool:
        """Move a file to a new position in the gallery."""
        files = self._doc(entry_id)["files"]
        current = next((i for i, f in enumerate(files) if f["id"] == file_id), None)
        if current is None:
            return False
        record = files.pop(current)
        files.insert(max(0, min(index, len(files))), record)
        await self._async_save()
        return True

    async def async_delete_file(self, entry_id: str, file_id: str) -> bool:
        """Remove a file from disk and from the record."""
        if (record := self.get_file(entry_id, file_id)) is None:
            return False
        path = self.file_path(entry_id, record)
        await self.hass.async_add_executor_job(lambda: path.unlink(missing_ok=True))
        doc = self._doc(entry_id)
        doc["files"] = [f for f in doc["files"] if f["id"] != file_id]
        if doc["cover"] == file_id:
            doc["cover"] = next(
                (f["id"] for f in doc["files"] if f["content_type"].startswith("image/")),
                None,
            )
        await self._async_save()
        return True

    async def async_set_cover(self, entry_id: str, file_id: str | None) -> bool:
        """Choose the photo shown on the station card."""
        if file_id is not None:
            record = self.get_file(entry_id, file_id)
            if record is None or not record["content_type"].startswith("image/"):
                return False
        self._doc(entry_id)["cover"] = file_id
        await self._async_save()
        return True

    async def async_remove_station(self, entry_id: str) -> None:
        """Delete everything stored for a station."""
        folder = self.station_dir(entry_id)
        await self.hass.async_add_executor_job(
            lambda: shutil.rmtree(folder, ignore_errors=True)
        )
        if self._data.pop(entry_id, None) is not None:
            await self._async_save()
