/*
 * Stations panel for Home Assistant.
 *
 * Plain web component, no build step. Talks to the `stations/*` websocket
 * commands and the /api/stations/... upload endpoint of the integration.
 */

const I18N = {
  en: {
    power_on: "Power on",
    power_off: "Power off",
    power_is_on: "On",
    power_is_off: "Off",
    power_setup: "Set up power",
    power_settings: "Power settings",
    power_help: "Choose what Home Assistant does when this station is switched on or off. The same actions are behind the station's Power switch entity, so automations and dashboards can use them too. Scripts, scenes and buttons are run; everything else is switched on or off. To do things in a fixed order, put the steps in a script and choose that script here.",
    power_mode_none: "Not used",
    power_mode_reverse: "Switch off what Power on switched on",
    power_mode_label: "Everything in this station with the label…",
    power_mode_entities: "These entities and scripts…",
    power_pick_label: "Choose a label",
    power_search: "Search entities, scripts, scenes…",
    power_preview: (n) => `Acts on ${n} entit${n === 1 ? "y" : "ies"} right now:`,
    power_confirm_on: (name) => `Switch on ${name}?`,
    power_confirm_off: (name) => `Switch off ${name}?`,
    power_done_on: (name) => `${name} switched on`,
    power_done_off: (name) => `${name} switched off`,
    visit: "Visit",
    customize: "Choose what to show",
    device_info: "Device info",
    entities: "Entities",
    note: "Note",
    note_placeholder: "Short note shown with this device, e.g. port 3 on the switch",
    no_device_info: "Home Assistant has no address, serial number or firmware version for this device.",
    reset_default: "Back to default",
    move_up: "Move up",
    move_down: "Move down",
    cat_diagnostic: "diagnostic",
    cat_config: "configuration",
    cat_hidden: "hidden",
    field_address: "IP / web address",
    field_mac: "MAC address",
    field_ieee: "Zigbee address",
    field_serial: "Serial number",
    field_firmware: "Firmware",
    field_hardware: "Hardware version",
    short_ip: "IP",
    short_address: "Address",
    short_mac: "MAC",
    short_ieee: "Zigbee",
    short_serial: "S/N",
    short_firmware: "FW",
    short_hardware: "HW",
    copy: "Copy",
    copied: (v) => `Copied ${v}`,
    stations: "Stations",
    add_station: "Station",
    search: "Search stations, areas or devices…",
    no_stations: "No stations yet.",
    no_stations_admin: "Add a station under Settings → Devices & services, or with the button above.",
    no_match: "No station matches your search.",
    image_failed: "Photo couldn't load. Tap to retry.",
    sort: "Sort",
    sort_name: "Name",
    sort_area: "Area",
    sort_floor: "Floor",
    no_area: "No area",
    no_floor: "No floor",
    devices: "Devices",
    device_count: (n) => `${n} device${n === 1 ? "" : "s"}`,
    unavailable_count: (n) => `${n} unavailable`,
    entities_unavailable: (n) => `${n} entit${n === 1 ? "y" : "ies"} unavailable`,
    all_ok: "All available",
    problems: (n) => `${n} with problems`,
    docs: "Documentation",
    files: "Photos & files",
    file_count: (n) => `${n} file${n === 1 ? "" : "s"}`,
    back: "Back",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    write: "Write",
    preview: "Preview",
    insert_file: "Insert photo or file…",
    use_template: "Start from template",
    start_writing: "Write documentation",
    no_docs: "No documentation yet.",
    edited_by: (who, when) => `Last edited${who ? ` by ${who}` : ""} · ${when}`,
    saved: "Documentation saved",
    conflict: "Someone else saved this documentation while you were editing.",
    overwrite: "Overwrite with my version",
    reload_theirs: "Discard mine, load theirs",
    remote_changed: "This documentation was changed by someone else. Your edits are kept until you save or cancel.",
    unsaved: "You have unsaved documentation changes. Leave anyway?",
    upload: "Upload",
    drop_here: "Drop photos or files here",
    uploading: (name) => `Uploading ${name}…`,
    upload_failed: (name, why) => `Upload of ${name} failed: ${why}`,
    uploading_pct: (name, pct) => `Uploading ${name}… ${pct}%`,
    upload_summary: (ok, total, why) => `${ok} of ${total} files uploaded. ${why}`,
    err_connection: (name) => `Connection lost while uploading ${name}. Try again.`,
    err_signed_out: "You're no longer signed in. Reload the page.",
    err_too_large: (name, mb) => `${name} is larger than ${mb} MB`,
    err_wrong_type: (name) => `${name} can't be added: only photos (JPEG, PNG, GIF, WebP), PDF and plain text files are allowed`,
    no_files: "No photos or files yet. Upload photos of the station, wiring diagrams or datasheets.",
    caption: "Caption",
    set_cover: "Use as cover",
    is_cover: "Cover photo",
    open_original: "Open original",
    delete: "Delete",
    confirm_delete_file: (name) => `Delete "${name}"? This cannot be undone.`,
    move_left: "Move left",
    move_right: "Move right",
    uploaded_by: (who, when) => `Uploaded${who ? ` by ${who}` : ""} · ${when}`,
    add_member: "Add",
    add_device_title: "Add a device to this station",
    add_entity_title: "Add a single entity",
    search_devices: "Search devices…",
    search_entities: "Search entities…",
    tab_devices: "Devices",
    tab_entities: "Entities",
    in_station: (name) => `in ${name}`,
    remove_member: "Remove from station",
    confirm_remove: (name, label) => `Remove "${name}" from this station? This removes the label "${label}" from it.`,
    other_entities: "Separate entities",
    more_entities: (n) => `${n} more`,
    no_members: "No devices yet.",
    no_members_hint: (label) => `Give a device the label "${label}" to add it to this station.`,
    online: "Available",
    offline: "Unavailable",
    partly: "Partly unavailable",
    no_entities: "No entities",
    label_missing: "The label of this station was deleted. Choose a new label in the station's integration options.",
    rename: "Rename",
    rename_prompt: "New name for the station",
    device_page: "Device page",
    label: "Label",
    station_settings: "Integration settings",
    not_found: "This station does not exist (anymore).",
    loading: "Loading…",
    template: `## Purpose
What this station is for.

## Location
Where it stands and how to reach it.

## Power
| Circuit | Breaker | Notes |
|---|---|---|
|  |  |  |

## Network
| Device | IP address | MAC | Notes |
|---|---|---|---|
|  |  |  |  |

## Maintenance
-

## Contacts
-

## Changelog
- ${new Date().toISOString().slice(0, 10)}: Station documented.
`,
  },
  nl: {
    power_on: "Aanzetten",
    power_off: "Uitzetten",
    power_is_on: "Aan",
    power_is_off: "Uit",
    power_setup: "Aan/uit instellen",
    power_settings: "Aan/uit-instellingen",
    power_help: "Kies wat Home Assistant doet als dit station aan- of uitgezet wordt. Dezelfde acties zitten achter de Voeding-schakelaar van het station, zodat automatiseringen en dashboards ze ook kunnen gebruiken. Scripts, scènes en knoppen worden uitgevoerd; al het andere wordt aan- of uitgeschakeld. Moet het in een vaste volgorde? Zet de stappen in een script en kies dat script hier.",
    power_mode_none: "Niet gebruikt",
    power_mode_reverse: "Uitzetten wat Aanzetten heeft aangezet",
    power_mode_label: "Alles in dit station met het label…",
    power_mode_entities: "Deze entiteiten en scripts…",
    power_pick_label: "Kies een label",
    power_search: "Zoek entiteiten, scripts, scènes…",
    power_preview: (n) => `Werkt nu op ${n} entiteit${n === 1 ? "" : "en"}:`,
    power_confirm_on: (name) => `${name} aanzetten?`,
    power_confirm_off: (name) => `${name} uitzetten?`,
    power_done_on: (name) => `${name} is aangezet`,
    power_done_off: (name) => `${name} is uitgezet`,
    visit: "Bezoeken",
    customize: "Kies wat je ziet",
    device_info: "Apparaatgegevens",
    entities: "Entiteiten",
    note: "Notitie",
    note_placeholder: "Korte notitie bij dit apparaat, bijv. poort 3 op de switch",
    no_device_info: "Home Assistant kent geen adres, serienummer of firmwareversie voor dit apparaat.",
    reset_default: "Terug naar standaard",
    move_up: "Omhoog",
    move_down: "Omlaag",
    cat_diagnostic: "diagnose",
    cat_config: "configuratie",
    cat_hidden: "verborgen",
    field_address: "IP- / webadres",
    field_mac: "MAC-adres",
    field_ieee: "Zigbee-adres",
    field_serial: "Serienummer",
    field_firmware: "Firmware",
    field_hardware: "Hardwareversie",
    short_ip: "IP",
    short_address: "Adres",
    short_mac: "MAC",
    short_ieee: "Zigbee",
    short_serial: "S/N",
    short_firmware: "FW",
    short_hardware: "HW",
    copy: "Kopiëren",
    copied: (v) => `${v} gekopieerd`,
    stations: "Stations",
    add_station: "Station",
    search: "Zoek op station, ruimte of apparaat…",
    no_stations: "Nog geen stations.",
    no_stations_admin: "Voeg een station toe via Instellingen → Apparaten & diensten, of met de knop hierboven.",
    no_match: "Geen station gevonden.",
    image_failed: "Foto kon niet laden. Tik om opnieuw te proberen.",
    sort: "Sorteren",
    sort_name: "Naam",
    sort_area: "Ruimte",
    sort_floor: "Verdieping",
    no_area: "Geen ruimte",
    no_floor: "Geen verdieping",
    devices: "Apparaten",
    device_count: (n) => `${n} apparaat${n === 1 ? "" : "en"}`,
    unavailable_count: (n) => `${n} onbereikbaar`,
    entities_unavailable: (n) => `${n} entiteit${n === 1 ? "" : "en"} onbereikbaar`,
    all_ok: "Alles bereikbaar",
    problems: (n) => `${n} met problemen`,
    docs: "Documentatie",
    files: "Foto's & bestanden",
    file_count: (n) => `${n} bestand${n === 1 ? "" : "en"}`,
    back: "Terug",
    edit: "Bewerken",
    save: "Opslaan",
    cancel: "Annuleren",
    write: "Schrijven",
    preview: "Voorbeeld",
    insert_file: "Foto of bestand invoegen…",
    use_template: "Begin met sjabloon",
    start_writing: "Documentatie schrijven",
    no_docs: "Nog geen documentatie.",
    edited_by: (who, when) => `Laatst bewerkt${who ? ` door ${who}` : ""} · ${when}`,
    saved: "Documentatie opgeslagen",
    conflict: "Iemand anders heeft deze documentatie opgeslagen terwijl jij aan het bewerken was.",
    overwrite: "Overschrijven met mijn versie",
    reload_theirs: "Mijn versie weggooien, die van hen laden",
    remote_changed: "Deze documentatie is door iemand anders gewijzigd. Jouw wijzigingen blijven staan tot je opslaat of annuleert.",
    unsaved: "Je hebt niet-opgeslagen wijzigingen. Toch verlaten?",
    upload: "Uploaden",
    drop_here: "Sleep foto's of bestanden hierheen",
    uploading: (name) => `${name} uploaden…`,
    upload_failed: (name, why) => `Uploaden van ${name} mislukt: ${why}`,
    uploading_pct: (name, pct) => `${name} uploaden… ${pct}%`,
    upload_summary: (ok, total, why) => `${ok} van ${total} bestanden geüpload. ${why}`,
    err_connection: (name) => `Verbinding verbroken tijdens het uploaden van ${name}. Probeer het opnieuw.`,
    err_signed_out: "Je bent niet meer ingelogd. Laad de pagina opnieuw.",
    err_too_large: (name, mb) => `${name} is groter dan ${mb} MB`,
    err_wrong_type: (name) => `${name} kan niet worden toegevoegd: alleen foto's (JPEG, PNG, GIF, WebP), PDF en tekstbestanden`,
    no_files: "Nog geen foto's of bestanden. Upload foto's van het station, aansluitschema's of datasheets.",
    caption: "Bijschrift",
    set_cover: "Als omslagfoto",
    is_cover: "Omslagfoto",
    open_original: "Origineel openen",
    delete: "Verwijderen",
    confirm_delete_file: (name) => `"${name}" verwijderen? Dit kan niet ongedaan worden.`,
    move_left: "Naar links",
    move_right: "Naar rechts",
    uploaded_by: (who, when) => `Geüpload${who ? ` door ${who}` : ""} · ${when}`,
    add_member: "Toevoegen",
    add_device_title: "Apparaat aan dit station toevoegen",
    add_entity_title: "Losse entiteit toevoegen",
    search_devices: "Zoek apparaten…",
    search_entities: "Zoek entiteiten…",
    tab_devices: "Apparaten",
    tab_entities: "Entiteiten",
    in_station: (name) => `in ${name}`,
    remove_member: "Uit station verwijderen",
    confirm_remove: (name, label) => `"${name}" uit dit station halen? Het label "${label}" wordt eraf gehaald.`,
    other_entities: "Losse entiteiten",
    more_entities: (n) => `nog ${n}`,
    no_members: "Nog geen apparaten.",
    no_members_hint: (label) => `Geef een apparaat het label "${label}" om het aan dit station toe te voegen.`,
    online: "Bereikbaar",
    offline: "Onbereikbaar",
    partly: "Deels onbereikbaar",
    no_entities: "Geen entiteiten",
    label_missing: "Het label van dit station is verwijderd. Kies een nieuw label in de opties van de integratie.",
    rename: "Naam wijzigen",
    rename_prompt: "Nieuwe naam voor het station",
    device_page: "Apparaatpagina",
    label: "Label",
    station_settings: "Integratie-instellingen",
    not_found: "Dit station bestaat niet (meer).",
    loading: "Laden…",
    template: `## Doel
Waar dit station voor is.

## Locatie
Waar het staat en hoe je erbij komt.

## Voeding
| Groep | Automaat | Opmerkingen |
|---|---|---|
|  |  |  |

## Netwerk
| Apparaat | IP-adres | MAC | Opmerkingen |
|---|---|---|---|
|  |  |  |  |

## Onderhoud
-

## Contactpersonen
-

## Wijzigingen
- ${new Date().toISOString().slice(0, 10)}: Station gedocumenteerd.
`,
  },
};

