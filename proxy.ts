import { NextResponse, type NextRequest } from "next/server";
import { isSiteLocale, type SiteLocale } from "./app/i18n";

const LOCALE_COOKIE = "yunsheng_locale_v1";
const PUBLIC_PREFIXES = ["/account", "/read/", "/works/"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split("/")[1];

  if (isSiteLocale(firstSegment)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-yunsheng-locale", firstSegment);
    const localizedRouteExists =
      pathname === `/${firstSegment}` ||
      pathname === `/${firstSegment}/works/cancan-lierixia`;
    const target = request.nextUrl.clone();
    target.pathname = pathname.slice(firstSegment.length + 1) || "/";
    const response = localizedRouteExists
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.rewrite(target, { request: { headers: requestHeaders } });
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    return response;
  }

  if (pathname === "/" || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const locale = preferredLocale(request);
    const target = request.nextUrl.clone();
    target.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(target, 307);
  }

  return NextResponse.next();
}

function preferredLocale(request: NextRequest): SiteLocale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isSiteLocale(saved ?? "")) return saved as SiteLocale;
  return /(?:^|,)\s*zh-(?:cn|sg|hans)\b/i.test(
    request.headers.get("accept-language") ?? "",
  )
    ? "zh-Hans"
    : "zh-Hant";
}

export const config = {
  matcher: ["/((?!api/|_next/|assets/|favicon\\.svg|.*\\.[a-zA-Z0-9]+$).*)"],
};
