from homeassistant.helpers.discovery import async_load_platform
DOMAIN = "fakedev"
DEVICES = [
  # name, manufacturer, model, entities[(platform, key, name, state, unit, icon, category)]
  ("Pump controller", "Shelly", "Pro 4PM", [("sensor","power","Power","42.7","W",None,None),("switch","relay","Relay","on",None,None,None),("sensor","rssi","Signal strength","-61","dBm",None,"diagnostic"),("sensor","fw","Firmware","1.4.2",None,None,"diagnostic")]),
  ("Flow sensor", "Sika", "VVX20", [("sensor","flow","Flow","12.4","L/min","mdi:water",None),("sensor","temp","Water temperature","18.1","°C",None,None)]),
  ("Network switch", "Ubiquiti", "USW-Lite-8-PoE", [("sensor","ports","Ports in use","5",None,"mdi:ethernet",None),("sensor","poe","PoE power","23.0","W",None,None),("sensor","uptime","Uptime","3d 4h",None,None,"diagnostic")]),
  ("Cabinet climate", "Aqara", "TH-S02D", [("sensor","t","Temperature","24.6","°C",None,None),("sensor","h","Humidity","41","%",None,None),("sensor","bat","Battery","87","%",None,"diagnostic")]),
  ("Door contact", "Aqara", "MCCGQ11LM", [("binary_sensor","door","Door","off",None,None,None),("sensor","bat","Battery","unavailable","%",None,"diagnostic")]),
  ("UPS", "APC", "Back-UPS 700", [("sensor","load","Load","unavailable","%",None,None),("sensor","runtime","Runtime","unavailable","min",None,None)]),
  ("Label printer", "Brother", "QL-820NWB", [("sensor","status","Status","idle",None,"mdi:printer",None)]),
  ("Shelly Plug S", "Shelly", "SNPL-00112EU", [("switch","plug","Plug","off",None,None,None),("sensor","p","Power","0.0","W",None,None)]),
]
from homeassistant.config_entries import SOURCE_IMPORT
async def async_setup(hass, config):
    hass.data[DOMAIN] = DEVICES
    hass.async_create_task(hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_IMPORT}, data={}))
    return True
async def async_setup_entry(hass, entry):
    hass.data[DOMAIN] = DEVICES
    await hass.config_entries.async_forward_entry_setups(entry, ["sensor","switch","binary_sensor"])
    return True
