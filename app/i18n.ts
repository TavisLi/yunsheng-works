export const supportedLocales = ["zh-Hant", "zh-Hans"] as const;

export type SiteLocale = (typeof supportedLocales)[number];

export function isSiteLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function localePath(locale: SiteLocale, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function alternateLocale(locale: SiteLocale): SiteLocale {
  return locale === "zh-Hans" ? "zh-Hant" : "zh-Hans";
}

export function localeLabel(locale: SiteLocale) {
  return locale === "zh-Hans" ? "简体中文" : "繁體中文";
}

export function localized<T>(locale: SiteLocale, traditional: T, simplified: T) {
  return locale === "zh-Hans" ? simplified : traditional;
}

export function localizedMetadataAlternates(path: string) {
  return {
    canonical: localePath("zh-Hant", path),
    languages: {
      "zh-Hant": localePath("zh-Hant", path),
      "zh-Hans": localePath("zh-Hans", path),
      "x-default": localePath("zh-Hant", path),
    },
  };
}
