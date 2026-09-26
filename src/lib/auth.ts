import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { sql } from "@/lib/db";

export const SESSION_COOKIE = "mainhall_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  kind: "team" | "partner";
  mustChangePassword: boolean;
  personId: string | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`insert into sessions (token_hash, user_id, expires_at) values (${hashToken(token)}, ${userId}, ${expires})`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await sql`delete from sessions where token_hash = ${hashToken(token)}`;
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await sql`
    select u.id, u.email, u.name, u.kind, u.must_change_password, u.person_id
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()`;
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    kind: row.kind,
    mustChangePassword: row.must_change_password,
    personId: row.person_id,
  };
});

export async function requireTeam() {
  const user = await getCurrentUser();
  if (!user || user.kind !== "team") redirect("/admin/login");
  return user;
}

export async function requirePartner() {
  const user = await getCurrentUser();
  if (!user || user.kind !== "partner") {
    const path = (await headers()).get("x-mainhall-path") ?? "";
    const returnTo = path.startsWith("/partners/") && !path.startsWith("/partners/login") ? path : "";
    redirect(returnTo ? `/partners/login?next=${encodeURIComponent(returnTo)}` : "/partners/login");
  }
  return user;
}
