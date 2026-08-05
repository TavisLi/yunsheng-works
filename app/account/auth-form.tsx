"use client";

import { useState } from "react";
import { localePath, localized } from "../i18n";

export default function AuthForm({
  mode,
  method,
  region,
  locale,
  returnTo,
  linking = false,
}: {
  mode: "register" | "login";
  method: "email" | "phone";
  region: "cn" | "global";
  locale: "zh-Hant" | "zh-Hans";
  returnTo: string;
  linking?: boolean;
}) {
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        method,
        identifier: method === "phone"
          ? `${form.get("countryCode")}${String(form.get("phoneLocal") ?? "").replace(/\D/g, "")}`
          : form.get("identifier"),
        password: form.get("password"),
        locale,
        ...(mode === "register"
          ? {
              displayName: form.get("displayName"),
              region,
              locale,
              marketingOptOut: form.get("marketingOptOut") === "on",
            }
          : {}),
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? copy("暫時無法完成，請稍後再試", "暂时无法完成，请稍后再试"));
      setPending(false);
      return;
    }
    window.location.assign(returnTo);
  }

  return (
    <form className="authForm" onSubmit={submit}>
      {mode === "register" ? (
        <label>
          {copy("顯示名稱", "显示名称")}
          <input name="displayName" maxLength={80} autoComplete="name" required />
        </label>
      ) : null}
      {method === "email" ? (
        <label>
          Email
          <input name="identifier" type="email" autoComplete="email" required />
        </label>
      ) : (
        <fieldset className="phoneField">
          <legend>{copy("手機號", "手机号")}</legend>
          <select name="countryCode" aria-label={copy("國家或地區碼", "国家或地区码")} defaultValue={region === "cn" ? "+86" : "+886"}>
            <option value="+86">+86 {copy("中國大陸", "中国大陆")}</option>
            <option value="+886">+886 {copy("台灣", "中国台湾")}</option>
            <option value="+852">+852 {copy("香港", "中国香港")}</option>
            <option value="+853">+853 {copy("澳門", "中国澳门")}</option>
            <option value="+1">+1 US / Canada</option>
          </select>
          <input name="phoneLocal" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="13812345678" required />
        </fieldset>
      )}
      <label>
        {linking ? copy("目前密碼或新密碼", "当前密码或新密码") : copy("密碼", "密码")}
        <input name="password" type="password" minLength={12} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} required />
        <small>{linking
          ? copy("帳號已有密碼時請輸入目前密碼；尚未設定時，這會成為新密碼。", "账号已有密码时请输入当前密码；尚未设置时，这会成为新密码。")
          : copy("12 至 128 個字元，可使用密碼管理器。", "12 至 128 个字符，可使用密码管理器。")}</small>
      </label>
      {mode === "register" && !linking ? (
        <label className="marketingOptOut">
          <input name="marketingOptOut" type="checkbox" />
          {copy(
            "不使用我的 Email／手機號接收「允生作品」及相關周邊商品資訊",
            "不使用我的 Email／手机号接收“允生作品”及相关周边商品资讯",
          )}
        </label>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={pending} type="submit">
        {pending
          ? copy("處理中…", "处理中…")
          : mode === "register"
            ? linking ? copy("連結登入方式", "关联登录方式") : copy("建立讀者帳號", "建立读者账号")
            : copy("登入", "登录")}
      </button>
      {mode === "login" ? (
        <a href={localePath(locale, "/account/password-help")}>
          {copy("修改或忘記密碼", "修改或忘记密码")}
        </a>
      ) : null}
    </form>
  );
}
