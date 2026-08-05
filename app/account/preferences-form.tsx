"use client";

import { useState } from "react";
import { localized, type SiteLocale } from "../i18n";

export default function PreferencesForm({
  locale,
  marketingOptIn,
}: {
  locale: SiteLocale;
  marketingOptIn: boolean;
}) {
  const [enabled, setEnabled] = useState(marketingOptIn);
  const [status, setStatus] = useState("");
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);

  async function save(next: boolean) {
    setStatus(copy("儲存中…", "保存中…"));
    const response = await fetch("/api/account/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ marketingOptIn: next }),
    });
    if (!response.ok) {
      setStatus(copy("暫時無法儲存", "暂时无法保存"));
      return;
    }
    setEnabled(next);
    setStatus(copy("已儲存", "已保存"));
  }

  return (
    <div className="accountMarketingPreference">
      <span>{enabled
        ? copy("目前接收行銷資訊", "当前接收营销资讯")
        : copy("目前不接收行銷資訊", "当前不接收营销资讯")}</span>
      <button type="button" onClick={() => void save(!enabled)}>
        {enabled ? copy("取消接收", "取消接收") : copy("開啟接收", "开启接收")}
      </button>
      <small aria-live="polite">{status}</small>
    </div>
  );
}
