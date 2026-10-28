from homeassistant.helpers.entity import Entity, DeviceInfo, EntityCategory
EXTRA = {
  'Pump controller': dict(configuration_url='http://10.0.20.31/', connections={('mac','a8:03:2a:b1:4c:90')}, sw_version='1.4.2', serial_number='A8032AB14C90'),
  'Network switch': dict(configuration_url='https://10.0.20.2/', connections={('mac','74:ac:b9:12:34:56')}, sw_version='7.1.26'),
  'Flow sensor': dict(serial_number='VVX-20-55821'),
  'Shelly Plug S': dict(configuration_url='http://10.0.20.44/', connections={('mac','c8:c9:a3:0f:22:11')}),
}
PLATFORM = "binary_sensor"
class Fake(Entity):
    _attr_should_poll = False
    _attr_has_entity_name = True
    def __init__(self, dev, ent):
        name, man, model, _ = dev
        _, key, ename, state, unit, icon, cat = ent
        self._attr_unique_id = f"{name}_{key}"
        self._attr_name = ename
        self._st = state
        self._attr_icon = icon
        self._attr_entity_category = EntityCategory(cat) if cat else None
        if unit: self._attr_unit_of_measurement = unit
        extra = EXTRA.get(name, {})
        self._attr_device_info = DeviceInfo(identifiers={("fakedev", name)}, name=name, manufacturer=man, model=model, **extra)
    @property
    def available(self): return self._st != "unavailable"
    @property
    def state(self): return self._st
async def async_setup_entry(hass, entry, add):
    add([Fake(d, e) for d in hass.data["fakedev"] for e in d[3] if e[0] == PLATFORM])