const LABEL_COLORS = {
  primary: "var(--primary-color)", accent: "var(--accent-color)",
  red: "#f44336", pink: "#e91e63", purple: "#926bc7", "deep-purple": "#6e41ab",
  indigo: "#3f51b5", blue: "#2196f3", "light-blue": "#03a9f4", cyan: "#00bcd4",
  teal: "#009688", green: "#4caf50", "light-green": "#8bc34a", lime: "#cddc39",
  yellow: "#ffeb3b", amber: "#ffc107", orange: "#ff9800", "deep-orange": "#ff5722",
  brown: "#795548", "light-grey": "#bdbdbd", grey: "#9e9e9e", "dark-grey": "#606060",
  "blue-grey": "#607d8b", black: "#000000", white: "#ffffff",
};

const MAX_IMAGE_EDGE = 2560;
const MAX_UPLOAD_MB = 15;
const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"];

class UploadError extends Error {}

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const labelColor = (color) => (!color ? "var(--primary-color)" : LABEL_COLORS[color] || color);

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/* ---------------------------------------------------------------- markdown
 * Small, safe Markdown renderer. Used when Home Assistant's own <ha-markdown>
 * element cannot be loaded. Everything is escaped first; only http(s),
 * relative and mailto URLs survive.
 */
const safeUrl = (url) => {
  const u = url.trim();
  return /^(https?:\/\/|\/|#|mailto:)/i.test(u) ? u : "#";
};

const inlineMd = (text) => {
  const codes = [];
  let out = esc(text).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener">${label}</a>`)
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener">${url}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
};

const renderMarkdown = (src) => {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let i = 0;
  const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
  const cells = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const body = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      i++;
      html.push(`<pre><code>${esc(body.join("\n"))}</code></pre>`);
      continue;
    }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      html.push(`<h${m[1].length}>${inlineMd(m[2])}</h${m[1].length}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      html.push("<hr>");
      i++;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ""));
      html.push(`<blockquote>${renderMarkdown(body.join("\n"))}</blockquote>`);
      continue;
    }
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++]));
      html.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${head.map((_, k) => `<td>${inlineMd(r[k] ?? "")}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`
      );
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) {
        let item = lines[i++].replace(/^\s*([-*+]|\d+[.)])\s+/, "");
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) item += " " + lines[i++].trim();
        const task = item.match(/^\[( |x|X)\]\s+(.*)$/);
        items.push(task ? `<li class="task"><input type="checkbox" disabled ${task[1] === " " ? "" : "checked"}> ${inlineMd(task[2])}</li>` : `<li>${inlineMd(item)}</li>`);
      }
      html.push(ordered ? `<ol>${items.join("")}</ol>` : `<ul>${items.join("")}</ul>`);
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|\s*```|\s*>|\s*([-*+]|\d+[.)])\s+)/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))
    )
      para.push(inlineMd(lines[i++]));
    html.push(`<p>${para.join("<br>")}</p>`);
  }
  return html.join("\n");
};

let haMarkdownPromise;
const ensureHaMarkdown = () => {
  if (customElements.get("ha-markdown")) return Promise.resolve(true);
  if (!haMarkdownPromise) {
    haMarkdownPromise = (async () => {
      try {
        const helpers = await window.loadCardHelpers?.();
        helpers?.createCardElement({ type: "markdown", content: " " });
        await Promise.race([customElements.whenDefined("ha-markdown"), new Promise((r) => setTimeout(r, 4000))]);
      } catch (err) {
        /* fall back to the built-in renderer */
      }
      return Boolean(customElements.get("ha-markdown"));
    })();
  }
  return haMarkdownPromise;
};

/* ----------------------------------------------------------------- styles */
const STYLES = `
:host {
  display: block;
  min-height: 100vh;
  background: var(--primary-background-color);
  color: var(--primary-text-color);
  font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
  --st-radius: var(--ha-card-border-radius, 12px);
  --st-ok: var(--success-color, #43a047);
  --st-bad: var(--error-color, #db4437);
  --st-warn: var(--warning-color, #ffa600);
  --st-muted: var(--secondary-text-color);
  --st-line: var(--divider-color, rgba(0,0,0,.12));
  --st-card: var(--card-background-color, var(--ha-card-background, #fff));
  --st-chip: var(--secondary-background-color, rgba(127,127,127,.12));
}
* { box-sizing: border-box; }
a { color: var(--primary-color); }
button { font: inherit; color: inherit; }
ha-icon { --mdc-icon-size: 20px; flex: none; }

.toolbar {
  position: sticky; top: 0; z-index: 4;
  display: flex; align-items: center; gap: 4px;
  height: var(--header-height, 56px); padding: 0 12px 0 4px;
  background: var(--app-header-background-color, var(--primary-color));
  color: var(--app-header-text-color, var(--text-primary-color, #fff));
  border-bottom: var(--app-header-border-bottom, none);
}
.toolbar .title { flex: 1; min-width: 0; font-size: 20px; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 8px; }
.toolbar .title small { display: block; font-size: 12px; opacity: .8; margin-top: -2px; }
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%; border: 0; background: none; cursor: pointer; color: inherit;
}
.icon-btn:hover { background: rgba(127,127,127,.15); }
.icon-btn ha-icon { --mdc-icon-size: 22px; }
.toolbar .tb-btn {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px 0 10px;
  border-radius: 18px; border: 1px solid color-mix(in srgb, currentColor 35%, transparent); background: none; color: inherit; cursor: pointer; font-weight: 500;
}
.toolbar .tb-btn:hover { background: color-mix(in srgb, currentColor 10%, transparent); }

.content { max-width: 1400px; margin: 0 auto; padding: 16px; }

.btn {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px;
  border-radius: 18px; border: 0; cursor: pointer; font-weight: 500; font-size: 14px;
  background: var(--primary-color); color: var(--text-primary-color, #fff); white-space: nowrap;
}
.btn.text { background: none; color: var(--primary-color); padding: 0 10px; }
.btn.text:hover { background: rgba(127,127,127,.12); }
.btn.outline { background: none; color: var(--primary-color); border: 1px solid var(--st-line); }
.btn.danger { background: none; color: var(--st-bad); }
.btn[disabled] { opacity: .5; cursor: default; }
.btn ha-icon { --mdc-icon-size: 18px; }

.card { background: var(--st-card); border-radius: var(--st-radius); box-shadow: var(--ha-card-box-shadow, none); border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--st-line)); }
.card-head { display: flex; align-items: center; gap: 8px; padding: 12px 12px 8px 16px; min-height: 52px; }
.card-head h2 { flex: 1; margin: 0; font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
.card-head h2 .count { color: var(--st-muted); font-weight: 400; }
.card-body { padding: 0 16px 16px; }
.muted { color: var(--st-muted); }
.small { font-size: 12px; }
.empty { padding: 24px 16px; text-align: center; color: var(--st-muted); }
.empty .btn { margin: 12px 4px 0; }

.banner { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 10px; margin-bottom: 12px; line-height: 1.4; font-size: 14px; }
.banner.warn { background: color-mix(in srgb, var(--st-warn) 18%, transparent); }
.banner.bad { background: color-mix(in srgb, var(--st-bad) 14%, transparent); }
.banner .actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }

/* -------- list view */
.list-top { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px; }
.search {
  flex: 1 1 320px; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 14px;
  background: var(--st-card); border: 1px solid var(--st-line); border-radius: 22px;
}
.search input { flex: 1; border: 0; outline: 0; background: none; font: inherit; font-size: 15px; color: inherit; min-width: 0; }
.stats { display: flex; gap: 8px; flex-wrap: wrap; }
.stat { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; background: var(--st-chip); font-size: 13px; }
.stat.bad { background: color-mix(in srgb, var(--st-bad) 16%, transparent); color: var(--st-bad); font-weight: 500; }

.sort {
  display: flex; align-items: center; gap: 6px; height: 44px; padding: 0 6px 0 14px;
  background: var(--st-card); border: 1px solid var(--st-line); border-radius: 22px;
}
.sort select { border: 0; outline: 0; background: none; font: inherit; font-size: 15px; color: inherit; height: 100%; cursor: pointer; }
.sort select option { color: var(--primary-text-color); background: var(--card-background-color); }
.group-head { display: flex; align-items: center; gap: 8px; margin: 24px 0 10px; font-size: 15px; font-weight: 500; color: var(--st-muted); }
.group-head:first-child { margin-top: 0; }
.group-head .count { font-weight: 400; }
.img-failed {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; text-align: center; font-size: 12px; color: var(--st-muted); background: var(--st-chip); cursor: pointer;
}
.img-failed ha-icon { --mdc-icon-size: 32px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.station-card { display: flex; flex-direction: column; overflow: hidden; cursor: pointer; text-decoration: none; color: inherit; transition: box-shadow .15s, transform .15s; }
.station-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,.15); transform: translateY(-1px); }
.station-card:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
.cover { position: relative; aspect-ratio: 16 / 9; background: var(--st-chip); overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover .placeholder { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.cover .placeholder ha-icon { --mdc-icon-size: 56px; opacity: .55; }
.cover .status-pill { position: absolute; top: 10px; right: 10px; }
.station-card .info { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 4px; }
.station-card .name { font-size: 16px; font-weight: 500; }
.station-card .meta { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; color: var(--st-muted); }
.station-card .meta span { display: inline-flex; align-items: center; gap: 4px; }
.station-card .meta ha-icon { --mdc-icon-size: 16px; }
.station-card .match { font-size: 12px; color: var(--primary-color); }

.status-pill { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: var(--st-card); color: var(--st-ok); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.status-pill.bad { background: var(--st-bad); color: #fff; }
.status-pill ha-icon { --mdc-icon-size: 14px; }

/* -------- detail view */
.detail { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr) minmax(320px, 420px); align-items: start; }
.detail > .main-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.detail > .devices { position: sticky; top: calc(var(--header-height, 56px) + 16px); max-height: calc(100vh - var(--header-height, 56px) - 32px); overflow-y: auto; }
@media (max-width: 1000px) {
  .detail { grid-template-columns: minmax(0, 1fr); }
  .detail > .devices { position: static; order: -1; max-height: none; overflow: visible; }
}
.label-chip { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 10px 0 8px; border-radius: 12px; font-size: 12px; font-weight: 500; color: #fff; }
.label-chip ha-icon { --mdc-icon-size: 14px; }
.hero { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-bottom: 16px; }
.hero .facts { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; flex: 1; }
.hero .actions { display: flex; gap: 4px; flex-wrap: wrap; }

/* devices */
.dev { border-top: 1px solid var(--st-line); padding: 10px 12px 10px 16px; }
.dev:first-child { border-top: 0; }
.dev-row { display: flex; align-items: flex-start; gap: 10px; }
.dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; flex: none; background: var(--st-muted); }
.dot.ok { background: var(--st-ok); }
.dot.bad { background: var(--st-bad); }
.dot.partly { background: var(--st-warn); }
.dev-main { flex: 1; min-width: 0; }
.dev-name { font-weight: 500; color: inherit; text-decoration: none; display: block; overflow-wrap: anywhere; }
.dev-name:hover { text-decoration: underline; }
.dev-sub { font-size: 12px; color: var(--st-muted); margin-top: 1px; overflow-wrap: anywhere; }
.dev-status { font-size: 12px; color: var(--st-muted); white-space: nowrap; margin-top: 2px; }
.dev-status.bad { color: var(--st-bad); }
.dev-status.partly { color: var(--st-warn); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0 20px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px; max-width: 100%; min-height: 28px; padding: 3px 10px 3px 8px;
  border-radius: 14px; background: var(--st-chip); border: 0; cursor: pointer; font-size: 12px; text-align: left;
}
.chip:hover { filter: brightness(.95); }
.chip ha-icon, .chip ha-state-icon { --mdc-icon-size: 16px; color: var(--state-icon-color, var(--st-muted)); }
.chip .cname { color: var(--st-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
.chip .cstate { font-weight: 500; white-space: nowrap; }
.chip.unavailable .cstate { color: var(--st-bad); }
details.more { margin: 6px 0 0 20px; }
details.more summary { cursor: pointer; font-size: 12px; color: var(--primary-color); list-style: none; display: inline-flex; align-items: center; gap: 2px; }
details.more summary::-webkit-details-marker { display: none; }
details.more .chips { margin-left: 0; }
.remove-btn { opacity: 0; transition: opacity .15s; }
.dev:hover .remove-btn, .remove-btn:focus-visible { opacity: 1; }
@media (hover: none) { .remove-btn { opacity: 1; } }
.visit { display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 8px; margin-top: -3px; border-radius: 13px; font-size: 12px; font-weight: 500; color: var(--primary-color); text-decoration: none; white-space: nowrap; flex: none; }
.visit:hover { background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
.visit ha-icon { --mdc-icon-size: 14px; }
@media (max-width: 420px) { .visit span { display: none; } }
.dev-info { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 6px 0 0 20px; font-size: 13px; }
.kv { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.kv .k { color: var(--st-muted); font-size: 12px; }
.kv .v, .kv a { font-family: var(--ha-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: 13px; overflow-wrap: anywhere; }
.kv .copy { border: 0; background: none; padding: 2px; cursor: pointer; color: var(--st-muted); display: inline-flex; border-radius: 4px; opacity: .6; }
.kv .copy:hover { opacity: 1; background: var(--st-chip); }
.kv .copy ha-icon { --mdc-icon-size: 14px; }
.dev-note { display: flex; gap: 6px; align-items: flex-start; margin: 6px 0 0 20px; font-size: 13px; color: var(--st-muted); white-space: pre-wrap; overflow-wrap: anywhere; }
.dev-note ha-icon { --mdc-icon-size: 16px; margin-top: 1px; }
.dev.configuring { background: color-mix(in srgb, var(--primary-color) 5%, transparent); }
.remove-btn.active { opacity: 1; color: var(--primary-color); }
.dev-config { margin: 8px 0 4px 20px; }
.cfg-title { font-weight: 500; font-size: 14px; margin-bottom: 4px; }
.cfg-group { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--st-muted); margin: 12px 0 4px; }
.cfg-row { display: flex; align-items: center; gap: 8px; min-height: 32px; font-size: 13px; }
.cfg-row input[type=checkbox] { width: 16px; height: 16px; accent-color: var(--primary-color); flex: none; margin: 0; }
.cfg-check { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; cursor: pointer; }
label.cfg-row { cursor: pointer; }
.cfg-name { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.cfg-tag { font-size: 10px; padding: 1px 6px; border-radius: 8px; background: var(--st-chip); color: var(--st-muted); white-space: nowrap; }
.cfg-val { color: var(--st-muted); font-size: 12px; white-space: nowrap; max-width: 40%; overflow: hidden; text-overflow: ellipsis; }
.cfg-move { display: inline-flex; width: 64px; flex: none; justify-content: flex-end; }
.cfg-move .icon-btn { width: 28px; height: 28px; }
.cfg-move .icon-btn ha-icon { --mdc-icon-size: 16px; }
.cfg-move .icon-btn[disabled] { opacity: .3; cursor: default; }
.cfg-empty { padding: 4px 0; }
.cfg-note { width: 100%; height: 36px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--st-line); background: var(--st-card); color: inherit; font: inherit; font-size: 13px; }
.cfg-actions { display: flex; align-items: center; gap: 4px; margin-top: 12px; }
.cfg-actions .push { flex: 1; }
.power-bar { display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-right: 8px; }
.power-state { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px; border-radius: 14px; font-size: 13px; font-weight: 500; background: var(--st-chip); color: var(--st-muted); }
.power-state.on { background: color-mix(in srgb, var(--st-ok) 16%, transparent); color: var(--st-ok); }
.power-state ha-icon { --mdc-icon-size: 16px; }
.btn.outline.power-off { color: var(--st-bad); }
.power-config { margin-bottom: 16px; }
.pw-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.pw-side { border: 1px solid var(--st-line); border-radius: 10px; padding: 12px 14px; }
.pw-side h3 { margin: 0 0 8px; font-size: 15px; font-weight: 500; display: flex; align-items: center; gap: 6px; }
.pw-radio { display: flex; align-items: flex-start; gap: 8px; padding: 5px 0; font-size: 14px; cursor: pointer; }
.pw-radio input { margin: 3px 0 0; accent-color: var(--primary-color); }
.pw-body { margin: 6px 0 0 24px; }
.pw-select, .pw-search { width: 100%; height: 38px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--st-line); background: var(--st-card); color: inherit; font: inherit; font-size: 14px; }
.pw-selected { display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
.pw-item { display: flex; align-items: center; gap: 6px; padding: 4px 4px 4px 10px; border-radius: 8px; background: var(--st-chip); font-size: 13px; }
.pw-item > span { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pw-item small { color: var(--st-muted); font-size: 11px; overflow-wrap: anywhere; }
.pw-item .icon-btn { width: 28px; height: 28px; }
.pw-item .icon-btn ha-icon { --mdc-icon-size: 16px; }
.pw-results .result { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border: 0; border-radius: 8px; background: none; cursor: pointer; text-align: left; font-size: 13px; }
.pw-results .result:hover { background: var(--st-chip); }
.pw-results .r-sub { font-size: 11px; color: var(--st-muted); }
.pw-preview { margin: 10px 0 0 24px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.pw-preview .muted { width: 100%; margin-bottom: 2px; }
.pw-chip { font-size: 12px; padding: 2px 8px; border-radius: 10px; background: var(--st-chip); }
.sub-head { padding: 10px 16px 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; color: var(--st-muted); border-top: 1px solid var(--st-line); }

.picker { border-top: 1px solid var(--st-line); padding: 12px 16px 16px; background: color-mix(in srgb, var(--primary-color) 5%, transparent); }
.picker .tabs { display: flex; gap: 4px; margin-bottom: 8px; }
.picker .tab { border: 0; background: none; padding: 6px 12px; border-radius: 16px; cursor: pointer; font-size: 13px; }
.picker .tab.active { background: var(--primary-color); color: var(--text-primary-color, #fff); }
.picker input { width: 100%; height: 40px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--st-line); background: var(--st-card); color: inherit; font: inherit; }
.picker .results { max-height: 320px; overflow: auto; margin-top: 8px; }
.picker .result { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px; border: 0; border-radius: 8px; background: none; cursor: pointer; text-align: left; }
.picker .result:hover { background: var(--st-chip); }
.picker .result .r-main { flex: 1; min-width: 0; }
.picker .result .r-sub { font-size: 12px; color: var(--st-muted); }
.picker .result .r-tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: var(--st-chip); color: var(--st-muted); white-space: nowrap; }

/* docs */
.md { line-height: 1.6; font-size: 15px; overflow-wrap: break-word; }
.md h1, .md h2, .md h3, .md h4 { line-height: 1.3; margin: 1.2em 0 .4em; }
.md > :first-child { margin-top: 0; }
.md h1 { font-size: 1.5em; } .md h2 { font-size: 1.25em; } .md h3 { font-size: 1.1em; }
.md img { max-width: 100%; max-height: 520px; border-radius: 8px; }
.md code { background: var(--st-chip); padding: 1px 5px; border-radius: 4px; font-size: .9em; }
.md pre { background: var(--st-chip); padding: 10px 12px; border-radius: 8px; overflow: auto; }
.md pre code { background: none; padding: 0; }
.md blockquote { margin: .8em 0; padding: .2em 1em; border-left: 3px solid var(--primary-color); color: var(--st-muted); }
.md .table-wrap { overflow-x: auto; }
.md table { border-collapse: collapse; margin: .6em 0; font-size: 14px; }
.md th, .md td { border: 1px solid var(--st-line); padding: 6px 10px; text-align: left; vertical-align: top; }
.md th { background: var(--st-chip); font-weight: 500; }
.md li.task { list-style: none; margin-left: -1.2em; }
.md hr { border: 0; border-top: 1px solid var(--st-line); }
.doc-foot { margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--st-line); font-size: 12px; color: var(--st-muted); }

.editor-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 -4px 8px; padding: 6px 4px; position: sticky; top: var(--header-height, 56px); z-index: 2; background: var(--st-card); }
.seg { display: inline-flex; border: 1px solid var(--st-line); border-radius: 18px; overflow: hidden; }
.seg button { border: 0; background: none; padding: 6px 14px; cursor: pointer; font-size: 13px; }
.seg button.active { background: var(--primary-color); color: var(--text-primary-color, #fff); }
.editor-bar select { flex: 1 1 140px; max-width: 240px; min-width: 0; height: 34px; border-radius: 17px; border: 1px solid var(--st-line); background: var(--st-card); color: inherit; padding: 0 10px; font: inherit; font-size: 13px; }
.editor-bar .push { margin-left: auto; }
textarea.editor {
  display: block; width: 100%; min-height: 360px; resize: vertical; padding: 12px; overflow: hidden;
  font-family: var(--ha-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: 14px; line-height: 1.5;
  border: 1px solid var(--st-line); border-radius: 8px; background: var(--st-card); color: inherit; tab-size: 2;
}
textarea.editor:focus { outline: 2px solid var(--primary-color); outline-offset: -1px; }
.editor-preview { min-height: 360px; padding: 12px; border: 1px dashed var(--st-line); border-radius: 8px; }
.editor-hint { font-size: 12px; color: var(--st-muted); margin-top: 6px; }

/* files */
.files .card-body { position: relative; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.tile { position: relative; border-radius: 10px; overflow: hidden; background: var(--st-chip); border: 0; padding: 0; cursor: pointer; aspect-ratio: 4 / 3; display: block; width: 100%; }
.tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tile .doc { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 10px; text-align: center; font-size: 12px; overflow-wrap: anywhere; }
.tile .doc ha-icon { --mdc-icon-size: 40px; color: var(--st-muted); }
.tile .cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 8px 6px; font-size: 12px; color: #fff; text-align: left; background: linear-gradient(transparent, rgba(0,0,0,.65)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tile .star { position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,.5); color: #ffd54f; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.tile .star ha-icon { --mdc-icon-size: 15px; }
.tile.pending { display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--st-muted); cursor: default; padding: 8px; text-align: center; }
.dropzone { position: absolute; inset: 0; border: 2px dashed var(--primary-color); border-radius: var(--st-radius); background: color-mix(in srgb, var(--primary-color) 10%, var(--st-card)); display: none; align-items: center; justify-content: center; font-weight: 500; color: var(--primary-color); z-index: 2; }
.files.dragging .dropzone { display: flex; }

/* lightbox */
.lightbox { position: fixed; inset: 0; z-index: 10; background: rgba(0,0,0,.96); color: #fff; display: flex; flex-direction: column; }
.lb-top { display: flex; align-items: center; gap: 4px; padding: 8px; }
.lb-top .lb-title { flex: 1; min-width: 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-left: 8px; }
.lb-stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative; padding: 0 56px; }
.lb-stage img { max-width: 100%; max-height: 100%; object-fit: contain; }
.lb-stage .doc { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.lb-stage .doc ha-icon { --mdc-icon-size: 72px; }
.lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,.12); }
.lb-nav.prev { left: 8px; } .lb-nav.next { right: 8px; }
.lb-bottom { padding: 10px 16px 16px; display: flex; flex-direction: column; gap: 8px; max-width: 900px; width: 100%; margin: 0 auto; }
.lb-bottom input { width: 100%; height: 40px; padding: 0 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.08); color: #fff; font: inherit; }
.lb-bottom .lb-meta { font-size: 12px; opacity: .7; }
.lb-bottom .lb-actions { display: flex; flex-wrap: wrap; gap: 4px; }
.lightbox .btn.text { color: #fff; }
.lightbox .btn.danger { color: #ff8a80; }

.loading { padding: 48px; text-align: center; color: var(--st-muted); }
`;

