import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  // Always let Server Actions complete (especially login)
  const isServerAction =
    req.method === "POST" &&
    (req.headers.has("next-action") || req.headers.has("Next-Action"));

  if (isServerAction) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    // Only redirect on normal GET navigation (e.g. someone manually visits /login while logged in)
    if (isLoggedIn) {
      const role = req.auth?.user?.role;
      switch (role) {
        case "admin":
          return NextResponse.redirect(new URL("/admin", req.url));
        case "doctor":
          return NextResponse.redirect(new URL("/doctor", req.url));
        case "patient":
          return NextResponse.redirect(new URL("/patient", req.url));
        default:
          return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
