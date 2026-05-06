import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isProtected =
    path.startsWith("/chat") ||
    path.startsWith("/community") ||
    path.startsWith("/doctors") ||
    path.startsWith("/bookings") ||
    path.startsWith("/pricing") ||
    path.startsWith("/success") ||
    path.startsWith("/cancel");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  if (path === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/",
    "/chat/:path*",
    "/community/:path*",
    "/doctors/:path*",
    "/bookings/:path*",
    "/pricing/:path*",
    "/success/:path*",
    "/cancel/:path*",
  ],
};
