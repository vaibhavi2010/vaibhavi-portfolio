import { Pool } from "pg";
import { Resend } from "resend";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s = "") {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

    const safeFirst = escapeHtml(String(first_name));
    const safeLast = escapeHtml(String(last_name || ""));
    const safeEmail = escapeHtml(String(email));
    const safeSubject = escapeHtml(String(subject || ""));
    const safeMessage = escapeHtml(String(message));
    const safePage = escapeHtml(String(page || ""));

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "vhonagek@asu.edu",
      replyTo: email,
      subject: `New Portfolio Contact: ${subject || "No Subject"}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${safeFirst} ${safeLast}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replaceAll("\n", "<br/>")}</p>
        <hr/>
        <small>Page: ${safePage}</small>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
