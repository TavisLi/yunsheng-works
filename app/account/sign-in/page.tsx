import type { Metadata } from "next";
import { chatGPTSignInPath, safeRelativeReturnPath } from "../../chatgpt-auth";
import { localePath, localized, localizedMetadataAlternates } from "../../i18n";
import LanguageSwitcher from "../../language-switcher";
import { getRequestLocale } from "../../request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: localized(locale, "登入讀者帳號｜允生作品", "登录读者账号｜允生作品"),
    description: localized(locale, "使用 Email、手機號或 ChatGPT 登入允生作品。", "使用 Email、手机号或 ChatGPT 登录允生作品。"),
    alternates: localizedMetadataAlternates("/account/sign-in"),
  };
}

type AccountRegion = "cn" | "global";

function getAccountRegion(value?: string): AccountRegion {
  return value === "cn" ? "cn" : "global";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; return_to?: string }>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const region = getAccountRegion(params.region);
  const returnTo = params.return_to
    ? safeRelativeReturnPath(params.return_to)
    : localePath(locale, "/account");

  return (
    <main className="accountPage authPage">
      <nav aria-label="登入地區">
        <a href={localePath(locale)}>允生作品</a>
        <div>
          <a aria-current={region === "cn" ? "page" : undefined} href={`${localePath(locale, "/account/sign-in")}?region=cn`}>
            {copy("中國大陸", "中国大陆")}
          </a>
          <a aria-current={region === "global" ? "page" : undefined} href={`${localePath(locale, "/account/sign-in")}?region=global`}>
            {copy("其他地區", "其他地区")}
          </a>
          <LanguageSwitcher locale={locale} path={`/account/sign-in?region=${region}&return_to=${encodeURIComponent(returnTo)}`} />
        </div>
      </nav>

      <section className="accountIdentity authPanel" aria-labelledby="sign-in-title">
        <div>
          <p>READER ACCOUNT · {copy("讀者帳號", "读者账号")}</p>
          <h1 id="sign-in-title">{copy("登入允生作品", "登录允生作品")}</h1>
          <span>{region === "cn" ? copy("中國大陸帳號入口", "中国大陆账号入口") : copy("其他地區帳號入口", "其他地区账号入口")}</span>
        </div>

        <div className="authMethods" aria-label="登入方式">
          <a href={`${localePath(locale, "/account/sign-in/password")}?method=email&region=${region}&return_to=${encodeURIComponent(returnTo)}`}>
            Email {copy("登入", "登录")}
          </a>
          <a href={`${localePath(locale, "/account/sign-in/password")}?method=phone&region=${region}&return_to=${encodeURIComponent(returnTo)}`}>
            {copy("手機號登入", "手机号登录")}
          </a>
          {region === "global" ? (
            <a href={chatGPTSignInPath(returnTo)}>{copy("使用 ChatGPT 登入", "使用 ChatGPT 登录")}</a>
          ) : null}
        </div>

        <p>
          {copy("還沒有帳號？", "还没有账号？")}{" "}
          <a href={`${localePath(locale, "/account/register")}?region=${region}&return_to=${encodeURIComponent(returnTo)}`}>
            {copy("建立讀者帳號", "建立读者账号")}
          </a>
        </p>
      </section>
    </main>
  );
}
