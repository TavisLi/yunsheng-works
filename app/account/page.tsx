import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { localePath, localized, localizedMetadataAlternates, type SiteLocale } from "../i18n";
import LanguageSwitcher from "../language-switcher";
import { getRequestLocale } from "../request-locale";
import { getPublicWork } from "../content/works";
import PreferencesForm from "./preferences-form";
import {
  getReaderIdentity,
  readerSignInPath,
  readerSignOutPath,
} from "../reader-identity";
import {
  getReaderAccountIdentifiers,
  listPurchaseRecords,
  provisionReaderAccount,
} from "../../db/readers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: localized(locale, "我的閱讀帳號｜允生作品", "我的阅读账号｜允生作品"),
    description: localized(locale, "查看允生作品的讀者帳號與購買記錄。", "查看允生作品的读者账号与购买记录。"),
    alternates: localizedMetadataAlternates("/account"),
  };
}

async function ReaderAccountPanel({
  workSlug,
  locale,
}: {
  workSlug?: string;
  locale: SiteLocale;
}) {
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const identity = await getReaderIdentity();
  const work = workSlug ? getPublicWork(workSlug, locale) : undefined;
  const accountPath = work ? `${localePath(locale, "/account")}?work=${work.slug}` : localePath(locale, "/account");
  const publicReturnPath = work ? localePath(locale, `/works/${work.slug}`) : localePath(locale);
  if (!identity) redirect(readerSignInPath(accountPath));

  const account = await provisionReaderAccount(identity);
  const [purchases, identifiers] = await Promise.all([
    listPurchaseRecords(account.id),
    getReaderAccountIdentifiers(account.id),
  ]);
  const primaryIdentifier = identifiers[0]
    ? maskIdentifier(identifiers[0].kind, identifiers[0].identifier)
    : copy("讀者帳號", "读者账号");

  return (
    <>
      <section className="accountIdentity" aria-labelledby="reader-account-title">
        <div>
          <p>READER ACCOUNT · {copy("讀者帳號", "读者账号")}</p>
          <h1 id="reader-account-title">{account.displayName}</h1>
          <span>{primaryIdentifier}</span>
        </div>
        {identity.readerAccountId ? (
          <form action={`/api/auth/logout?return_to=${encodeURIComponent(publicReturnPath)}`} method="post">
            <button type="submit">{copy("登出", "退出登录")}</button>
          </form>
        ) : (
          <a href={readerSignOutPath(publicReturnPath)}>{copy("登出", "退出登录")}</a>
        )}
      </section>

      <section className="accountPreferences" aria-labelledby="account-preferences-title">
        <p>ACCOUNT PREFERENCES · {copy("帳號偏好", "账号偏好")}</p>
        <h2 id="account-preferences-title">{copy("聯絡與語言", "联系与语言")}</h2>
        <dl>
          <div><dt>{copy("預設語言", "默认语言")}</dt><dd>{account.preferredLocale === "zh-Hans" ? "简体中文" : "繁體中文"}</dd></div>
        </dl>
        <PreferencesForm locale={locale} marketingOptIn={account.marketingOptIn} />
        <div className="authMethods">
          <strong>{copy("登入方式", "登录方式")}</strong>
          <p>{identifiers.map(({ kind, identifier }) => maskIdentifier(kind, identifier)).join(" · ")}</p>
          {!identifiers.some(({ kind }) => kind === "email") ? (
            <a href={`${localePath(locale, "/account/register")}?method=email&region=${account.region}&link=1&return_to=${encodeURIComponent(accountPath)}`}>
              {copy("新增 Email 登入", "新增 Email 登录")}
            </a>
          ) : null}
          {!identifiers.some(({ kind }) => kind === "phone") ? (
            <a href={`${localePath(locale, "/account/register")}?method=phone&region=${account.region}&link=1&return_to=${encodeURIComponent(accountPath)}`}>
              {copy("新增手機號登入", "新增手机号登录")}
            </a>
          ) : null}
        </div>
      </section>

      <section className="purchaseArea" aria-labelledby="purchase-records-title">
        <header>
          <p>PURCHASE RECORDS · {copy("購買記錄", "购买记录")}</p>
          <h2 id="purchase-records-title">{copy("我的作品", "我的作品")}</h2>
        </header>
        {purchases.length ? (
          <div className="purchaseList">
            {purchases.map((purchase) => {
              const work = getPublicWork(purchase.workSlug, locale);
              return (
                <article key={purchase.id}>
                  <h3>{work?.title ?? purchase.workSlug}</h3>
                  <span>{purchase.status}</span>
                  <time dateTime={purchase.purchasedAt}>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                    }).format(new Date(purchase.purchasedAt))}
                  </time>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="emptyPurchases">
            <strong>{copy("尚無購買記錄", "尚无购买记录")}</strong>
            <p>{copy("《燦燦烈日下》第一冊電子書即將發行，購買後會顯示在這裡。", "《燦燦烈日下》第一册电子书即将发行，购买后会显示在这里。")}</p>
            <a href={localePath(locale, "/works/cancan-lierixia")}>{copy("返回作品頁", "返回作品页")}</a>
          </div>
        )}
      </section>
    </>
  );
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const { work } = await searchParams;
  const locale = await getRequestLocale();
  return (
    <main className="accountPage">
      <nav aria-label="帳號導覽">
        <a href={localePath(locale)}>允生作品</a>
        <span>{localized(locale, "閱讀會在登入後跨裝置同步", "阅读会在登录后跨设备同步")}</span>
        <LanguageSwitcher locale={locale} path={work ? `/account?work=${work}` : "/account"} />
      </nav>
      <ReaderAccountPanel workSlug={work} locale={locale} />
    </main>
  );
}

function maskIdentifier(kind: "chatgpt" | "email" | "phone", identifier: string) {
  if (kind === "phone") return `${identifier.slice(0, 3)}••••${identifier.slice(-3)}`;
  const visibleIdentifier = kind === "chatgpt" ? identifier.replace(/^chatgpt:/, "") : identifier;
  const [local, domain] = visibleIdentifier.split("@");
  if (!domain) return "••••";
  return `${local.slice(0, 2)}•••@${domain}`;
}
