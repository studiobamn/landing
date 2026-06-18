import { NextResponse } from "next/server";
import { Resend } from "resend";

// Shared email handler for the Product inquiry form (PRODUCT.md) and any
// future Contact form (CONTACT.md is mailto-only by default).
// Requires RESEND_API_KEY + RESEND_FROM_EMAIL (verified domain).

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  product?: string; // product name, pre-filled from the Product CTA
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_EMAIL_TO;
  if (!apiKey || !from || !to) {
    return NextResponse.json(
      { error: "Email is not configured." },
      { status: 503 },
    );
  }

  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { name, email, message, product } = body;
  if (!email || !message) {
    return NextResponse.json(
      { error: "email and message are required." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const subject = product
    ? `BAMN inquiry — ${product}`
    : "BAMN LANDING CONTACT";

  const { error } = await resend.emails.send({
    from,
    to, // studio inbox; adjust if a dedicated address is used
    replyTo: email,
    subject,
    text: [
      product ? `Product: ${product}` : null,
      name ? `Name: ${name}` : null,
      `Email: ${email}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
