import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublicWork } from "../content/works";
import {
  getReaderIdentity,
  readerSignInPath,
  readerSignOutPath,
} from "../reader-identity";
import {
  listPurchaseRecords,
  provisionReaderAccount,
} from "../../db/readers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "我的閱讀帳號｜允生作品",
  description: "查看允生作品的讀者帳號與購買記錄。",
};

async function ReaderAccountPanel({
  workSlug,
}: {
  workSlug?: string;
}) {
  const identity = await getReaderIdentity();
  const work = workSlug ? getPublicWork(workSlug) : undefined;
  const accountPath = work ? `/account?work=${work.slug}` : "/account";
  const publicReturnPath = work ? `/works/${work.slug}` : "/";
  if (!identity) redirect(readerSignInPath(accountPath));

  const account = await provisionReaderAccount(identity);
  const purchases = await listPurchaseRecords(account.id);

  return (
    <>
      <section className="accountIdentity" aria-labelledby="reader-account-title">
        <div>
          <p>READER ACCOUNT · 讀者帳號</p>
          <h1 id="reader-account-title">{account.displayName}</h1>
          <span>{account.normalizedEmail}</span>
        </div>
        <a href={readerSignOutPath(publicReturnPath)}>登出</a>
      </section>

      <section className="purchaseArea" aria-labelledby="purchase-records-title">
        <header>
          <p>PURCHASE RECORDS · 購買記錄</p>
          <h2 id="purchase-records-title">我的作品</h2>
        </header>
        {purchases.length ? (
          <div className="purchaseList">
            {purchases.map((purchase) => {
              const work = getPublicWork(purchase.workSlug);
              return (
                <article key={purchase.id}>
                  <h3>{work?.title ?? purchase.workSlug}</h3>
                  <span>{purchase.status}</span>
                  <time dateTime={purchase.purchasedAt}>
                    {new Intl.DateTimeFormat("zh-Hant", {
                      dateStyle: "medium",
                    }).format(new Date(purchase.purchasedAt))}
                  </time>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="emptyPurchases">
            <strong>尚無購買記錄</strong>
            <p>《燦燦烈日下》第一冊電子書即將發行，購買後會顯示在這裡。</p>
            {/* vinext dev currently duplicates React when next/link is optimized after startup. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/works/cancan-lierixia">返回作品頁</a>
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
  return (
    <main className="accountPage">
      <nav aria-label="帳號導覽">
        {/* vinext dev currently duplicates React when next/link is optimized after startup. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/">允生作品</a>
        <span>閱讀會在登入後跨裝置同步</span>
      </nav>
      <ReaderAccountPanel workSlug={work} />
    </main>
  );
}
