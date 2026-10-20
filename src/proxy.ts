import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/types";

const LOCALE_COOKIE = "da_locale";

function pickLocale(req: NextRequest) {
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && (LOCALES as readonly string[]).includes(saved)) return saved;
  const languages = new Negotiator({ headers: { "accept-language": req.headers.get("accept-language") ?? "" } }).languages();
  try {
    return match(languages, LOCALES as unknown as string[], DEFAULT_LOCALE);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return;
    if (!(await verifyToken(req.cookies.get(SESSION_COOKIE)?.value))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return;
  }

  const current = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (current) {
    const res = NextResponse.next();
    if (req.cookies.get(LOCALE_COOKIE)?.value !== current) {
      res.cookies.set(LOCALE_COOKIE, current, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, metadata files and anything with a file extension.
  matcher: ["/((?!_next|api|uploads|favicon.ico|robots.txt|sitemap.xml|opengraph-image|icon|apple-icon|.*\\..*).*)"],
};
