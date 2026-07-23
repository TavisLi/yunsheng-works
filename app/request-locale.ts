import { headers } from "next/headers";
import { isSiteLocale, type SiteLocale } from "./i18n";

export async function getRequestLocale(): Promise<SiteLocale> {
  const locale = (await headers()).get("x-yunsheng-locale") ?? "zh-Hant";
  return isSiteLocale(locale) ? locale : "zh-Hant";
}