/* ------------------------------------------------------------------ panel */
class StationsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._view = null; // { name: "list" } | { name: "detail", id }
    this._list = null;
    this._detail = null;
    this._search = "";
    this._sort = "name";
    try {
      const saved = localStorage.getItem("stations.sort");
      if (["name", "area", "floor"].includes(saved)) this._sort = saved;
    } catch (e) {
      /* storage unavailable: keep the default */
    }
    this._editing = false;
    this._editMode = "write";
    this._draft = "";
    this._draftBase = null;
    this._remoteChanged = false;
    this._conflict = false;
    this._picker = null; // { tab, query }
    this._devConfig = null; // { deviceId, entities: [], fields: Set, note }
    this._openMore = new Set();
    this._lightbox = null; // file id
    this._uploads = [];
    this._uploadSeq = 0;
    this._loadToken = 0;
    this._useHaMarkdown = false;
    this._onBeforeUnload = (e) => {
      if (this._isDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    this._onKey = (e) => this._handleKey(e);
  }

  /* --- properties set by Home Assistant */
  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!old) {
      this._lang = (hass.locale?.language || hass.language || "en").toLowerCase().startsWith("nl") ? "nl" : "en";
      this._maybeStart();
      return;
    }
    if (old.states !== hass.states) this._updateLive(old);
    const menu = this.shadowRoot.querySelector("ha-menu-button");
    if (menu) menu.hass = hass;
  }
  get hass() {
    return this._hass;
  }
  set narrow(value) {
    this._narrow = value;
    const menu = this.shadowRoot.querySelector("ha-menu-button");
    if (menu) menu.narrow = value;
  }
  set route(route) {
    this._route = route;
    const id = (route?.path || "").replace(/^\//, "").split("/")[0];
    const next = id ? { name: "detail", id } : { name: "list" };
    if (this._view && this._view.name === next.name && this._view.id === next.id) return;
    if (this._isDirty() && this._view && !confirm(this.t("unsaved"))) {
      // Put the old URL back.
      history.replaceState(null, "", `/${this._panelPath()}${this._view.id ? `/${this._view.id}` : ""}`);
      return;
    }
    this._view = next;
    this._resetDetailState();
    this._maybeStart();
  }
  set panel(panel) {
    this._panel = panel;
  }

  t(key, ...args) {
    const dict = I18N[this._lang] || I18N.en;
    const value = dict[key] ?? I18N.en[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
  }

  connectedCallback() {
    window.addEventListener("beforeunload", this._onBeforeUnload);
    window.addEventListener("keydown", this._onKey);
    this._connected = true;
    this._maybeStart();
  }

  disconnectedCallback() {
    window.removeEventListener("beforeunload", this._onBeforeUnload);
    window.removeEventListener("keydown", this._onKey);
    this._connected = false;
    this._unsub?.then((unsub) => unsub()).catch(() => {});
    this._unsub = null;
  }

  _panelPath() {
    return this._panel?.url_path || "stations";
  }

  _resetDetailState() {
    this._detail = null;
    this._editing = false;
    this._editMode = "write";
    this._draft = "";
    this._remoteChanged = false;
    this._conflict = false;
    this._picker = null;
    this._devConfig = null;
    this._powerEdit = null;
    this._lightbox = null;
    this._notFound = false;
  }

  async _maybeStart() {
    if (!this._hass || !this._connected || !this._view) return;
    if (!this._styled) {
      this._styled = true;
      this.shadowRoot.innerHTML = `<style>${STYLES}</style><div id="root"></div>`;
      this.shadowRoot.addEventListener("click", (e) => this._handleClick(e));
      this.shadowRoot.addEventListener("input", (e) => this._handleInput(e));
      this.shadowRoot.addEventListener("change", (e) => this._handleChange(e));
      // "error" doesn't bubble, so listen in the capture phase for failed images.
      this.shadowRoot.addEventListener("error", (e) => this._imageFailed(e.target), true);
      this.shadowRoot.addEventListener("dragover", (e) => this._handleDrag(e, true));
      this.shadowRoot.addEventListener("dragleave", (e) => this._handleDrag(e, false));
      this.shadowRoot.addEventListener("drop", (e) => this._handleDrop(e));
      this.shadowRoot.addEventListener("error", (e) => this._handleImgError(e), true);
      this.shadowRoot.addEventListener(
        "toggle",
        (e) => {
          const id = e.target?.dataset?.devMore;
          if (!id) return;
          if (e.target.open) this._openMore.add(id);
          else this._openMore.delete(id);
        },
        true
      );
      ensureHaMarkdown().then((ok) => {
        this._useHaMarkdown = ok;
        if (this._view?.name === "detail" && this._detail) this._renderDocs();
      });
    }
    if (!this._unsub) {
      this._unsub = this._hass.connection.subscribeMessage((msg) => this._onRemoteChange(msg), { type: "stations/subscribe" });
      this._unsub.catch(() => (this._unsub = null));
    }
    this._render();
    this._load();
  }

  /* --- data */
  _ws(type, data = {}) {
    return this._hass.callWS({ type, ...data });
  }

  async _load() {
    const token = ++this._loadToken;
    const view = this._view;
    try {
      if (view.name === "list") {
        const list = await this._ws("stations/list");
        if (token !== this._loadToken) return;
        this._list = list;
      } else {
        const detail = await this._ws("stations/get", { entry_id: view.id });
        if (token !== this._loadToken) return;
        this._detail = detail;
        this._notFound = false;
      }
    } catch (err) {
      if (token !== this._loadToken) return;
      if (view.name === "detail" && err?.code === "not_found") this._notFound = true;
      else this._toast(err?.message || String(err));
    }
    this._render();
  }

  _onRemoteChange(msg) {
    if (!this._view) return;
    if (this._view.name === "detail" && msg.entry_id && msg.entry_id !== this._view.id) return;
    clearTimeout(this._reloadTimer);
    this._reloadTimer = setTimeout(async () => {
      const before = this._detail?.docs?.updated_at;
      await this._load();
      if (this._editing && this._detail && this._detail.docs.updated_at !== before && this._detail.docs.updated_at !== this._draftBase) {
        this._remoteChanged = true;
        this._renderDocs();
      }
    }, 250);
  }

  _isDirty() {
    return this._editing && this._detail && this._draft !== (this._detail.docs.markdown || "");
  }

  /* --- helpers */
  _navigate(path) {
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  _toast(message) {
    this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true }));
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(this._hass.locale?.language || this._hass.language, { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      return iso;
    }
  }

  _deviceName(id) {
    const d = this._hass.devices?.[id];
    return d ? d.name_by_user || d.name || id : id;
  }

  _isUnavailable(entityId) {
    const s = this._hass.states[entityId];
    return !s || s.state === "unavailable";
  }

  _deviceStatus(entityIds) {
    if (!entityIds || !entityIds.length) return "none";
    const bad = entityIds.filter((e) => this._isUnavailable(e)).length;
    if (bad === 0) return "ok";
    return bad === entityIds.length ? "bad" : "partly";
  }

  _stationHealth(st) {
    let unavailableDevices = 0;
    for (const id of st.device_ids) if (this._deviceStatus(st.device_entities[id]) === "bad") unavailableDevices++;
    const unavailableEntities = [...Object.values(st.device_entities).flat(), ...st.direct_entity_ids].filter((e) => this._isUnavailable(e)).length;
    return { unavailableDevices, unavailableEntities, problem: unavailableEntities > 0 };
  }

  _formatState(entityId) {
    const s = this._hass.states[entityId];
    if (!s) return "—";
    try {
      if (this._hass.formatEntityState) return this._hass.formatEntityState(s);
    } catch (e) {
      /* fall through */
    }
    const unit = s.attributes.unit_of_measurement;
    return unit ? `${s.state} ${unit}` : s.state;
  }

  _entityName(info, deviceName) {
    let name = info.name;
    if (!name) {
      const s = this._hass.states[info.entity_id];
      name = s?.attributes.friendly_name || info.entity_id;
    }
    if (deviceName && name !== deviceName && name.startsWith(deviceName + " ")) name = name.slice(deviceName.length + 1);
    return name;
  }

  _withFileUrls(markdown) {
    const files = this._detail?.files || [];
    return markdown.replace(/\((?:file|photo):([0-9a-f]+)\)/g, (match, id) => {
      const f = files.find((x) => x.id === id);
      return f ? `(${f.url})` : match;
    });
  }

  /* --- rendering */
  _render() {
    const root = this.shadowRoot.getElementById("root");
    if (!root) return;
    if (this._view.name === "detail" && this._detail && !this._notFound && this.shadowRoot.getElementById("docs")) {
      this._refreshDetail(root);
      return;
    }
    if (this._view.name === "list") root.innerHTML = this._listTemplate();
    else root.innerHTML = this._detailTemplate();
    const menu = this.shadowRoot.querySelector("ha-menu-button");
    if (menu) {
      menu.hass = this._hass;
      menu.narrow = this._narrow;
    }
    if (this._view.name === "detail" && this._detail) {
      this._renderDocs();
      this._renderPower();
      this._renderLightbox();
    }
    this._afterRenderIcons();
    if (this._view.name === "list") {
      const input = this.shadowRoot.getElementById("search");
      if (input && this._refocusSearch) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        this._refocusSearch = false;
      }
    }
  }

  /* Detail page already on screen: refresh the pieces in place so an open
   * editor, picker or lightbox survives a data reload. */
  _refreshDetail(root) {
    const d = this._detail;
    const title = root.querySelector(".toolbar .title");
    if (title) title.innerHTML = `${esc(d.name)}${d.area_name ? `<small>${esc(d.area_name)}</small>` : ""}`;
    const fresh = document.createElement("div");
    fresh.innerHTML = this._detailTemplate();
    const hero = root.querySelector(".hero");
    const freshHero = fresh.querySelector(".hero");
    if (hero && freshHero) hero.replaceWith(freshHero);
    const banner = root.querySelector(".content > .banner.warn");
    const freshBanner = fresh.querySelector(".content > .banner.warn");
    if (banner && !freshBanner) banner.remove();
    else if (!banner && freshBanner) root.querySelector(".content").prepend(freshBanner);
    this._renderDevices();
    this._renderFiles();
    this._renderPower();
    if (!this._editing) this._renderDocs();
    this._renderLightbox();
    this._afterRenderIcons();
  }

  _toolbar(titleHtml, { back = false, actions = "" } = {}) {
    const lead = back
      ? `<button class="icon-btn" data-action="back" title="${esc(this.t("back"))}" aria-label="${esc(this.t("back"))}"><ha-icon icon="mdi:arrow-left"></ha-icon></button>`
      : `<ha-menu-button></ha-menu-button>`;
    return `<div class="toolbar">${lead}<div class="title">${titleHtml}</div>${actions}</div>`;
  }

  /* list */
  _filteredStations() {
    const stations = this._list?.stations || [];
    const q = this._search.trim().toLowerCase();
    if (!q) return stations.map((st) => ({ st, match: null }));
    const out = [];
    for (const st of stations) {
      if ([st.name, st.area_name, st.label_name].some((v) => v && v.toLowerCase().includes(q))) {
        out.push({ st, match: null });
        continue;
      }
      const dev = st.device_ids.map((id) => this._deviceName(id)).find((n) => n.toLowerCase().includes(q));
      if (dev) out.push({ st, match: dev });
    }
    return out;
  }

  _listTemplate() {
    const isAdmin = this._list?.is_admin ?? this._hass.user?.is_admin;
    const actions = isAdmin
      ? `<button class="tb-btn" data-action="add-station"><ha-icon icon="mdi:plus"></ha-icon>${esc(this.t("add_station"))}</button>`
      : "";
    let body;
    if (!this._list) {
      body = `<div class="loading">${esc(this.t("loading"))}</div>`;
    } else if (!this._list.stations.length) {
      body = `<div class="card empty"><ha-icon icon="stations:logo" style="--mdc-icon-size:48px"></ha-icon><p>${esc(this.t("no_stations"))}</p>${
        isAdmin ? `<p class="small">${esc(this.t("no_stations_admin"))}</p>` : ""
      }</div>`;
    } else {
      const rows = this._filteredStations();
      const problems = this._list.stations.filter((st) => this._stationHealth(st).problem).length;
      body = `
        <div class="list-top">
          <label class="search"><ha-icon icon="mdi:magnify"></ha-icon><input id="search" type="search" placeholder="${esc(this.t("search"))}" value="${esc(this._search)}" autocomplete="off"></label>
          <label class="sort" title="${esc(this.t("sort"))}"><ha-icon icon="mdi:sort"></ha-icon><select id="sort" aria-label="${esc(this.t("sort"))}">${["name", "area", "floor"]
            .map((k) => `<option value="${k}" ${this._sort === k ? "selected" : ""}>${esc(this.t(`sort_${k}`))}</option>`)
            .join("")}</select></label>
          <div class="stats" id="list-stats">${this._statsTemplate(problems)}</div>
        </div>
        ${rows.length ? this._groupsTemplate(rows) : `<div class="card empty">${esc(this.t("no_match"))}</div>`}`;
    }
    return `${this._toolbar(esc(this.t("stations")), { actions })}<div class="content">${body}</div>`;
  }

  /** Sort the visible stations and split them into groups for headings. */
  _groupedStations(rows) {
    const byName = (a, b) => a.st.name.localeCompare(b.st.name);
    if (this._sort === "name") return [{ title: null, rows: [...rows].sort(byName) }];
    const groups = new Map();
    for (const row of rows) {
      const st = row.st;
      const key = this._sort === "area" ? st.area_id || "" : st.floor_id || "";
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          title: this._sort === "area" ? st.area_name || this.t("no_area") : st.floor_name || this.t("no_floor"),
          level: st.floor_level,
          rows: [],
        });
      }
      groups.get(key).rows.push(row);
    }
    const byArea = (a, b) => (a.st.area_name || "\uffff").localeCompare(b.st.area_name || "\uffff") || byName(a, b);
    const list = [...groups.values()];
    for (const g of list) g.rows.sort(this._sort === "floor" ? byArea : byName);
    // Floors by level (lowest first, floors without a level after), then name.
    // Stations without an area or floor always come last.
    list.sort((a, b) => {
      if (!a.key !== !b.key) return a.key ? -1 : 1;
      if (this._sort === "floor") {
        const la = a.level ?? Infinity;
        const lb = b.level ?? Infinity;
        if (la !== lb) return la < lb ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
    return list;
  }

  _groupsTemplate(rows) {
    const icon = this._sort === "area" ? "mdi:map-marker-outline" : "mdi:home-floor-0";
    return this._groupedStations(rows)
      .map(
        (g) =>
          `${g.title ? `<h3 class="group-head"><ha-icon icon="${icon}"></ha-icon>${esc(g.title)} <span class="count">· ${g.rows.length}</span></h3>` : ""}<div class="grid">${g.rows
            .map(({ st, match }) => this._stationCardTemplate(st, match))
            .join("")}</div>`
      )
      .join("");
  }

  _statsTemplate(problems) {
    const n = this._list.stations.length;
    return `<span class="stat"><ha-icon icon="stations:logo"></ha-icon>${n}</span>${
      problems ? `<span class="stat bad"><ha-icon icon="mdi:alert-circle"></ha-icon>${esc(this.t("problems", problems))}</span>` : `<span class="stat"><ha-icon icon="mdi:check-circle" style="color:var(--st-ok)"></ha-icon>${esc(this.t("all_ok"))}</span>`
    }`;
  }

  _healthText(h) {
    return h.unavailableDevices ? this.t("unavailable_count", h.unavailableDevices) : this.t("entities_unavailable", h.unavailableEntities);
  }

  _statusPill(st) {
    const h = this._stationHealth(st);
    if (!st.device_ids.length && !st.direct_entity_ids.length) return "";
    return h.problem
      ? `<span class="status-pill bad"><ha-icon icon="mdi:alert"></ha-icon>${esc(this._healthText(h))}</span>`
      : `<span class="status-pill"><ha-icon icon="mdi:check"></ha-icon>${esc(this.t("online"))}</span>`;
  }

  _stationCardTemplate(st, match) {
    const color = labelColor(st.label_color);
    const cover = st.cover_url
      ? `<img src="${esc(st.cover_small_url || st.cover_url)}" alt="" loading="lazy">`
      : `<div class="placeholder" style="background:color-mix(in srgb, ${color} 22%, transparent);color:${color}"><ha-icon icon="${esc(st.label_icon || "stations:logo")}"></ha-icon></div>`;
    return `
      <a class="card station-card" href="/${this._panelPath()}/${esc(st.entry_id)}" data-action="open-station" data-id="${esc(st.entry_id)}">
        <div class="cover">${cover}<span data-pill="${esc(st.entry_id)}">${this._statusPill(st)}</span></div>
        <div class="info">
          <div class="name">${esc(st.name)}</div>
          <div class="meta">
            ${st.area_name ? `<span><ha-icon icon="mdi:map-marker-outline"></ha-icon>${esc(st.area_name)}</span>` : ""}
            <span><ha-icon icon="mdi:devices"></ha-icon>${esc(this.t("device_count", st.device_ids.length))}</span>
            ${st.has_docs ? `<span title="${esc(this.t("docs"))}"><ha-icon icon="mdi:text-box-outline"></ha-icon></span>` : ""}
            ${st.file_count ? `<span><ha-icon icon="mdi:image-multiple-outline"></ha-icon>${st.file_count}</span>` : ""}
          </div>
          ${match ? `<div class="match"><ha-icon icon="mdi:subdirectory-arrow-right" style="--mdc-icon-size:14px"></ha-icon> ${esc(match)}</div>` : ""}
        </div>
      </a>`;
  }

  /* detail */
  _detailTemplate() {
    if (this._notFound) {
      return `${this._toolbar(esc(this.t("stations")), { back: true })}<div class="content"><div class="card empty">${esc(this.t("not_found"))}</div></div>`;
    }
    const d = this._detail;
    if (!d) return `${this._toolbar("", { back: true })}<div class="loading">${esc(this.t("loading"))}</div>`;
    const title = `${esc(d.name)}${d.area_name ? `<small>${esc(d.area_name)}</small>` : ""}`;
    const actions = d.is_admin
      ? `<button class="icon-btn" data-action="rename" title="${esc(this.t("rename"))}" aria-label="${esc(this.t("rename"))}"><ha-icon icon="mdi:pencil"></ha-icon></button>
         <button class="icon-btn" data-action="settings" title="${esc(this.t("station_settings"))}" aria-label="${esc(this.t("station_settings"))}"><ha-icon icon="mdi:cog"></ha-icon></button>`
      : "";
    const h = this._stationHealth(d);
    const hero = `
      <div class="hero">
        <div class="facts">
          ${d.label_missing ? "" : `<span class="label-chip" style="background:${labelColor(d.label_color)}" title="${esc(this.t("label"))}"><ha-icon icon="${esc(d.label_icon || "mdi:label")}"></ha-icon>${esc(d.label_name)}</span>`}
          <span class="stat"><ha-icon icon="mdi:devices"></ha-icon>${esc(this.t("device_count", d.device_ids.length))}</span>
          <span id="hero-health">${this._heroHealth(d, h)}</span>
        </div>
        <div class="actions">
          ${this._powerBarTemplate(d)}
          <button class="btn text" data-action="device-page"><ha-icon icon="mdi:open-in-new"></ha-icon>${esc(this.t("device_page"))}</button>
        </div>
      </div>`;
    const warn = d.label_missing ? `<div class="banner warn"><ha-icon icon="mdi:alert"></ha-icon><div>${esc(this.t("label_missing"))}</div></div>` : "";
    return `${this._toolbar(title, { back: true, actions })}
      <div class="content">
        ${warn}${hero}
        <section class="card power-config" id="power-config" hidden></section>
        <div class="detail">
          <div class="main-col">
            <section class="card docs" id="docs"></section>
            <section class="card files" id="files">${this._filesTemplate()}</section>
          </div>
          <section class="card devices" id="devices">${this._devicesTemplate()}</section>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------- power */
  _powerState(d) {
    const ACT = ["script", "scene", "button", "input_button", "automation"];
    const stateful = (d.power?.targets_on || []).filter((id) => !ACT.includes(id.split(".")[0]));
    if (!stateful.length) return null;
    return stateful.some((id) => {
      const st = this._hass.states[id]?.state;
      return st && !["off", "standby", "unavailable", "unknown"].includes(st);
    });
  }

  _powerStateTemplate(d) {
    const on = this._powerState(d);
    if (on === null) return "";
    return `<span class="power-state ${on ? "on" : "off"}"><ha-icon icon="mdi:power"></ha-icon>${esc(on ? this.t("power_is_on") : this.t("power_is_off"))}</span>`;
  }

  _powerBarTemplate(d) {
    const p = d.power || {};
    const settings = d.is_admin
      ? `<button class="icon-btn" data-action="power-settings" title="${esc(this.t("power_settings"))}" aria-label="${esc(this.t("power_settings"))}"><ha-icon icon="mdi:cog-outline"></ha-icon></button>`
      : "";
    if (!p.configured) {
      return d.is_admin ? `<button class="btn text" data-action="power-settings"><ha-icon icon="mdi:power"></ha-icon>${esc(this.t("power_setup"))}</button>` : "";
    }
    return `<span class="power-bar">
      <span id="power-state">${this._powerStateTemplate(d)}</span>
      <button class="btn outline power-on" data-action="power" data-on="1"><ha-icon icon="mdi:power"></ha-icon>${esc(this.t("power_on"))}</button>
      <button class="btn outline power-off" data-action="power" data-on="0" ${p.targets_off?.length ? "" : "disabled"}><ha-icon icon="mdi:power-off"></ha-icon>${esc(this.t("power_off"))}</button>
      ${settings}
    </span>`;
  }

  _powerMemberIds(d) {
    return [...Object.values(d.device_entities).flat(), ...d.direct_entity_ids];
  }

  _powerPreview(d, cfg) {
    const ACT = ["script", "scene", "button", "input_button", "automation"];
    const TOGGLE = ["switch", "light", "fan", "input_boolean", "media_player", "remote", "siren", "humidifier", "climate", "water_heater"];
    if (cfg.mode === "entities") return cfg.entities || [];
    if (cfg.mode !== "label" || !cfg.label_id) return [];
    return this._powerMemberIds(d).filter((id) => {
      const e = this._hass.entities?.[id];
      if (!e) return false;
      if ((e.labels || []).includes(cfg.label_id)) return true;
      const dev = e.device_id ? this._hass.devices?.[e.device_id] : null;
      return Boolean(dev && (dev.labels || []).includes(cfg.label_id) && !e.entity_category && TOGGLE.includes(id.split(".")[0]) && !ACT.includes(id.split(".")[0]));
    });
  }

  _entityLabel(id) {
    return this._hass.states[id]?.attributes.friendly_name || this._hass.entities?.[id]?.name || id;
  }

  _powerSideTemplate(which) {
    const pe = this._powerEdit;
    const d = this._detail;
    const cfg = pe[which];
    const labels = pe.labels || [];
    const radio = (mode, text) => `<label class="pw-radio"><input type="radio" name="pw-${which}" data-pw-mode="${which}" value="${mode}" ${String(cfg.mode) === mode ? "checked" : ""}><span>${text}</span></label>`;
    let body = "";
    if (cfg.mode === "label") {
      body = `<select class="pw-select" data-pw-label="${which}"><option value="">${esc(this.t("power_pick_label"))}</option>${labels
        .filter((l) => l.label_id !== d.label_id)
        .map((l) => `<option value="${esc(l.label_id)}" ${l.label_id === cfg.label_id ? "selected" : ""}>${esc(l.name)}</option>`)
        .join("")}</select>`;
    } else if (cfg.mode === "entities") {
      const q = (pe.query[which] || "").toLowerCase();
      const domains = ["switch", "light", "fan", "input_boolean", "media_player", "remote", "siren", "humidifier", "climate", "water_heater", "script", "scene", "button", "input_button", "automation"];
      const results = q
        ? Object.keys(this._hass.states)
            .filter((id) => domains.includes(id.split(".")[0]) && !cfg.entities.includes(id))
            .filter((id) => id.toLowerCase().includes(q) || this._entityLabel(id).toLowerCase().includes(q))
            .slice(0, 12)
        : [];
      body = `
        <div class="pw-selected">${cfg.entities.map((id) => `<span class="pw-item"><span>${esc(this._entityLabel(id))}<small>${esc(id)}</small></span><button class="icon-btn" data-action="pw-remove" data-which="${which}" data-entity="${esc(id)}" aria-label="${esc(this.t("delete"))}"><ha-icon icon="mdi:close"></ha-icon></button></span>`).join("")}</div>
        <input class="pw-search" data-pw-search="${which}" placeholder="${esc(this.t("power_search"))}" value="${esc(pe.query[which] || "")}" autocomplete="off">
        <div class="pw-results">${results.map((id) => `<button class="result" data-action="pw-add" data-which="${which}" data-entity="${esc(id)}"><ha-icon icon="mdi:plus-circle-outline"></ha-icon><div class="r-main"><div>${esc(this._entityLabel(id))}</div><div class="r-sub">${esc(id)}</div></div></button>`).join("")}</div>`;
    }
    let preview = this._powerPreview(d, cfg);
    if (which === "off" && !cfg.mode) {
      preview = this._powerPreview(d, pe.on).filter((id) => !["script", "scene", "button", "input_button", "automation"].includes(id.split(".")[0]));
    }
    const previewHtml = cfg.mode === "label" || (which === "off" && !cfg.mode)
      ? `<div class="pw-preview"><div class="muted small">${esc(this.t("power_preview", preview.length))}</div>${preview.map((id) => `<span class="pw-chip">${esc(this._entityLabel(id))}</span>`).join("")}</div>`
      : "";
    return `
      <div class="pw-side">
        <h3><ha-icon icon="${which === "on" ? "mdi:power" : "mdi:power-off"}"></ha-icon>${esc(which === "on" ? this.t("power_on") : this.t("power_off"))}</h3>
        ${radio("null", esc(which === "on" ? this.t("power_mode_none") : this.t("power_mode_reverse")))}
        ${radio("label", esc(this.t("power_mode_label")))}
        ${radio("entities", esc(this.t("power_mode_entities")))}
        <div class="pw-body">${body}</div>
        ${previewHtml}
      </div>`;
  }

  _renderPower() {
    const el = this.shadowRoot.getElementById("power-config");
    if (!el) return;
    if (!this._powerEdit || !this._detail) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    const focused = this.shadowRoot.activeElement;
    const focusKey = focused?.dataset?.pwSearch;
    el.hidden = false;
    el.innerHTML = `
      <div class="card-head"><h2><ha-icon icon="mdi:power-settings"></ha-icon>${esc(this.t("power_settings"))}</h2></div>
      <div class="card-body">
        <p class="muted small" style="margin-top:0">${esc(this.t("power_help"))}</p>
        <div class="pw-grid">${this._powerSideTemplate("on")}${this._powerSideTemplate("off")}</div>
        <div class="cfg-actions">
          <span class="push"></span>
          <button class="btn text" data-action="pw-cancel">${esc(this.t("cancel"))}</button>
          <button class="btn" data-action="pw-save">${esc(this.t("save"))}</button>
        </div>
      </div>`;
    if (focusKey) {
      const next = el.querySelector(`[data-pw-search="${focusKey}"]`);
      next?.focus();
      next?.setSelectionRange(next.value.length, next.value.length);
    }
  }

  _heroHealth(d, h) {
    if (!d.device_ids.length && !d.direct_entity_ids.length) return "";
    return h.problem
      ? `<span class="stat bad"><ha-icon icon="mdi:alert-circle"></ha-icon>${esc(this._healthText(h))}</span>`
      : `<span class="stat"><ha-icon icon="mdi:check-circle" style="color:var(--st-ok)"></ha-icon>${esc(this.t("all_ok"))}</span>`;
  }

  _chip(info, deviceName) {
    const unavailable = this._isUnavailable(info.entity_id);
    const icon = this._hass.states[info.entity_id]?.attributes.icon || info.icon;
    const iconHtml = icon
      ? `<ha-icon icon="${esc(icon)}"></ha-icon>`
      : `<ha-state-icon data-eid-icon="${esc(info.entity_id)}"></ha-state-icon>`;
    return `<button class="chip${unavailable ? " unavailable" : ""}" data-action="more-info" data-entity="${esc(info.entity_id)}" title="${esc(info.entity_id)}">
      ${iconHtml}<span class="cname">${esc(this._entityName(info, deviceName))}</span><span class="cstate" data-eid="${esc(info.entity_id)}">${esc(this._formatState(info.entity_id))}</span></button>`;
  }

  _devicesTemplate() {
    const d = this._detail;
    const admin = d.is_admin && !d.label_missing;
    const head = `<div class="card-head"><h2><ha-icon icon="mdi:devices"></ha-icon>${esc(this.t("devices"))} <span class="count">${d.devices.length}</span></h2>${
      admin ? `<button class="btn text" data-action="toggle-picker"><ha-icon icon="${this._picker ? "mdi:close" : "mdi:plus"}"></ha-icon>${esc(this._picker ? this.t("cancel") : this.t("add_member"))}</button>` : ""
    }</div>`;
    const picker = this._picker ? this._pickerTemplate() : "";
    let list = "";
    if (!d.devices.length && !d.direct_entities.length) {
      list = `<div class="empty"><p>${esc(this.t("no_members"))}</p>${d.label_missing ? "" : `<p class="small">${esc(this.t("no_members_hint", d.label_name))}</p>`}</div>`;
    } else {
      list = d.devices.map((dev) => this._deviceTemplate(dev, admin)).join("");
      if (d.direct_entities.length) {
        list += `<div class="sub-head">${esc(this.t("other_entities"))}</div><div class="dev"><div class="chips" style="margin-left:0">${d.direct_entities
          .map((e) => `<span style="display:inline-flex;align-items:center;gap:2px">${this._chip(e, null)}${
            admin ? `<button class="icon-btn remove-btn" style="width:28px;height:28px" data-action="remove-entity" data-entity="${esc(e.entity_id)}" title="${esc(this.t("remove_member"))}"><ha-icon icon="mdi:close" style="--mdc-icon-size:16px"></ha-icon></button>` : ""
          }</span>`)
          .join("")}</div></div>`;
      }
    }
    return head + picker + `<div>${list}</div>`;
  }

  _deviceFields(dev) {
    const isIp = (h) => /^(\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+:[0-9a-f:]*$/i.test(h || "");
    return [
      { key: "address", label: isIp(dev.host) ? this.t("short_ip") : this.t("short_address"), value: dev.host, href: dev.web_url },
      { key: "mac", label: this.t("short_mac"), value: dev.mac },
      { key: "ieee", label: this.t("short_ieee"), value: dev.ieee },
      { key: "serial", label: this.t("short_serial"), value: dev.serial_number },
      { key: "firmware", label: this.t("short_firmware"), value: dev.sw_version },
      { key: "hardware", label: this.t("short_hardware"), value: dev.hw_version },
    ].filter((f) => f.value);
  }

  _deviceTemplate(dev, admin) {
    const ids = dev.entities.map((e) => e.entity_id);
    const status = this._deviceStatus(ids);
    const statusText = { ok: this.t("online"), bad: this.t("offline"), partly: this.t("partly"), none: this.t("no_entities") }[status];
    const sub = [dev.manufacturer, dev.model].filter(Boolean).join(" · ");
    const area = dev.area_name && dev.area_name !== this._detail.area_name ? dev.area_name : null;
    const display = dev.display;
    let shown;
    if (display && Array.isArray(display.entities)) {
      const byId = new Map(dev.entities.map((e) => [e.entity_id, e]));
      shown = display.entities.map((id) => byId.get(id)).filter(Boolean);
    } else {
      shown = []; // default: everything collapsed under "n more"
    }
    const shownIds = new Set(shown.map((e) => e.entity_id));
    const rest = dev.entities.filter((e) => !shownIds.has(e.entity_id));
    const wanted = new Set(display?.fields || []);
    const fields = this._deviceFields(dev).filter((f) => wanted.has(f.key));
    const configuring = this._devConfig?.deviceId === dev.id;
    const info = fields.length
      ? `<div class="dev-info">${fields
          .map(
            (f) => `<span class="kv"><span class="k">${esc(f.label)}</span>${
              f.href ? `<a href="${esc(f.href)}" target="_blank" rel="noopener">${esc(f.value)}</a>` : `<span class="v">${esc(f.value)}</span>`
            }<button class="copy" data-action="copy" data-value="${esc(f.value)}" title="${esc(this.t("copy"))}" aria-label="${esc(this.t("copy"))}"><ha-icon icon="mdi:content-copy"></ha-icon></button></span>`
          )
          .join("")}</div>`
      : "";
    const note = display?.note ? `<div class="dev-note"><ha-icon icon="mdi:note-text-outline"></ha-icon><span>${esc(display.note)}</span></div>` : "";
    return `
      <div class="dev${configuring ? " configuring" : ""}">
        <div class="dev-row">
          <span class="dot ${status}" data-dev-dot="${esc(dev.id)}"></span>
          <div class="dev-main">
            <a class="dev-name" href="/config/devices/device/${esc(dev.id)}" data-action="nav">${esc(dev.name)}</a>
            ${sub || area ? `<div class="dev-sub">${esc(sub)}${sub && area ? " · " : ""}${area ? `<ha-icon icon="mdi:map-marker-outline" style="--mdc-icon-size:12px"></ha-icon> ${esc(area)}` : ""}</div>` : ""}
          </div>
          <span class="dev-status ${status}" data-dev-status="${esc(dev.id)}">${esc(statusText)}</span>
          ${this._visitTemplate(dev)}
          <button class="icon-btn remove-btn${configuring ? " active" : ""}" style="width:32px;height:32px" data-action="configure-device" data-id="${esc(dev.id)}" title="${esc(this.t("customize"))}" aria-label="${esc(this.t("customize"))}"><ha-icon icon="mdi:tune-variant" style="--mdc-icon-size:18px"></ha-icon></button>
          ${admin ? `<button class="icon-btn remove-btn" style="width:32px;height:32px" data-action="remove-device" data-id="${esc(dev.id)}" title="${esc(this.t("remove_member"))}" aria-label="${esc(this.t("remove_member"))}"><ha-icon icon="mdi:close" style="--mdc-icon-size:18px"></ha-icon></button>` : ""}
        </div>
        ${configuring ? this._deviceConfigTemplate(dev) : `${info}${note}
        ${shown.length ? `<div class="chips">${shown.map((e) => this._chip(e, dev.name)).join("")}</div>` : ""}
        ${rest.length ? `<details class="more"${this._openMore.has(dev.id) ? " open" : ""} data-dev-more="${esc(dev.id)}"><summary><ha-icon icon="mdi:chevron-down" style="--mdc-icon-size:16px"></ha-icon>${esc(this.t("more_entities", rest.length))}</summary><div class="chips">${rest.map((e) => this._chip(e, dev.name)).join("")}</div></details>` : ""}`}
      </div>`;
  }

  _visitTemplate(dev) {
    const url = dev.visit_url;
    if (!url) return "";
    const internal = url.startsWith("homeassistant://");
    const href = internal ? `/${url.slice("homeassistant://".length).replace(/^\/+/, "")}` : url;
    const attrs = internal ? `data-action="nav"` : `target="_blank" rel="noopener noreferrer"`;
    const title = internal ? this.t("visit") : `${this.t("visit")} · ${url}`;
    return `<a class="visit" href="${esc(href)}" ${attrs} title="${esc(title)}"><ha-icon icon="${internal ? "mdi:cog" : "mdi:open-in-new"}"></ha-icon><span>${esc(this.t("visit"))}</span></a>`;
  }

  _deviceConfigTemplate(dev) {
    const c = this._devConfig;
    const fields = this._deviceFields(dev);
    const longLabel = { address: this.t("field_address"), mac: this.t("field_mac"), ieee: this.t("field_ieee"), serial: this.t("field_serial"), firmware: this.t("field_firmware"), hardware: this.t("field_hardware") };
    const fieldRows = fields.length
      ? fields
          .map(
            (f) => `<label class="cfg-row"><input type="checkbox" data-cfg-field="${esc(f.key)}" ${c.fields.has(f.key) ? "checked" : ""}><span class="cfg-name">${esc(longLabel[f.key])}</span><span class="cfg-val">${esc(f.value)}</span><span class="cfg-move"></span></label>`
          )
          .join("")
      : `<div class="muted small cfg-empty">${esc(this.t("no_device_info"))}</div>`;
    const catLabel = (e) => (e.category === "diagnostic" ? this.t("cat_diagnostic") : e.category === "config" ? this.t("cat_config") : e.hidden ? this.t("cat_hidden") : "");
    // Selected entities first (in their chosen order), then the others.
    const ordered = [...c.entities.map((id) => dev.entities.find((e) => e.entity_id === id)).filter(Boolean), ...dev.entities.filter((e) => !c.entities.includes(e.entity_id))];
    const entityRows = ordered.length
      ? ordered
          .map((e) => {
            const on = c.entities.includes(e.entity_id);
            const idx = c.entities.indexOf(e.entity_id);
            return `<div class="cfg-row"><label class="cfg-check"><input type="checkbox" data-cfg-entity="${esc(e.entity_id)}" ${on ? "checked" : ""}><span class="cfg-name">${esc(this._entityName(e, dev.name))}${catLabel(e) ? ` <span class="cfg-tag">${esc(catLabel(e))}</span>` : ""}</span></label><span class="cfg-val" data-eid="${esc(e.entity_id)}">${esc(this._formatState(e.entity_id))}</span>${
              on
                ? `<span class="cfg-move"><button class="icon-btn" data-action="cfg-up" data-entity="${esc(e.entity_id)}" ${idx === 0 ? "disabled" : ""} title="${esc(this.t("move_up"))}" aria-label="${esc(this.t("move_up"))}"><ha-icon icon="mdi:arrow-up"></ha-icon></button><button class="icon-btn" data-action="cfg-down" data-entity="${esc(e.entity_id)}" ${idx === c.entities.length - 1 ? "disabled" : ""} title="${esc(this.t("move_down"))}" aria-label="${esc(this.t("move_down"))}"><ha-icon icon="mdi:arrow-down"></ha-icon></button></span>`
                : `<span class="cfg-move"></span>`
            }</div>`;
          })
          .join("")
      : `<div class="muted small cfg-empty">${esc(this.t("no_entities"))}</div>`;
    return `
      <div class="dev-config">
        <div class="cfg-title">${esc(this.t("customize"))}</div>
        <div class="cfg-group">${esc(this.t("device_info"))}</div>
        ${fieldRows}
        <div class="cfg-group">${esc(this.t("entities"))}</div>
        ${entityRows}
        <div class="cfg-group">${esc(this.t("note"))}</div>
        <input class="cfg-note" id="cfg-note" maxlength="500" placeholder="${esc(this.t("note_placeholder"))}" value="${esc(c.note)}">
        <div class="cfg-actions">
          ${dev.display ? `<button class="btn text" data-action="cfg-reset">${esc(this.t("reset_default"))}</button>` : ""}
          <span class="push"></span>
          <button class="btn text" data-action="cfg-cancel">${esc(this.t("cancel"))}</button>
          <button class="btn" data-action="cfg-save">${esc(this.t("save"))}</button>
        </div>
      </div>`;
  }

  _pickerTemplate() {
    const tab = this._picker.tab;
    return `
      <div class="picker">
        <div class="tabs">
          <button class="tab ${tab === "devices" ? "active" : ""}" data-action="picker-tab" data-tab="devices">${esc(this.t("tab_devices"))}</button>
          <button class="tab ${tab === "entities" ? "active" : ""}" data-action="picker-tab" data-tab="entities">${esc(this.t("tab_entities"))}</button>
        </div>
        <input id="picker-search" type="search" placeholder="${esc(tab === "devices" ? this.t("search_devices") : this.t("search_entities"))}" value="${esc(this._picker.query)}" autocomplete="off">
        <div class="results" id="picker-results">${this._pickerResults()}</div>
      </div>`;
  }

  _pickerResults() {
    const d = this._detail;
    const q = this._picker.query.trim().toLowerCase();
    const stationLabels = new Map((this._picker.stations || []).map((s) => [s.label_id, s.name]));
    const stationDevices = new Set((this._picker.stations || []).map((s) => s.device_id));
    stationDevices.add(d.device_id);
    const inOther = (labels) => (labels || []).filter((l) => l !== d.label_id && stationLabels.has(l)).map((l) => stationLabels.get(l));
    const areaName = (id) => (id && this._hass.areas?.[id]?.name) || "";
    if (this._picker.tab === "devices") {
      const members = new Set(d.device_ids);
      const rows = Object.values(this._hass.devices || {})
        .filter((dev) => !members.has(dev.id) && !stationDevices.has(dev.id) && dev.entry_type !== "service")
        .map((dev) => ({ dev, name: dev.name_by_user || dev.name || dev.id }))
        .filter(({ dev, name }) => !q || [name, dev.manufacturer, dev.model, areaName(dev.area_id)].some((v) => v && v.toLowerCase().includes(q)))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 50);
      if (!rows.length) return `<div class="muted small" style="padding:8px">—</div>`;
      return rows
        .map(({ dev, name }) => {
          const other = inOther(dev.labels);
          const sub = [dev.manufacturer, dev.model, areaName(dev.area_id)].filter(Boolean).join(" · ");
          return `<button class="result" data-action="add-device" data-id="${esc(dev.id)}"><ha-icon icon="mdi:plus-circle-outline"></ha-icon><div class="r-main"><div>${esc(name)}</div>${sub ? `<div class="r-sub">${esc(sub)}</div>` : ""}</div>${other.length ? `<span class="r-tag">${esc(this.t("in_station", other.join(", ")))}</span>` : ""}</button>`;
        })
        .join("");
    }
    const members = new Set([...Object.values(d.device_entities).flat(), ...d.direct_entity_ids]);
    const rows = Object.values(this._hass.entities || {})
      .filter((e) => !members.has(e.entity_id) && !(e.device_id && stationDevices.has(e.device_id)))
      .map((e) => ({ e, name: this._hass.states[e.entity_id]?.attributes.friendly_name || e.name || e.entity_id }))
      .filter(({ e, name }) => !q || name.toLowerCase().includes(q) || e.entity_id.includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 50);
    if (!rows.length) return `<div class="muted small" style="padding:8px">—</div>`;
    return rows
      .map(({ e, name }) => {
        const other = inOther(e.labels);
        return `<button class="result" data-action="add-entity" data-entity="${esc(e.entity_id)}"><ha-icon icon="mdi:plus-circle-outline"></ha-icon><div class="r-main"><div>${esc(name)}</div><div class="r-sub">${esc(e.entity_id)}</div></div>${other.length ? `<span class="r-tag">${esc(this.t("in_station", other.join(", ")))}</span>` : ""}</button>`;
      })
      .join("");
  }

  _renderDocs() {
    const el = this.shadowRoot.getElementById("docs");
    if (!el || !this._detail) return;
    const d = this._detail;
    const head = (extra) => `<div class="card-head"><h2><ha-icon icon="mdi:text-box-outline"></ha-icon>${esc(this.t("docs"))}</h2>${extra}</div>`;
    if (!this._editing) {
      const md = d.docs.markdown || "";
      if (!md.trim()) {
        el.innerHTML = `${head("")}<div class="empty"><p>${esc(this.t("no_docs"))}</p>
          <button class="btn" data-action="edit"><ha-icon icon="mdi:pencil"></ha-icon>${esc(this.t("start_writing"))}</button>
          <button class="btn outline" data-action="edit-template"><ha-icon icon="mdi:file-document-outline"></ha-icon>${esc(this.t("use_template"))}</button></div>`;
        return;
      }
      el.innerHTML = `${head(`<button class="btn text" data-action="edit"><ha-icon icon="mdi:pencil"></ha-icon>${esc(this.t("edit"))}</button>`)}
        <div class="card-body"><div class="md" id="md-view"></div>
        <div class="doc-foot">${esc(this.t("edited_by", d.docs.updated_by, this._formatDate(d.docs.updated_at)))}</div></div>`;
      this._fillMarkdown(this.shadowRoot.getElementById("md-view"), md);
      return;
    }
    // Editing: keep the textarea element alive when possible so the cursor survives.
    const banner = this._conflict
      ? `<div class="banner bad"><ha-icon icon="mdi:account-alert"></ha-icon><div>${esc(this.t("conflict"))}<div class="actions">
          <button class="btn" data-action="force-save">${esc(this.t("overwrite"))}</button>
          <button class="btn outline" data-action="discard-mine">${esc(this.t("reload_theirs"))}</button></div></div></div>`
      : this._remoteChanged
        ? `<div class="banner warn"><ha-icon icon="mdi:information"></ha-icon><div>${esc(this.t("remote_changed"))}</div></div>`
        : "";
    const files = d.files || [];
    const insert = files.length
      ? `<select id="insert-file"><option value="">${esc(this.t("insert_file"))}</option>${files
          .map((f) => `<option value="${esc(f.id)}">${esc(f.caption || f.filename)}</option>`)
          .join("")}</select>`
      : "";
    const existing = this.shadowRoot.getElementById("editor");
    const selection = existing ? [existing.selectionStart, existing.selectionEnd, existing.scrollTop] : null;
    el.innerHTML = `${head("")}<div class="card-body">${banner}
      <div class="editor-bar">
        <div class="seg"><button data-action="mode" data-mode="write" class="${this._editMode === "write" ? "active" : ""}">${esc(this.t("write"))}</button><button data-action="mode" data-mode="preview" class="${this._editMode === "preview" ? "active" : ""}">${esc(this.t("preview"))}</button></div>
        ${this._editMode === "write" ? insert : ""}
        <button class="btn text push" data-action="cancel-edit">${esc(this.t("cancel"))}</button>
        <button class="btn" data-action="save"><ha-icon icon="mdi:content-save"></ha-icon>${esc(this.t("save"))}</button>
      </div>
      ${this._editMode === "write"
        ? `<textarea class="editor" id="editor" spellcheck="true"></textarea><div class="editor-hint">Markdown · Ctrl/⌘+S</div>`
        : `<div class="editor-preview md" id="md-preview"></div>`}
    </div>`;
    if (this._editMode === "write") {
      const ta = this.shadowRoot.getElementById("editor");
      ta.value = this._draft;
      this._autosize(ta);
      if (selection) {
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(selection[0], selection[1]);
      } else {
        ta.setSelectionRange(0, 0);
      }
    } else {
      this._fillMarkdown(this.shadowRoot.getElementById("md-preview"), this._draft);
    }
  }

  _autosize(ta) {
    ta.style.height = "auto";
    ta.style.height = `${Math.max(360, ta.scrollHeight + 2)}px`;
  }

  _fillMarkdown(target, markdown) {
    const content = this._withFileUrls(markdown);
    if (this._useHaMarkdown) {
      const el = document.createElement("ha-markdown");
      el.breaks = true;
      el.content = content;
      target.replaceChildren(el);
    } else {
      target.innerHTML = renderMarkdown(content);
    }
  }

  _filesTemplate() {
    const files = this._detail.files;
    const tiles = files
      .map((f) => {
        const isImage = f.content_type.startsWith("image/");
        const inner = isImage
          ? `<img src="${esc(f.small_url || f.url)}" alt="${esc(f.caption || f.filename)}" loading="lazy">`
          : `<div class="doc"><ha-icon icon="${f.content_type === "application/pdf" ? "mdi:file-pdf-box" : "mdi:file-document-outline"}"></ha-icon>${esc(f.filename)}<span class="muted">${formatSize(f.size)}</span></div>`;
        return `<button class="tile" data-action="open-file" data-id="${esc(f.id)}" title="${esc(f.caption || f.filename)}">${inner}${
          f.id === this._detail.cover ? `<span class="star" title="${esc(this.t("is_cover"))}"><ha-icon icon="mdi:star"></ha-icon></span>` : ""
        }${f.caption && isImage ? `<span class="cap">${esc(f.caption)}</span>` : ""}</button>`;
      })
      .join("");
    const pending = this._uploads.map((u) => `<div class="tile pending" id="up-${u.id}">${esc(this._uploadText(u))}</div>`).join("");
    return `
      <div class="card-head"><h2><ha-icon icon="mdi:image-multiple-outline"></ha-icon>${esc(this.t("files"))} <span class="count">${files.length}</span></h2>
        <button class="btn text" data-action="upload"><ha-icon icon="mdi:upload"></ha-icon>${esc(this.t("upload"))}</button>
        <input type="file" id="file-input" multiple accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,.txt" hidden>
      </div>
      <div class="card-body">
        <div class="dropzone">${esc(this.t("drop_here"))}</div>
        ${files.length || pending ? `<div class="gallery">${tiles}${pending}</div>` : `<div class="empty" style="padding:12px 0">${esc(this.t("no_files"))}</div>`}
      </div>`;
  }

  _renderFiles() {
    const el = this.shadowRoot.getElementById("files");
    if (el && this._detail) el.innerHTML = this._filesTemplate();
  }

  _renderDevices() {
    const el = this.shadowRoot.getElementById("devices");
    if (!el || !this._detail) return;
    const search = this.shadowRoot.getElementById("picker-search");
    const hadFocus = search && this.shadowRoot.activeElement === search;
    el.innerHTML = this._devicesTemplate();
    this._afterRenderIcons();
    if (hadFocus) {
      const next = this.shadowRoot.getElementById("picker-search");
      next?.focus();
      next?.setSelectionRange(next.value.length, next.value.length);
    }
  }

  _renderLightbox() {
    let el = this.shadowRoot.getElementById("lightbox");
    const files = this._detail?.files || [];
    const index = files.findIndex((f) => f.id === this._lightbox);
    if (index < 0) {
      el?.remove();
      this._lightbox = null;
      return;
    }
    const f = files[index];
    if (!el) {
      el = document.createElement("div");
      el.id = "lightbox";
      el.className = "lightbox";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      this.shadowRoot.getElementById("root").appendChild(el);
    }
    const isImage = f.content_type.startsWith("image/");
    const stage = isImage
      ? `<img src="${esc(f.url)}" alt="${esc(f.caption || f.filename)}">`
      : `<div class="doc"><ha-icon icon="${f.content_type === "application/pdf" ? "mdi:file-pdf-box" : "mdi:file-document-outline"}"></ha-icon><div>${esc(f.filename)}</div><a class="btn" href="${esc(f.url)}" target="_blank" rel="noopener"><ha-icon icon="mdi:open-in-new"></ha-icon>${esc(this.t("open_original"))}</a></div>`;
    el.innerHTML = `
      <div class="lb-top">
        <span class="lb-title">${esc(f.filename)} · ${formatSize(f.size)} · ${index + 1}/${files.length}</span>
        <a class="icon-btn" href="${esc(f.url)}" download="${esc(f.filename)}" title="Download"><ha-icon icon="mdi:download"></ha-icon></a>
        <button class="icon-btn" data-action="lb-close" title="Close" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="lb-stage">
        ${files.length > 1 ? `<button class="icon-btn lb-nav prev" data-action="lb-prev" aria-label="Previous"><ha-icon icon="mdi:chevron-left"></ha-icon></button>` : ""}
        ${stage}
        ${files.length > 1 ? `<button class="icon-btn lb-nav next" data-action="lb-next" aria-label="Next"><ha-icon icon="mdi:chevron-right"></ha-icon></button>` : ""}
      </div>
      <div class="lb-bottom">
        <input id="lb-caption" placeholder="${esc(this.t("caption"))}" value="${esc(f.caption)}" maxlength="500">
        <div class="lb-meta">${esc(this.t("uploaded_by", f.uploaded_by, this._formatDate(f.uploaded_at)))}</div>
        <div class="lb-actions">
          ${isImage ? (f.id === this._detail.cover ? `<span class="btn text" style="cursor:default"><ha-icon icon="mdi:star" style="color:#ffd54f"></ha-icon>${esc(this.t("is_cover"))}</span>` : `<button class="btn text" data-action="lb-cover"><ha-icon icon="mdi:star-outline"></ha-icon>${esc(this.t("set_cover"))}</button>`) : ""}
          <button class="btn text" data-action="lb-move" data-dir="-1" ${index === 0 ? "disabled" : ""}><ha-icon icon="mdi:arrow-left"></ha-icon>${esc(this.t("move_left"))}</button>
          <button class="btn text" data-action="lb-move" data-dir="1" ${index === files.length - 1 ? "disabled" : ""}><ha-icon icon="mdi:arrow-right"></ha-icon>${esc(this.t("move_right"))}</button>
          <span style="flex:1"></span>
          <button class="btn danger" data-action="lb-delete"><ha-icon icon="mdi:delete-outline"></ha-icon>${esc(this.t("delete"))}</button>
        </div>
      </div>`;
  }

  /* --- live state updates without re-rendering */
  _updateLive(old) {
    const root = this.shadowRoot;
    if (!root.getElementById("root")) return;
    if (this._view?.name === "list" && this._list) {
      let changed = false;
      for (const st of this._list.stations) {
        const ids = [...Object.values(st.device_entities).flat(), ...st.direct_entity_ids];
        if (!ids.some((id) => old.states[id] !== this._hass.states[id])) continue;
        changed = true;
        const pill = root.querySelector(`[data-pill="${CSS.escape(st.entry_id)}"]`);
        if (pill) pill.innerHTML = this._statusPill(st);
      }
      if (changed) {
        const stats = root.getElementById("list-stats");
        if (stats) stats.innerHTML = this._statsTemplate(this._list.stations.filter((st) => this._stationHealth(st).problem).length);
      }
      return;
    }
    if (this._view?.name !== "detail" || !this._detail) return;
    const d = this._detail;
    let changed = false;
    root.querySelectorAll("[data-eid]").forEach((node) => {
      const id = node.dataset.eid;
      if (old.states[id] === this._hass.states[id]) return;
      changed = true;
      node.textContent = this._formatState(id);
      node.closest(".chip")?.classList.toggle("unavailable", this._isUnavailable(id));
    });
    root.querySelectorAll("ha-state-icon[data-eid-icon]").forEach((node) => {
      node.hass = this._hass;
      node.stateObj = this._hass.states[node.dataset.eidIcon];
    });
    if (!changed && !(d.power?.targets_on || []).some((id) => old.states[id] !== this._hass.states[id])) return;
    for (const dev of d.devices) {
      const status = this._deviceStatus(dev.entities.map((e) => e.entity_id));
      const dot = root.querySelector(`[data-dev-dot="${CSS.escape(dev.id)}"]`);
      if (dot) dot.className = `dot ${status}`;
      const label = root.querySelector(`[data-dev-status="${CSS.escape(dev.id)}"]`);
      if (label) {
        label.className = `dev-status ${status}`;
        label.textContent = { ok: this.t("online"), bad: this.t("offline"), partly: this.t("partly"), none: this.t("no_entities") }[status];
      }
    }
    const powerState = root.getElementById("power-state");
    if (powerState) powerState.innerHTML = this._powerStateTemplate(d);
    const hero = root.getElementById("hero-health");
    if (hero) hero.innerHTML = this._heroHealth(d, this._stationHealth(d));
  }

  _afterRenderIcons() {
    this.shadowRoot.querySelectorAll("ha-state-icon[data-eid-icon]").forEach((node) => {
      node.hass = this._hass;
      node.stateObj = this._hass.states[node.dataset.eidIcon];
    });
  }

  /* --- events */
  _handleKey(e) {
    if (this._lightbox) {
      if (e.key === "Escape") this._closeLightbox();
      else if (e.key === "ArrowLeft" && e.target?.id !== "lb-caption") this._stepLightbox(-1);
      else if (e.key === "ArrowRight" && e.target?.id !== "lb-caption") this._stepLightbox(1);
      return;
    }
    if (this._editing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      this._saveDocs(false);
    }
  }

  _handleInput(e) {
    const t = e.target;
    if (t.id === "search") {
      this._search = t.value;
      this._refocusSearch = true;
      this._render();
    } else if (t.id === "editor") {
      this._draft = t.value;
      this._autosize(t);
    } else if (t.dataset?.pwSearch && this._powerEdit) {
      this._powerEdit.query[t.dataset.pwSearch] = t.value;
      this._renderPower();
    } else if (t.id === "cfg-note" && this._devConfig) {
      this._devConfig.note = t.value;
    } else if (t.id === "picker-search") {
      this._picker.query = t.value;
      const results = this.shadowRoot.getElementById("picker-results");
      if (results) results.innerHTML = this._pickerResults();
    }
  }

  _handleChange(e) {
    const t = e.target;
    if (t.id === "sort") {
      this._sort = t.value;
      try {
        localStorage.setItem("stations.sort", this._sort);
      } catch (err) {
        /* not remembered, still sorted */
      }
      this._render();
      return;
    }
    if (this._powerEdit && t.dataset.pwMode) {
      const which = t.dataset.pwMode;
      const mode = t.value === "null" ? null : t.value;
      const prev = this._powerEdit[which];
      this._powerEdit[which] = { mode, label_id: prev.label_id || this._defaultPowerLabel(which), entities: prev.entities || [] };
      this._renderPower();
      return;
    }
    if (this._powerEdit && t.dataset.pwLabel) {
      this._powerEdit[t.dataset.pwLabel].label_id = t.value;
      this._renderPower();
      return;
    }
    if (this._devConfig && t.dataset.cfgField) {
      if (t.checked) this._devConfig.fields.add(t.dataset.cfgField);
      else this._devConfig.fields.delete(t.dataset.cfgField);
      return;
    }
    if (this._devConfig && t.dataset.cfgEntity) {
      const id = t.dataset.cfgEntity;
      const list = this._devConfig.entities.filter((x) => x !== id);
      if (t.checked) list.push(id);
      this._devConfig.entities = list;
      this._renderDevices();
      return;
    }
    if (t.id === "file-input") {
      this._uploadFiles([...t.files]);
      t.value = "";
    } else if (t.id === "insert-file" && t.value) {
      const f = this._detail.files.find((x) => x.id === t.value);
      t.value = "";
      if (f) this._insertIntoEditor(f.content_type.startsWith("image/") ? `![${f.caption || f.filename}](file:${f.id})` : `[${f.caption || f.filename}](file:${f.id})`);
    } else if (t.id === "lb-caption") {
      this._saveCaption(t.value);
    }
  }

  _handleDrag(e, entering) {
    const files = this.shadowRoot.getElementById("files");
    if (!files || !e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    if (entering) files.classList.add("dragging");
    else if (!files.contains(e.relatedTarget)) files.classList.remove("dragging");
  }

  _handleDrop(e) {
    const files = this.shadowRoot.getElementById("files");
    if (!files || !e.dataTransfer?.files?.length) return;
    e.preventDefault();
    files.classList.remove("dragging");
    this._uploadFiles([...e.dataTransfer.files]);
  }

  _handleImgError(e) {
    // Signed URLs expire after 24 h; reload once to get fresh ones.
    if (e.target?.tagName !== "IMG" || this._refreshedUrls) return;
    this._refreshedUrls = true;
    this._load().finally(() => setTimeout(() => (this._refreshedUrls = false), 60000));
  }

  async _handleClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) {
      if (e.target.classList?.contains("lb-stage")) this._closeLightbox();
      return;
    }
    const action = el.dataset.action;
    const d = this._detail;
    switch (action) {
      case "img-retry":
        // Inside a station card (a link) or a gallery tile: retry only.
        e.preventDefault();
        e.stopPropagation();
        this._retryImage(el);
        break;
      case "back":
        this._navigate(`/${this._panelPath()}`);
        break;
      case "open-station":
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        this._navigate(`/${this._panelPath()}/${el.dataset.id}`);
        break;
      case "nav":
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        this._navigate(el.getAttribute("href"));
        break;
      case "add-station":
        this._navigate("/config/integrations/dashboard/add?domain=stations");
        break;
      case "settings":
        this._navigate("/config/integrations/integration/stations");
        break;
      case "device-page":
        this._navigate(`/config/devices/device/${d.device_id}`);
        break;
      case "rename": {
        const name = prompt(this.t("rename_prompt"), d.name);
        if (name && name.trim() && name.trim() !== d.name) {
          await this._call("stations/rename", { entry_id: d.entry_id, name: name.trim() });
        }
        break;
      }
      case "more-info":
        this._moreInfo(el.dataset.entity);
        break;
      case "toggle-picker":
        if (this._picker) this._picker = null;
        else {
          this._picker = { tab: "devices", query: "", stations: [] };
          this._ws("stations/list")
            .then((r) => {
              if (this._picker) {
                this._picker.stations = r.stations;
                const results = this.shadowRoot.getElementById("picker-results");
                if (results) results.innerHTML = this._pickerResults();
              }
            })
            .catch(() => {});
        }
        this._renderDevices();
        this.shadowRoot.getElementById("picker-search")?.focus();
        break;
      case "picker-tab":
        this._picker.tab = el.dataset.tab;
        this._renderDevices();
        this.shadowRoot.getElementById("picker-search")?.focus();
        break;
      case "add-device":
        el.disabled = true;
        await this._call("stations/add_member", { entry_id: d.entry_id, device_id: el.dataset.id });
        break;
      case "add-entity":
        el.disabled = true;
        await this._call("stations/add_member", { entry_id: d.entry_id, entity_id: el.dataset.entity });
        break;
      case "configure-device": {
        const dev = d.devices.find((x) => x.id === el.dataset.id);
        if (!dev) break;
        if (this._devConfig?.deviceId === dev.id) {
          this._devConfig = null;
        } else {
          const disp = dev.display;
          this._devConfig = {
            deviceId: dev.id,
            entities: disp && Array.isArray(disp.entities)
              ? disp.entities.filter((id) => dev.entities.some((e) => e.entity_id === id))
              : [],
            fields: new Set(disp?.fields || []),
            note: disp?.note || "",
          };
        }
        this._renderDevices();
        break;
      }
      case "cfg-up":
      case "cfg-down": {
        const list = this._devConfig.entities;
        const i = list.indexOf(el.dataset.entity);
        const j = action === "cfg-up" ? i - 1 : i + 1;
        if (i >= 0 && j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]];
        this._renderDevices();
        break;
      }
      case "power-settings":
        if (this._powerEdit) {
          this._powerEdit = null;
          this._renderPower();
          break;
        }
        {
          const p = d.power || {};
          const copy = (c) => ({ mode: c?.mode ?? null, label_id: c?.label_id || "", entities: [...(c?.entities || [])] });
          this._powerEdit = { on: copy(p.on), off: copy(p.off), query: { on: "", off: "" }, labels: [] };
          this._renderPower();
          this._ws("config/label_registry/list")
            .then((labels) => {
              if (!this._powerEdit) return;
              this._powerEdit.labels = labels.sort((a, b) => a.name.localeCompare(b.name));
              // A station without power settings starts in label mode with the
              // "Power on" / "Power off" labels, like a newly created station.
              const unset = !p.on?.mode && !p.off?.mode;
              for (const which of ["on", "off"]) {
                const c = this._powerEdit[which];
                if (!c.label_id) c.label_id = this._defaultPowerLabel(which);
                if (unset && c.mode === null && c.label_id) c.mode = "label";
              }
              this._renderPower();
            })
            .catch(() => {});
          this.shadowRoot.getElementById("power-config")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        break;
      case "pw-add":
        this._powerEdit[el.dataset.which].entities.push(el.dataset.entity);
        this._powerEdit.query[el.dataset.which] = "";
        this._renderPower();
        break;
      case "pw-remove": {
        const c = this._powerEdit[el.dataset.which];
        c.entities = c.entities.filter((x) => x !== el.dataset.entity);
        this._renderPower();
        break;
      }
      case "pw-cancel":
        this._powerEdit = null;
        this._renderPower();
        break;
      case "pw-save": {
        const pack = (c) =>
          c.mode === "label"
            ? { mode: "label", label_id: c.label_id }
            : c.mode === "entities"
              ? { mode: "entities", entities: c.entities }
              : { mode: null };
        const pe = this._powerEdit;
        if ((pe.on.mode === "label" && !pe.on.label_id) || (pe.off.mode === "label" && !pe.off.label_id)) {
          this._toast(this.t("power_pick_label"));
          break;
        }
        this._powerEdit = null;
        await this._call("stations/set_power", { entry_id: d.entry_id, on: pack(pe.on), off: pack(pe.off) });
        break;
      }
      case "power": {
        const on = el.dataset.on === "1";
        if (!confirm(on ? this.t("power_confirm_on", d.name) : this.t("power_confirm_off", d.name))) break;
        el.disabled = true;
        try {
          await this._ws("stations/power", { entry_id: d.entry_id, on });
          this._toast(on ? this.t("power_done_on", d.name) : this.t("power_done_off", d.name));
        } catch (err) {
          this._toast(err?.message || String(err));
        } finally {
          el.disabled = false;
        }
        break;
      }
      case "cfg-cancel":
        this._devConfig = null;
        this._renderDevices();
        break;
      case "cfg-save":
      case "cfg-reset": {
        const c = this._devConfig;
        this._devConfig = null;
        await this._call("stations/set_device_display", action === "cfg-reset"
          ? { entry_id: d.entry_id, device_id: c.deviceId, reset: true }
          : { entry_id: d.entry_id, device_id: c.deviceId, entities: c.entities, fields: [...c.fields], note: c.note.trim() });
        break;
      }
      case "copy":
        this._copy(el.dataset.value);
        break;
      case "remove-device": {
        const dev = d.devices.find((x) => x.id === el.dataset.id);
        if (dev && confirm(this.t("confirm_remove", dev.name, d.label_name))) {
          await this._call("stations/remove_member", { entry_id: d.entry_id, device_id: dev.id });
        }
        break;
      }
      case "remove-entity": {
        const id = el.dataset.entity;
        const name = this._hass.states[id]?.attributes.friendly_name || id;
        if (confirm(this.t("confirm_remove", name, d.label_name))) {
          await this._call("stations/remove_member", { entry_id: d.entry_id, entity_id: id });
        }
        break;
      }
      case "edit":
      case "edit-template":
        this._editing = true;
        this._editMode = "write";
        this._draft = action === "edit-template" ? this.t("template") : d.docs.markdown || "";
        this._draftBase = d.docs.updated_at;
        this._remoteChanged = false;
        this._conflict = false;
        this._renderDocs();
        this.shadowRoot.getElementById("editor")?.focus({ preventScroll: true });
        break;
      case "mode":
        this._editMode = el.dataset.mode;
        this._renderDocs();
        break;
      case "cancel-edit":
        if (this._draft !== (d.docs.markdown || "") && !confirm(this.t("unsaved"))) return;
        this._editing = false;
        this._renderDocs();
        break;
      case "save":
        this._saveDocs(false);
        break;
      case "force-save":
        this._saveDocs(true);
        break;
      case "discard-mine":
        this._editing = false;
        this._conflict = false;
        await this._load();
        break;
      case "upload":
        this.shadowRoot.getElementById("file-input")?.click();
        break;
      case "open-file":
        this._lightbox = el.dataset.id;
        this._renderLightbox();
        break;
      case "lb-close":
        this._closeLightbox();
        break;
      case "lb-prev":
        this._stepLightbox(-1);
        break;
      case "lb-next":
        this._stepLightbox(1);
        break;
      case "lb-cover":
        await this._call("stations/set_cover", { entry_id: d.entry_id, file_id: this._lightbox });
        break;
      case "lb-move": {
        const index = d.files.findIndex((f) => f.id === this._lightbox) + Number(el.dataset.dir);
        await this._call("stations/move_file", { entry_id: d.entry_id, file_id: this._lightbox, index });
        break;
      }
      case "lb-delete": {
        const f = d.files.find((x) => x.id === this._lightbox);
        if (f && confirm(this.t("confirm_delete_file", f.caption || f.filename))) {
          const files = d.files;
          const idx = files.indexOf(f);
          const next = files[idx + 1] || files[idx - 1];
          this._lightbox = next ? next.id : null;
          await this._call("stations/delete_file", { entry_id: d.entry_id, file_id: f.id });
          if (!this._lightbox) this._renderLightbox();
        }
        break;
      }
      default:
        break;
    }
  }

  async _call(type, data) {
    try {
      await this._ws(type, data);
      // The subscription pushes a change event that reloads the view; reload
      // directly as well for changes that do not fire one (e.g. no-op label edits).
      await this._load();
      return true;
    } catch (err) {
      this._toast(err?.message || String(err));
      return false;
    }
  }

  /* -------------------------------------------------------- image retries */
  /**
   * A photo failed to load (slow tunnel, dropped connection, expired link).
   * Try again after 1, 3 and 8 seconds. Then fetch fresh links once (they
   * expire after 24 hours) and, if it still fails, show a tap-to-retry tile
   * instead of the browser's broken-image icon.
   */
  _imageFailed(img) {
    if (!(img instanceof HTMLImageElement) || !img.isConnected) return;
    const src = img.getAttribute("src");
    if (!src) return;
    const tries = Number(img.dataset.tries || 0);
    const delays = [1000, 3000, 8000];
    if (tries < delays.length) {
      img.dataset.tries = String(tries + 1);
      setTimeout(() => {
        if (!img.isConnected) return;
        img.removeAttribute("src");
        img.setAttribute("src", src);
      }, delays[tries]);
      return;
    }
    const now = Date.now();
    if (!this._linksRefreshedAt || now - this._linksRefreshedAt > 60000) {
      // New links re-render the images, which starts their retries afresh.
      this._linksRefreshedAt = now;
      this._load();
      return;
    }
    if (img.nextElementSibling?.classList.contains("img-failed")) return;
    img.hidden = true;
    img.insertAdjacentHTML(
      "afterend",
      `<span class="img-failed" data-action="img-retry"><ha-icon icon="mdi:image-off-outline"></ha-icon>${esc(this.t("image_failed"))}</span>`
    );
  }

  _retryImage(placeholder) {
    const img = placeholder.previousElementSibling;
    placeholder.remove();
    if (!(img instanceof HTMLImageElement)) return;
    const src = img.getAttribute("src");
    img.hidden = false;
    img.dataset.tries = "0";
    img.removeAttribute("src");
    img.setAttribute("src", src);
  }

  _defaultPowerLabel(which) {
    // Pre-select an existing "power on" / "power off" style label.
    const labels = this._powerEdit?.labels || [];
    const want = which === "on" ? /power[ _-]?on|aan/i : /power[ _-]?off|uit/i;
    return labels.find((l) => want.test(l.name))?.label_id || "";
  }

  async _copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // navigator.clipboard needs https; fall back for plain-http installs.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      this.shadowRoot.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    this._toast(this.t("copied", text));
  }

  _closeLightbox() {
    const input = this.shadowRoot.getElementById("lb-caption");
    const f = this._detail?.files.find((x) => x.id === this._lightbox);
    if (input && f && input.value.trim() !== f.caption) this._saveCaption(input.value);
    this._lightbox = null;
    this._renderLightbox();
  }

  _stepLightbox(dir) {
    const files = this._detail?.files || [];
    if (files.length < 2) return;
    const input = this.shadowRoot.getElementById("lb-caption");
    const current = files.find((x) => x.id === this._lightbox);
    if (input && current && input.value.trim() !== current.caption) this._saveCaption(input.value);
    const i = files.findIndex((f) => f.id === this._lightbox);
    this._lightbox = files[(i + dir + files.length) % files.length].id;
    this._renderLightbox();
  }

  async _saveCaption(value) {
    const d = this._detail;
    const file = d?.files.find((f) => f.id === this._lightbox);
    if (!file || value.trim() === file.caption) return;
    file.caption = value.trim();
    try {
      await this._ws("stations/update_file", { entry_id: d.entry_id, file_id: file.id, caption: file.caption });
    } catch (err) {
      this._toast(err?.message || String(err));
    }
  }

  _insertIntoEditor(text) {
    const ta = this.shadowRoot.getElementById("editor");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = ta.value.slice(0, start);
    const pad = before && !before.endsWith("\n") ? "\n" : "";
    ta.setRangeText(`${pad}${text}\n`, start, end, "end");
    this._draft = ta.value;
    this._autosize(ta);
    ta.focus({ preventScroll: true });
  }

  async _saveDocs(force) {
    const d = this._detail;
    if (!d || !this._editing) return;
    try {
      const result = await this._ws("stations/save_docs", {
        entry_id: d.entry_id,
        markdown: this._draft,
        base_updated_at: this._draftBase,
        force,
      });
      d.docs = { markdown: this._draft, updated_at: result.updated_at, updated_by: result.updated_by };
      this._editing = false;
      this._conflict = false;
      this._remoteChanged = false;
      this._renderDocs();
      this._toast(this.t("saved"));
    } catch (err) {
      if (err?.code === "conflict") {
        this._conflict = true;
        this._renderDocs();
      } else {
        this._toast(err?.message || String(err));
      }
    }
  }

  /* --- uploads */
  async _prepareImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return file;
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
      if (scale >= 1) {
        bitmap.close?.();
        return file;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
      const type = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
      if (!blob || blob.size >= file.size) return file;
      const name = type === "image/jpeg" ? file.name.replace(/\.(webp|jpe?g)$/i, "") + ".jpg" : file.name;
      return new File([blob], name, { type });
    } catch (e) {
      return file;
    }
  }

  _uploadText(u) {
    return u.pct > 0 ? this.t("uploading_pct", u.name, u.pct) : this.t("uploading", u.name);
  }

  _setUploadProgress(u, pct) {
    u.pct = pct;
    const el = this.shadowRoot.getElementById(`up-${u.id}`);
    if (el) el.textContent = this._uploadText(u);
  }

  /** Turn a failed response into a message a person can act on. */
  async _uploadError(resp, name) {
    if (resp.status === 401 || resp.status === 403) return this.t("err_signed_out");
    if (resp.status === 413) return this.t("err_too_large", name, MAX_UPLOAD_MB);
    if (resp.status === 415) return this.t("err_wrong_type", name);
    try {
      const msg = (await resp.json()).message;
      if (msg) return msg;
    } catch (e) {
      /* no JSON body */
    }
    return resp.status >= 500 || resp.status === 0 ? this.t("err_connection", name) : `${this.t("upload_failed", name, resp.status)}`;
  }

  /**
   * fetch with retries for a dropped connection or a proxy hiccup (502-504).
   * Returns the response, or throws UploadError with a readable message.
   */
  async _uploadFetch(url, init, name) {
    const delays = [1000, 3000, 8000];
    for (let attempt = 0; ; attempt++) {
      let resp;
      try {
        resp = await this._hass.fetchWithAuth(url, init);
      } catch (err) {
        resp = null;
      }
      if (resp && ![502, 503, 504].includes(resp.status)) return resp;
      if (attempt >= delays.length) {
        throw new UploadError(this.t("err_connection", name));
      }
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
  }

  /** Send one file in pieces: start, pieces in order, finish. */
  async _uploadOne(entryId, file, u) {
    const name = file.name;
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new UploadError(this.t("err_too_large", name, MAX_UPLOAD_MB));
    if (!UPLOAD_TYPES.includes(file.type) && !/\.(txt|jpe?g|png|gif|webp|pdf)$/i.test(name)) {
      throw new UploadError(this.t("err_wrong_type", name));
    }
    const base = `/api/stations/${entryId}/uploads`;
    let resp = await this._uploadFetch(
      base,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: name, size: file.size }) },
      name
    );
    if (!resp.ok) throw new UploadError(await this._uploadError(resp, name));
    const { upload_id: id, chunk_size: chunk } = await resp.json();
    const url = `${base}/${id}`;
    try {
      let offset = 0;
      while (offset < file.size) {
        resp = await this._uploadFetch(`${url}?offset=${offset}`, { method: "PUT", body: file.slice(offset, offset + chunk) }, name);
        if (resp.status === 409) {
          // A piece landed but its answer got lost: continue where the server is.
          offset = (await resp.json()).received;
        } else if (!resp.ok) {
          throw new UploadError(await this._uploadError(resp, name));
        } else {
          offset = (await resp.json()).received;
        }
        this._setUploadProgress(u, Math.min(99, Math.round((offset / file.size) * 100)));
      }
      resp = await this._uploadFetch(url, { method: "POST" }, name);
      if (!resp.ok) throw new UploadError(await this._uploadError(resp, name));
    } catch (err) {
      this._hass.fetchWithAuth(url, { method: "DELETE" }).catch(() => {});
      throw err;
    }
  }

  async _uploadFiles(files) {
    const d = this._detail;
    if (!d || !files.length) return;
    const queued = files.map((original) => ({ original, u: { id: ++this._uploadSeq, name: original.name, pct: 0 } }));
    this._uploads.push(...queued.map((q) => q.u));
    this._renderFiles();
    const failed = [];
    for (const { original, u } of queued) {
      try {
        const file = await this._prepareImage(original);
        await this._uploadOne(d.entry_id, file, u);
      } catch (err) {
        failed.push(err instanceof UploadError ? err.message : this.t("upload_failed", original.name, err?.message || String(err)));
      } finally {
        this._uploads.splice(this._uploads.indexOf(u), 1);
      }
    }
    if (failed.length === 1 && files.length === 1) this._toast(failed[0]);
    else if (failed.length) this._toast(this.t("upload_summary", files.length - failed.length, files.length, failed.join(" · ")));
    await this._load();
  }
}

customElements.define("stations-panel", StationsPanel);
