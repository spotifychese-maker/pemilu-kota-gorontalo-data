/* analytics.js
   Helper analitik umum. File ini disiapkan agar fungsi-fungsi analitik bisa dipindah bertahap
   tanpa mengganggu dashboard utama.
*/
window.DEMO_ANALYTICS = window.DEMO_ANALYTICS || {};

window.DEMO_ANALYTICS.formatNumber = function(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("id-ID");
};

window.DEMO_ANALYTICS.cleanName = function(name) {
  let s = String(name || "").trim();
  if (!s) return "-";
  s = s.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();

  let before = "";
  while (before !== s) {
    before = s;
    s = s.replace(/^\s*(?:H\.?|HI\.?|HJ\.?|HA\.?|HAJI|HAJJAH|DR\.?|DRS\.?|DRA\.?|IR\.?|PROF\.?|CAPT\.?)\s+/i, "");
  }

  if (s.includes(",")) s = s.split(",")[0].trim();

  before = "";
  while (before !== s) {
    before = s;
    s = s
      .replace(/\s+(?:S\.?\s?E\.?|SE|S\.?\s?H\.?|SH|S\.?\s?T\.?|ST|S\.?\s?P\.?|SP|S\.?\s?M\.?|SM|S\.?\s?MN\.?|SMN|S\.?\s?AG\.?|SAG|S\.?\s?AK\.?|SAK|S\.?\s?KEP\.?|SKEP|S\.?\s?PT\.?|SPT|S\.?\s?I\.?\s?P\.?|SIP|S\.?\s?I\.?\s?KOM\.?|SIKOM|S\.?\s?KOM\.?|SKOM|S\.?\s?KM\.?|SKM|S\.?\s?SOS\.?|SSOS|S\.?\s?PD\.?\s?K\.?|S\.?\s?PDK\.?|SPDK|S\.?\s?PD\.?\s?I\.?|S\.?\s?PDI\.?|SPDI|S\.?\s?PD\.?|SPD|S\.?\s?SI\.?|SSI|M\.?\s?M\.?|MM|M\.?\s?H\.?|MH|M\.?\s?SI\.?|MSI|M\.?\s?AP\.?|MAP|M\.?\s?KOM\.?|MKOM|M\.?\s?KN\.?|MKN|M\.?\s?PD\.?|MPD|M\.?\s?P\.?|MP|M\.?\s?T\.?|MT|M\.?\s?MAR\.?|MMAR|A\.?\s?MD\.?\s?AK\.?|AMDAK|A\.?\s?MD\.?|AMD|A\.?\s?MA\.?\s?AK\.?|AMAAK|CCPS|C\.?\s?C\.?\s?P\.?\s?S\.?|CATS|C\.?\s?A\.?\s?T\.?\s?S\.?)\.?$/i, "")
      .replace(/\s*,\s*$/g, "");
  }

  return s.replace(/\s+/g, " ").trim();
};

window.DEMO_ANALYTICS.calculateSainteLague = function(partyVotes, seats) {
  const rows = [];
  Object.entries(partyVotes || {}).forEach(([partai, suara]) => {
    for (let pembagi = 1; pembagi <= seats * 2 + 1; pembagi += 2) {
      rows.push({ partai, suara, pembagi, hasil: suara / pembagi });
    }
  });
  return rows.sort((a, b) => b.hasil - a.hasil).slice(0, seats);
};
