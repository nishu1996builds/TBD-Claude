// Loads the scoring, normalization and query code straight out of the
// Storefront Radar app, so the daily pipeline and the app always agree.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const APP = join(here, "..", "..", "tools", "radar", "index.html");

export function loadRadarCore() {
  const html = readFileSync(APP, "utf8");
  const start = html.indexOf("const SOURCES = [");
  const end = html.indexOf("function logReq(");
  if (start < 0 || end < 0 || end < start) {
    throw new Error("Could not find the Radar core code in tools/radar/index.html. Did the app's structure change?");
  }
  const code = html.slice(start, end) + `
;globalThis.__radar = { SOURCES, PRESETS, OTHER, DEFAULT_TEMPLATES, DEFAULT_OFFER, S,
  normalizeRow, dedupe, enrich, buildWhere, buildUrl, presetOf, categoryNoun, band,
  fmtDate, todayISO, addDays, daysBetween, SOS };`;
  const sandbox = { console, Date, Math, JSON, RegExp, String, Number, Array, Object, Set, Map, Intl,
    encodeURIComponent, decodeURIComponent, parseFloat, parseInt, isNaN, setTimeout, clearTimeout };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "radar-core.js" });
  return sandbox.__radar;
}
