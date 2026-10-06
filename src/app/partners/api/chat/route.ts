import type { NextRequest } from "next/server";
import { requirePartner } from "@/lib/auth";
import { listChatMessages, markChatRead } from "@/lib/repo";

export async function GET(request: NextRequest) {
  const user = await requirePartner();
  if (!user.personId) return Response.json({ messages: [], unreadOut: 0 });
  if (request.nextUrl.searchParams.get("read") === "1") {
    await markChatRead(user.personId, "out");
  }
  const messages = await listChatMessages(user.personId);
  return Response.json({
    messages,
    unreadOut: messages.filter((m) => m.direction === "out" && !m.readAt).length,
  });
}
