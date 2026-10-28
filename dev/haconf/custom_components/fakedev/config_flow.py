from homeassistant.config_entries import ConfigFlow
class Flow(ConfigFlow, domain="fakedev"):
    async def async_step_import(self, data):
        await self.async_set_unique_id("fake"); self._abort_if_unique_id_configured()
        return self.async_create_entry(title="Fake devices", data={})
