export function openapi(baseUrl, prices) {
  const money = (c) => `$${(c / 100).toFixed(2)}`;
  const lead = {
    type: "object",
    properties: {
      id: { type: "string", example: "so_3f9a1c2b7d4e", description: "Stable id. Same business, same id, across days." },
      name: { type: "string", description: "Trade name as filed" },
      legal_name: { type: "string", nullable: true },
      industry: { type: "string", example: "Restaurants and food" },
      category: { type: "string", nullable: true, description: "Raw license or NAICS category from the source" },
      address: { type: "string" }, city: { type: "string" }, state: { type: "string", example: "TX" }, zip: { type: "string" },
      filed: { type: "string", format: "date", description: "Date of the filing that produced this lead" },
      first_seen: { type: "string", format: "date", description: "First day Softopen saw this business" },
      stage: { type: "string", enum: ["application", "inspection", "tax", "license", "registration", "entity"], description: "Earliest first: application (liquor license applied for), inspection (pre-license health check), tax (sales tax permit), license (business license issued), registration (business tax receipt), entity (new LLC or corporation)" },
      score: { type: "integer", minimum: 0, maximum: 100, description: "POS fit 35, recency 25, physical storefront 15, independent owner 15, pre-opening signal 10" },
      band: { type: "string", enum: ["hot", "warm"] },
      phone: { type: "string", nullable: true }, email: { type: "string", nullable: true },
      sources: { type: "array", items: { type: "string" } },
      why: { type: "array", items: { type: "object", properties: { k: { type: "string" }, pts: { type: "integer" }, max: { type: "integer" }, note: { type: "string" } } } },
    },
  };
  const confirmation = {
    type: "object",
    properties: {
      id: { type: "string", example: "cf_8a1b2c3d4e5f" },
      lead_id: { type: "string" },
      status: { type: "string", enum: ["pending", "confirmed", "not_opening", "unreachable"], description: "unreachable and not_opening are refunded in full" },
      questions: { type: "array", items: { type: "string" } },
      price_cents: { type: "integer" },
      result: { type: "object", nullable: true, properties: {
        owner_name: { type: "string", nullable: true }, decision_maker: { type: "string", nullable: true },
        opening_date: { type: "string", nullable: true, description: "ISO date or free text like 'late November'" },
        phone: { type: "string", nullable: true }, has_pos: { type: "string", nullable: true, description: "Known POS or payment provider, if any" },
        notes: { type: "string", nullable: true }, answers: { type: "array", items: { type: "string" } },
      } },
      requested_at: { type: "string", format: "date-time" }, completed_at: { type: "string", format: "date-time", nullable: true },
    },
  };
  const err = (desc) => ({ description: desc, content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" }, message: { type: "string" } } } } } });
  const metered = (cents) => ({
    "X-Price-Cents": { description: "What this call costs", schema: { type: "integer", example: cents } },
    "X-Charged-Cents": { description: "What was charged", schema: { type: "integer" } },
    "X-Balance-Cents": { description: "Credits left on the key", schema: { type: "integer" } },
  });
  return {
    openapi: "3.1.0",
    info: {
      title: "Softopen",
      version: "0.1.0",
      summary: "Businesses that are about to open, before they pick their vendors.",
      description: `Softopen turns public pre-opening filings (liquor applications, pre-license inspections, sales tax permits, business licenses, new entities) into scored storefront leads, and offers a human phone confirmation on any lead.\n\n**Auth:** \`Authorization: Bearer so_live_...\`. Keys hold prepaid credits in cents. Each metered call returns \`X-Charged-Cents\` and \`X-Balance-Cents\`.\n\n**Pricing:** search ${money(prices.search_cents)} per call (up to 50 leads), lead ${money(prices.lead_cents)}, human confirmation ${money(prices.confirm_cents)} (refunded if the business is unreachable or not opening). Each key has a daily spend cap, default $20.\n\n**When you run out:** a metered call returns 402 with a JSON body that tells you how to add credits. Unauthenticated calls return 401 with the same instructions.`,
      contact: { name: "Softopen", url: baseUrl },
    },
    servers: [{ url: baseUrl }],
    security: [{ bearer: [] }],
    components: {
      securitySchemes: { bearer: { type: "http", scheme: "bearer", description: "API key, so_live_..." } },
      schemas: { Lead: lead, Confirmation: confirmation },
    },
    paths: {
      "/v1/leads": {
        get: {
          operationId: "searchLeads", summary: `Search pre-opening leads (${money(prices.search_cents)} per call)`,
          description: "Filter by territory and fit. Sorted by score, then most recent filing. Use offset to page; every page is a metered call.",
          parameters: [
            { name: "state", in: "query", schema: { type: "string", example: "TX" }, description: "Two-letter state" },
            { name: "city", in: "query", schema: { type: "string", example: "Houston" } },
            { name: "zip_prefix", in: "query", schema: { type: "string", example: "770" }, description: "First 3 to 5 digits of a ZIP" },
            { name: "industry", in: "query", schema: { type: "string", enum: ["Restaurants and food", "Bars and nightlife", "Retail", "Beauty and wellness", "Fitness", "Auto"] }, description: "Substring match, case-insensitive" },
            { name: "min_score", in: "query", schema: { type: "integer", default: 55 }, description: "55 is warm, 75 is hot" },
            { name: "filed_since", in: "query", schema: { type: "string", format: "date" } },
            { name: "first_seen_since", in: "query", schema: { type: "string", format: "date" }, description: "Only leads Softopen first saw on or after this date. Use yesterday's date for a daily delta." },
            { name: "stage", in: "query", schema: { type: "string", enum: ["application", "inspection", "tax", "license", "registration", "entity"] } },
            { name: "has_email", in: "query", schema: { type: "boolean" } },
            { name: "has_phone", in: "query", schema: { type: "boolean" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 25, maximum: 50 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: {
            200: { description: "Leads", headers: metered(prices.search_cents), content: { "application/json": { schema: { type: "object", properties: { total: { type: "integer" }, limit: { type: "integer" }, offset: { type: "integer" }, leads: { type: "array", items: { $ref: "#/components/schemas/Lead" } } } } } } },
            401: err("No or invalid API key"), 402: err("Not enough credits; body says how to top up"), 429: err("Daily cap reached or too many requests"),
          },
        },
      },
      "/v1/leads/{id}": {
        get: {
          operationId: "getLead", summary: `One lead by id (${money(prices.lead_cents)})`,
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Lead, plus any confirmation this key requested", headers: metered(prices.lead_cents), content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/Lead" }, { type: "object", properties: { confirmation: { $ref: "#/components/schemas/Confirmation", nullable: true } } }] } } } }, 401: err("No or invalid API key"), 402: err("Not enough credits"), 404: err("Unknown lead") },
        },
      },
      "/v1/leads/{id}/confirm": {
        post: {
          operationId: "requestConfirmation", summary: `Ask a human to phone the business (${money(prices.confirm_cents)}, refunded if unreachable)`,
          description: "A person calls the business, confirms it is real and opening, finds the decision maker and the opening date, and asks your questions. Usually done within 2 business days. Poll GET /v1/confirmations/{id} or give a callback_url.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { questions: { type: "array", maxItems: 3, items: { type: "string", maxLength: 200 }, description: "Up to 3 short questions to ask the owner" }, callback_url: { type: "string", format: "uri", description: "POSTed the Confirmation object when done" } } } } } },
          responses: { 201: { description: "Confirmation created", headers: metered(prices.confirm_cents), content: { "application/json": { schema: { $ref: "#/components/schemas/Confirmation" } } } }, 200: { description: "A pending confirmation already exists for this lead on this key (not charged again)", content: { "application/json": { schema: { $ref: "#/components/schemas/Confirmation" } } } }, 401: err("No or invalid API key"), 402: err("Not enough credits"), 404: err("Unknown lead") },
        },
      },
      "/v1/confirmations/{id}": {
        get: { operationId: "getConfirmation", summary: "Status and result of a confirmation (free)", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Confirmation", content: { "application/json": { schema: { $ref: "#/components/schemas/Confirmation" } } } }, 404: err("Unknown confirmation") } },
      },
      "/v1/account": { get: { operationId: "getAccount", summary: "Balance, today's spend, daily cap (free)", responses: { 200: { description: "Account", content: { "application/json": { schema: { type: "object", properties: { key_id: { type: "string" }, label: { type: "string", nullable: true }, balance_cents: { type: "integer" }, spent_today_cents: { type: "integer" }, daily_cap_cents: { type: "integer" }, prices: { type: "object" } } } } } } } } },
      "/v1/sources": { get: { operationId: "getCoverage", summary: "Coverage by state: lead counts, newest filing, contact availability (free, no key needed)", security: [], responses: { 200: { description: "Coverage", content: { "application/json": { schema: { type: "object", properties: { total_leads: { type: "integer" }, states: { type: "array", items: { type: "object" } } } } } } } } } },
      "/v1/pricing": { get: { operationId: "getPricing", summary: "Current prices in cents (free, no key needed)", security: [], responses: { 200: { description: "Prices" } } } },
    },
  };
}
