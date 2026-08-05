import type { Metadata } from "next";
import AuthForm from "../auth-form";
import { safeRelativeReturnPath } from "../../chatgpt-auth";
import { localePath, localized, localizedMetadataAlternates } from "../../i18n";
import LanguageSwitcher from "../../language-switcher";
import { getRequestLocale } from "../../request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: localized(locale, "建立讀者帳號｜允生作品", "建立读者账号｜允生作品"),
    description: localized(locale, "使用 Email 或手機號建立允生作品讀者帳號。", "使用 Email 或手机号建立允生作品读者账号。"),
    alternates: localizedMetadataAlternates("/account/register"),
  };
}

export default async function RegisterPage({ searchParams }: {
  searchParams: Promise<{ region?: string; method?: string; locale?: string; return_to?: string; link?: string }>;
}) {
  const params = await searchParams;
  const region = params.region === "cn" ? "cn" : "global";
  const method = params.method === "phone" ? "phone" : "email";
  const linking = params.link === "1";
  const requestLocale = await getRequestLocale();
  const locale = params.locale === "zh-Hans" || params.locale === "zh-Hant" ? params.locale : requestLocale;
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const returnTo = params.return_to
    ? safeRelativeReturnPath(params.return_to)
    : localePath(locale, "/account");

  return (
    <main className="accountPage authPage">
      <nav aria-label="帳號導覽">
        <a href={localePath(locale)}>允生作品</a><a href={`${localePath(locale, "/account/sign-in")}?region=${region}`}>{copy("返回登入", "返回登录")}</a>
        <LanguageSwitcher locale={locale} path={`/account/register?region=${region}&method=${method}&return_to=${encodeURIComponent(returnTo)}${linking ? "&link=1" : ""}`} />
      </nav>
      <section className="accountIdentity authPanel" aria-labelledby="register-title">
        <div><p>READER ACCOUNT · {copy("讀者帳號", "读者账号")}</p><h1 id="register-title">{linking ? copy("新增登入方式", "新增登录方式") : copy("建立讀者帳號", "建立读者账号")}</h1><span>{region === "cn" ? copy("中國大陸", "中国大陆") : copy("其他地區", "其他地区")}</span></div>
        <div className="authMethodTabs" aria-label="帳號識別方式">
          <a aria-current={method === "email" ? "page" : undefined} href={`${localePath(locale, "/account/register")}?region=${region}&method=email`}>Email</a>
          <a aria-current={method === "phone" ? "page" : undefined} href={`${localePath(locale, "/account/register")}?region=${region}&method=phone`}>{copy("手機號", "手机号")}</a>
        </div>
        <AuthForm mode="register" method={method} region={region} locale={locale} returnTo={returnTo} linking={linking} />
        {method === "phone" ? (
          <p className="authNotice">{copy(
            "本階段不發送 SMS。手機號僅作為登入識別，不代表已驗證號碼所有權，也不用於密碼恢復。",
            "本阶段不发送 SMS。手机号仅作为登录识别，不代表已验证号码所有权，也不用于密码恢复。",
          )}</p>
        ) : null}
        <p className="authNotice">{copy("建立帳號即表示你已閱讀帳號與個人資料說明。行銷資訊預設開啟，可在上方勾選取消；此偏好不影響註冊。", "建立账号即表示你已阅读账号与个人资料说明。营销资讯默认开启，可在上方勾选取消；此偏好不影响注册。")}</p>
      </section>
    </main>
  );
}
