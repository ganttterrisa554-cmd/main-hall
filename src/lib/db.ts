import { neon, neonConfig } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local.");
}

// Only errors raised before the query reaches Neon are safe to retry;
// anything later might have already written.
const CONNECT_ERRORS = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
]);

function isConnectError(error: unknown) {
  const cause = (error as { cause?: { code?: string } })?.cause;
  return error instanceof TypeError && CONNECT_ERRORS.has(cause?.code ?? "");
}

neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (attempt >= 2 || !isConnectError(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }
};

export const sql = neon(process.env.DATABASE_URL);

export function newId(prefix: string, bytes = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return `${prefix}${Array.from(values, (v) => chars[v % chars.length]).join("")}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
