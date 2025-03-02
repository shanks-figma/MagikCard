import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { AllLocales, AppConfig } from "@/lib/config";

// Create next-intl middleware for localization
const intlMiddleware = createMiddleware({
  locales: AllLocales,
  defaultLocale: AppConfig.defaultLocale,
});

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Handle authentication-based redirects
  const isAuthPage =
    url.pathname.startsWith("/signin") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/verify") ||
    url.pathname === "/";

  const isProtected = url.pathname.startsWith("/dashboard");

  // Redirect authenticated users trying to access auth pages to /dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users trying to access protected pages
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Fallback to intl middleware for localization
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|monitoring).*)", // Exclude static files, _next, monitoring
    "/",
    "/(api|trpc)(.*)", // API routes
    "/dashboard/:path*",
    "/signin",
    "/signup",
  ],
};
