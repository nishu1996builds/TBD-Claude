// Import Storefront Radar output into Softopen.
// Usage: node src/ingest.mjs path/to/leads.json   (the file the Radar pipeline writes to data/)
import { readFileSync } from "node:fs";
import { openDb } from "./db.mjs";

const file = process.argv[2];
if (!file) { console.error("usage: node src/ingest.mjs <leads.json>"); process.exit(2); }
const body = JSON.parse(readFileSync(file, "utf8"));
const leads = Array.isArray(body) ? body : body.leads;
if (!Array.isArray(leads)) { console.error("expected an array or {leads: [...]}"); process.exit(2); }

const db = openDb();
const before = db.leadCount();
db.raw.exec("BEGIN");
try { for (const l of leads) db.upsertLead(l); db.raw.exec("COMMIT"); } catch (e) { db.raw.exec("ROLLBACK"); throw e; }
console.log(JSON.stringify({ received: leads.length, new: db.leadCount() - before, total: db.leadCount(), generated: body.generated || null }));
db.close();
