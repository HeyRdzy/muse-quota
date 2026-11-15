// ─────────────────────────────────────────────────────────────
// Muse Quota Widget — Scriptable (iOS)
// Shows your Muse usage quota: remaining %, progress bar, reset time.
// Data source (auto-updated every 3h):
//   https://raw.githubusercontent.com/HeyRdzy/muse-quota/main/quota.json
// Colours: green ≥25% left, yellow <25%, red <10%.
// If the fetch fails, the last cached data is shown with a "cache" note.
// ─────────────────────────────────────────────────────────────

const DATA_URL = "https://raw.githubusercontent.com/HeyRdzy/muse-quota/main/quota.json";
const REFRESH_HOURS = 3;

// ---------- data: fetch, fall back to cache ----------
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.documentsDirectory(), "muse-quota-cache.json");

let data = null;
let fromCache = false;

try {
  const req = new Request(DATA_URL);
  req.timeoutInterval = 20;
  data = await req.loadJSON();
  // Save a good copy for offline use.
  fm.writeString(cachePath, JSON.stringify(data));
} catch (e) {
  fromCache = true;
  if (fm.fileExists(cachePath)) {
    try { data = JSON.parse(fm.readString(cachePath)); } catch (_) { data = null; }
  }
}

// Last-resort placeholder so the widget never renders empty.
if (!data) {
  data = {
    plan: "Free",
    weekly_used_pct: null,
    weekly_remaining_pct: null,
    reset_at: null,
    reset_display: "—",
    additional_used_pct: null,
    additional_left: "—",
    updated_at: null,
  };
  fromCache = true;
}

// ---------- helpers ----------
function remainingPct() {
  const v = data.weekly_remaining_pct;
  return (typeof v === "number" && isFinite(v)) ? v : null;
}

function barColor(pct) {
  if (pct === null) return new Color("#8E8E93");       // grey = unknown
  if (pct < 10) return new Color("#FF453A");           // red
  if (pct < 25) return new Color("#FFD60A");           // yellow
  return new Color("#30D158");                         // green
}

function pad(n) { return (n < 10 ? "0" : "") + n; }

function resetText() {
  if (!data.reset_at) return "Reset: " + (data.reset_display || "—");
  const reset = new Date(data.reset_at);
  const now = new Date();
  let diff = reset - now;
  if (isNaN(reset.getTime())) return "Reset: " + (data.reset_display || "—");
  if (diff <= 0) return "Reset: segera";
  const mins = Math.floor(diff / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return "Reset " + d + "h " + h + "j lagi";
  if (h > 0) return "Reset " + h + "j " + m + " mnt lagi";
  return "Reset " + m + " mnt lagi";
}

function updatedText() {
  if (!data.updated_at) return "";
  const u = new Date(data.updated_at);
  if (isNaN(u.getTime())) return "";
  return "Update " + pad(u.getHours()) + ":" + pad(u.getMinutes());
}

function drawProgressBar(pct, width, height) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  // Track
  ctx.setFillColor(new Color("#3A3A3C"));
  ctx.fillRoundedRect(new Rect(0, 0, width, height), height / 2);
  // Fill (clamp 0..100; a 0% bar still shows a tiny red nub so it is visible)
  const frac = pct === null ? 0 : Math.max(0, Math.min(100, pct)) / 100;
  const fillW = Math.max(frac * width, frac > 0 ? 6 : (pct === 0 ? 6 : 0));
  if (fillW > 0) {
    ctx.setFillColor(barColor(pct));
    ctx.fillRoundedRect(new Rect(0, 0, fillW, height), height / 2);
  }
  return ctx.getImage();
}

// ---------- widget ----------
const widget = new ListWidget();
widget.backgroundColor = new Color("#1C1C1E");
widget.setPadding(12, 14, 12, 14);

const pct = remainingPct();

// Header: MUSE + plan
const header = widget.addStack();
header.centerAlignContent();
const title = header.addText("MUSE");
title.font = Font.boldSystemFont(15);
title.textColor = Color.white();
header.addSpacer();
const plan = header.addText((data.plan || "Free").toUpperCase());
plan.font = Font.semiboldSystemFont(11);
plan.textColor = new Color("#AEAEB2");
widget.addSpacer(6);

// Big remaining number
const big = widget.addText(pct === null ? "—" : Math.round(pct) + "%");
big.font = Font.boldSystemFont(34);
big.textColor = barColor(pct);
const sub = widget.addText("sisa kuota mingguan");
sub.font = Font.systemFont(11);
sub.textColor = new Color("#AEAEB2");
widget.addSpacer(8);

// Progress bar
const barImg = drawProgressBar(pct, 300, 12);
const bar = widget.addImage(barImg);
bar.imageSize = new Size(300, 12);
widget.addSpacer(8);

// Reset line
const reset = widget.addText("⟳  " + resetText());
reset.font = Font.systemFont(11);
reset.textColor = Color.white();
widget.addSpacer(2);

// Additional tokens line
const extra = widget.addText("Token tambahan: " + (data.additional_left || "—"));
extra.font = Font.systemFont(11);
extra.textColor = new Color("#AEAEB2");
widget.addSpacer(6);

// Footer: update time + cache note
const foot = widget.addStack();
foot.centerAlignContent();
const upd = foot.addText(updatedText());
upd.font = Font.systemFont(10);
upd.textColor = new Color("#636366");
if (fromCache) {
  foot.addSpacer();
  const c = foot.addText("⚠️ cache");
  c.font = Font.semiboldSystemFont(10);
  c.textColor = new Color("#FFD60A");
}

// Ask iOS to refresh again in 3 hours (data itself updates every 3h too).
widget.refreshAfterDate = new Date(Date.now() + REFRESH_HOURS * 60 * 60 * 1000);

Script.setWidget(widget);
Script.complete();
