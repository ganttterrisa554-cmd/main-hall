import { Resend } from "resend";
import { storeInboundEmail } from "@/lib/mail";

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const key = process.env.RESEND_API_KEY?.trim();
  if (!secret || !key) return new Response("Inbound email is not configured", { status: 503 });

  const payload = await request.text();
  let event;
  try {
    event = new Resend(key).webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "email.received") {
    await storeInboundEmail(event.data.email_id);
  }
  return new Response("OK");
}
