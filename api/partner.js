/* =========================================================
   AI HOUSE BUCHAREST — Partner form serverless function
   POST /api/partner
   Body: { name, email, company, contribution, website? }
   - Validates input + honeypot
   - Authenticates with a Google service account (env vars)
   - Appends a row to the partner Google Sheet
   ========================================================= */

import { JWT } from "google-auth-library";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || "Sheet1!A:E";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

        // Honeypot — bots happily fill hidden fields. If `website` has any
        // content, silently "succeed" so the bot thinks it worked.
        if (body.website && String(body.website).trim() !== "") {
            return res.status(200).json({ ok: true });
        }

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim();
        const company = String(body.company || "").trim();
        const contribution = String(body.contribution || "").trim();

        if (!name || !email || !company || !contribution) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Loose RFC-ish email check — enough to reject typos / obvious junk.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        // Length limits — prevent abuse via giant payloads.
        if (name.length > 200 || email.length > 200 ||
            company.length > 200 || contribution.length > 5000) {
            return res.status(400).json({ error: "Field too long" });
        }

        if (!SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            console.error("Missing GOOGLE_SHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON env vars");
            return res.status(500).json({ error: "Server not configured" });
        }

        // Service account JSON is stored as a single-line env var. Private-key
        // newlines are commonly stored as the literal \n — restore them here.
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        const privateKey = String(credentials.private_key || "").replace(/\\n/g, "\n");

        const auth = new JWT({
            email: credentials.client_email,
            key: privateKey,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const tokenResponse = await auth.getAccessToken();
        const accessToken = tokenResponse && tokenResponse.token
            ? tokenResponse.token
            : tokenResponse;

        const url = "https://sheets.googleapis.com/v4/spreadsheets/" +
            encodeURIComponent(SHEET_ID) + "/values/" +
            encodeURIComponent(SHEET_RANGE) +
            ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS";

        const timestamp = new Date().toISOString();

        const sheetsResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                values: [[timestamp, name, email, company, contribution]],
            }),
        });

        if (!sheetsResponse.ok) {
            const text = await sheetsResponse.text();
            console.error("Sheets API error:", sheetsResponse.status, text);
            return res.status(502).json({ error: "Could not save to sheet" });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Partner handler error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
