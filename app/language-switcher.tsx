"use client";

import {
  alternateLocale,
  localeLabel,
  localePath,
  type SiteLocale,
} from "./i18n";

export default function LanguageSwitcher({
  locale,
  path,
}: {
  locale: SiteLocale;
  path: string;
}) {
  const alternate = alternateLocale(locale);
  const href = localePath(alternate, path);

  async function switchLocale(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    try {
      await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ preferredLocale: alternate }),
      });
    } finally {
      const target = new URL(href, window.location.origin);
      if (!target.hash) target.hash = window.location.hash;
      window.location.assign(`${target.pathname}${target.search}${target.hash}`);
    }
  }

  return (
    <a
      className="languageSwitcher"
      href={href}
      hrefLang={alternate}
      lang={alternate}
      onClick={switchLocale}
    >
      {localeLabel(alternate)}
    </a>
  );
}
