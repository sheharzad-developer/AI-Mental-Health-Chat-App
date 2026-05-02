import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnChat = req.nextUrl.pathname.startsWith("/chat");

  if (isOnChat && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  if (req.nextUrl.pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }
});

export const config = {
  matcher: ["/", "/chat/:path*"],
};
