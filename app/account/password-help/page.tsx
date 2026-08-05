import type { Metadata } from "next";
import { localePath, localized, localizedMetadataAlternates } from "../../i18n";
import LanguageSwitcher from "../../language-switcher";
import { getRequestLocale } from "../../request-locale";

const supportEmail = process.env.READER_SUPPORT_EMAIL ?? "txli@icloud.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: localized(locale, "密碼協助｜允生作品", "密码协助｜允生作品"),
    alternates: localizedMetadataAlternates("/account/password-help"),
  };
}

export default async function PasswordHelpPage() {
  const locale = await getRequestLocale();
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  return (
    <main className="accountPage authPage">
      <nav aria-label="帳號導覽">
        <a href={localePath(locale)}>允生作品</a><a href={localePath(locale, "/account/sign-in")}>{copy("返回登入", "返回登录")}</a>
        <LanguageSwitcher locale={locale} path="/account/password-help" />
      </nav>
      <section className="accountIdentity authPanel" aria-labelledby="password-help-title">
        <div><p>ACCOUNT SUPPORT · {copy("帳號客服", "账号客服")}</p><h1 id="password-help-title">{copy("修改或忘記密碼", "修改或忘记密码")}</h1></div>
        <p>{copy("本階段由人工客服核對帳號後協助處理。請勿在信件中直接提供目前密碼或新密碼。", "本阶段由人工客服核对账号后协助处理。请勿在邮件中直接提供当前密码或新密码。")}</p>
        <a href={`mailto:${supportEmail}?subject=${encodeURIComponent(copy("允生作品｜密碼協助", "允生作品｜密码协助"))}`}>{copy("聯繫客服", "联系客服")}：{supportEmail}</a>
      </section>
    </main>
  );
}
