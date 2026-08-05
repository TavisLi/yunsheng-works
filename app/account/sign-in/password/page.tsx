import type { Metadata } from "next";
import AuthForm from "../../auth-form";
import { safeRelativeReturnPath } from "../../../chatgpt-auth";
import { localePath, localized, localizedMetadataAlternates } from "../../../i18n";
import LanguageSwitcher from "../../../language-switcher";
import { getRequestLocale } from "../../../request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: localized(locale, "密碼登入｜允生作品", "密码登录｜允生作品"),
    alternates: localizedMetadataAlternates("/account/sign-in/password"),
  };
}

export default async function PasswordSignInPage({ searchParams }: {
  searchParams: Promise<{ region?: string; method?: string; locale?: string; return_to?: string }>;
}) {
  const params = await searchParams;
  const region = params.region === "cn" ? "cn" : "global";
  const method = params.method === "phone" ? "phone" : "email";
  const requestLocale = await getRequestLocale();
  const locale = params.locale === "zh-Hans" || params.locale === "zh-Hant" ? params.locale : requestLocale;
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const returnTo = params.return_to
    ? safeRelativeReturnPath(params.return_to)
    : localePath(locale, "/account");

  return (
    <main className="accountPage authPage">
      <nav aria-label="帳號導覽">
        <a href={localePath(locale)}>允生作品</a><a href={`${localePath(locale, "/account/sign-in")}?region=${region}`}>{copy("其他登入方式", "其他登录方式")}</a>
        <LanguageSwitcher locale={locale} path={`/account/sign-in/password?region=${region}&method=${method}&return_to=${encodeURIComponent(returnTo)}`} />
      </nav>
      <section className="accountIdentity authPanel" aria-labelledby="password-login-title">
        <div><p>PASSWORD SIGN IN · {copy("密碼登入", "密码登录")}</p><h1 id="password-login-title">{method === "email" ? `Email ${copy("登入", "登录")}` : copy("手機號登入", "手机号登录")}</h1></div>
        <AuthForm mode="login" method={method} region={region} locale={locale} returnTo={returnTo} />
      </section>
    </main>
  );
}
