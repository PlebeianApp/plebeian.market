import "./index.js";
import { d as db, e as eq, n as shipping, o as shippingZones } from "./types.js";
import "./constants.js";
import "./utils.js";
const getShippingByStallId = async (stallId) => {
  const shippingResult = await db.query.shipping.findMany({
    where: eq(shipping.stallId, stallId),
    with: {
      shippingZones: true
    }
  });
  const shippingInfos = shippingResult.map((shipping2) => ({
    id: shipping2.id,
    name: shipping2.name,
    baseCost: shipping2.baseCost,
    isDefault: shipping2.isDefault,
    zones: shipping2.shippingZones.map((zone) => ({
      region: zone.regionCode,
      country: zone.countryCode
    }))
  }));
  return shippingInfos;
};
const getShippingZonesByStallId = async (stallId) => {
  const shippingZonesResult = await db.query.shippingZones.findMany({
    where: eq(shippingZones.stallId, stallId)
  });
  const zones = shippingZonesResult.map((zone) => ({
    region: zone.regionCode,
    country: zone.countryCode
  }));
  return zones;
};
export {
  getShippingZonesByStallId as a,
  getShippingByStallId as g
};
