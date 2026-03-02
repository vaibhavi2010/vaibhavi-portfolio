import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { first_name, last_name, email, subject, message, page, user_agent, website } = req.body || {};

  if ((website || "").trim() !== "") {
    return res.status(400).json({ success: false, error: "Spam detected" });
  }

  if (!first_name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    await pool.query(
      `INSERT INTO contacts (first_name, last_name, email, subject, message, page, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [first_name, last_name || "", email, subject || "", message, page || "", user_agent || ""]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
}
