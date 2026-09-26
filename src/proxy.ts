import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "mainhall_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (request.cookies.has(SESSION_COOKIE)) {
    const headers = new Headers(request.headers);
    headers.set("x-mainhall-path", pathname + search);
    return NextResponse.next({ request: { headers } });
  }

  const area = pathname.startsWith("/admin") ? "admin" : "partners";
  const login = `/${area}/login`;
  if (pathname === login) return NextResponse.next();

  const url = new URL(login, request.url);
  if (area === "partners" && pathname !== "/partners") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/partners/:path*"],
};
