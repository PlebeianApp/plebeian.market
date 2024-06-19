const numSatsInBtc = 1e8;
const standardDisplayDateFormat = "dd-MM-yyyy";
const KindProducts = 30018;
const KindStalls = 30017;
const KindHttpAuth = 27235;
const availabeLogos = [
  {
    value: "/logo.svg",
    label: "Plebeian Market"
  },
  {
    value: "/bitcoin.svg",
    label: "Bitcoin"
  },
  {
    value: "/nostrich.svg",
    label: "Nostrich"
  },
  {
    value: "/shaka.svg",
    label: "Shaka"
  }
];
const validUrls = Object.values(availabeLogos).map((logo) => logo.value);
export {
  KindProducts as K,
  KindStalls as a,
  KindHttpAuth as b,
  availabeLogos as c,
  numSatsInBtc as n,
  standardDisplayDateFormat as s,
  validUrls as v
};
