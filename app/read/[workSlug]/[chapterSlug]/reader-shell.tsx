"use client";

import { useEffect, useState } from "react";
import { localePath, localized, type SiteLocale } from "../../../i18n";
import LanguageSwitcher from "../../../language-switcher";
import {
  isStoredReaderState,
  mergeStoredReaderStates,
  parseStoredReaderState,
  serializeReaderState,
  type FontSize,
  type ReaderTheme,
} from "../../reader-state";

type ReaderShellProps = {
  workSlug: string;
  locale: SiteLocale;
  workTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  readingKind: "introduction" | "chapter";
  paragraphs: ReadonlyArray<{ id: string; text: string }>;
  previousChapter?: { slug: string; title: string };
  nextChapter?: { slug: string; title: string };
};

const fontSizes: ReadonlyArray<{ value: FontSize; label: string }> = [
  { value: "small", label: "小" },
  { value: "standard", label: "標準" },
  { value: "large", label: "大" },
];

export default function ReaderShell({
  workSlug,
  locale,
  workTitle,
  chapterSlug,
  chapterTitle,
  readingKind,
  paragraphs,
  previousChapter,
  nextChapter,
}: ReaderShellProps) {
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const storageKey = `yunsheng-reader:${workSlug}`;
  const [fontSize, setFontSize] = useState<FontSize>("standard");
  const [theme, setTheme] = useState<ReaderTheme>("day");
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [syncSettled, setSyncSettled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "checking" | "local" | "synced" | "pending"
  >("checking");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        const parsed = parseStoredReaderState(stored);

        if (parsed) {
          setFontSize(parsed.fontSize);
          setTheme(parsed.theme);
          const isCurrentChapter = parsed.chapterSlug === chapterSlug;
          setProgress(
            isCurrentChapter
              ? Math.min(100, Math.max(0, Math.round(parsed.progress)))
              : 0,
          );

          if (isCurrentChapter) window.requestAnimationFrame(() => {
            const anchor = parsed.anchor && document.getElementById(parsed.anchor);
            if (anchor) {
              anchor.scrollIntoView({ block: "start" });
            } else if (parsed.progress > 0) {
              const available = document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo({ top: available * (parsed.progress / 100) });
            }
          });
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      } finally {
        setReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [chapterSlug, storageKey]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const applyState = (state: ReturnType<typeof parseStoredReaderState>) => {
      if (!state) return;
      setFontSize(state.fontSize);
      setTheme(state.theme);
      if (state.chapterSlug !== chapterSlug) return;
      setProgress(Math.min(100, Math.max(0, Math.round(state.progress))));
      window.requestAnimationFrame(() => {
        const anchor = state.anchor && document.getElementById(state.anchor);
        if (anchor) {
          anchor.scrollIntoView({ block: "start" });
        } else if (state.progress > 0) {
          const available = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: available * (state.progress / 100) });
        }
      });
    };
    const synchronize = async () => {
      const localState = parseStoredReaderState(
        window.localStorage.getItem(storageKey),
      );
      try {
        const response = await fetch(
          `/api/reader-state?work=${encodeURIComponent(workSlug)}`,
        );
        if (response.status === 401) {
          if (!cancelled) {
            setSignedIn(false);
            setSyncStatus("local");
          }
          return;
        }
        if (!response.ok) throw new Error("reader-state unavailable");

        const payload = (await response.json()) as { state?: unknown };
        const cloudState = isStoredReaderState(payload.state)
          ? payload.state
          : null;
        const merged = mergeStoredReaderStates(localState, cloudState);
        if (cancelled) return;

        setSignedIn(true);
        if (merged) {
          window.localStorage.setItem(storageKey, JSON.stringify(merged));
          if (merged === cloudState) {
            applyState(merged);
            if (merged.chapterSlug !== chapterSlug) {
              window.location.replace(
                localePath(locale, `/read/${workSlug}/${merged.chapterSlug}`),
              );
              return;
            }
          } else {
            const saved = await fetch("/api/reader-state", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ workSlug, state: merged }),
            });
            if (!saved.ok) throw new Error("reader-state sync failed");
          }
        }
        setSyncStatus("synced");
      } catch {
        if (!cancelled) setSyncStatus("pending");
      } finally {
        if (!cancelled) setSyncSettled(true);
      }
    };

    void synchronize();
    return () => {
      cancelled = true;
    };
  }, [chapterSlug, locale, ready, storageKey, workSlug]);

  useEffect(() => {
    if (!ready || !syncSettled) return;

    let frame = 0;
    let syncTimer = 0;
    const saveProgress = () => {
      frame = 0;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = available > 0 ? (window.scrollY / available) * 100 : 100;
      const visibleParagraph = paragraphs
        .map(({ id }) => document.getElementById(id))
        .filter((element): element is HTMLElement => Boolean(element))
        .findLast((element) => element.getBoundingClientRect().top <= window.innerHeight * 0.45);
      const roundedProgress = Math.min(100, Math.max(0, Math.round(nextProgress)));

      setProgress(roundedProgress);
      const serialized = serializeReaderState({
        chapterSlug,
        fontSize,
        theme,
        anchor: visibleParagraph?.id,
        progress: roundedProgress,
      });
      window.localStorage.setItem(storageKey, serialized);

      if (signedIn) {
        window.clearTimeout(syncTimer);
        syncTimer = window.setTimeout(async () => {
          try {
            const response = await fetch("/api/reader-state", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                workSlug,
                state: JSON.parse(serialized),
              }),
            });
            if (!response.ok) throw new Error("reader-state sync failed");
            setSyncStatus("synced");
          } catch {
            setSyncStatus("pending");
          }
        }, 800);
      } else {
        setSyncStatus("local");
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(saveProgress);
    };

    saveProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(syncTimer);
    };
  }, [
    chapterSlug,
    fontSize,
    paragraphs,
    ready,
    signedIn,
    storageKey,
    syncSettled,
    theme,
    workSlug,
  ]);

  const syncLabel = {
    checking: copy("確認同步狀態", "确认同步状态"),
    local: copy("登入後跨裝置同步", "登录后跨设备同步"),
    synced: copy("閱讀進度已同步", "阅读进度已同步"),
    pending: copy("尚未同步，將自動重試", "尚未同步，将自动重试"),
  }[syncStatus];

  return (
    <main className={`readerPage font-${fontSize}`} data-theme={theme}>
      <header className="readerTopbar">
        <a href={localePath(locale, `/works/${workSlug}`)} aria-label={copy(`返回《${workTitle}》作品頁`, `返回《${workTitle}》作品页`)}>
          <span aria-hidden="true">←</span> {workTitle}
        </a>
        <div>
          <span>允生作品 · {copy("網頁閱讀器", "网页阅读器")}</span>
          <a
            className={`readerSync is-${syncStatus}`}
            href={`${localePath(locale, "/account")}?work=${encodeURIComponent(workSlug)}`}
          >
            {syncLabel}
          </a>
          <LanguageSwitcher locale={locale} path={`/read/${workSlug}/${chapterSlug}`} />
        </div>
      </header>

      <aside className="readerControls" aria-label={copy("閱讀設定", "阅读设置")}>
        <div className="fontControls" role="group" aria-label={copy("字體大小", "字体大小")}>
          {fontSizes.map(({ value, label }) => (
            <button
              type="button"
              aria-pressed={fontSize === value}
              key={value}
              onClick={() => setFontSize(value)}
            >
              {value === "standard" ? copy(label, "标准") : label}
            </button>
          ))}
        </div>
        <button
          className="themeControl"
          type="button"
          aria-pressed={theme === "night"}
          onClick={() => setTheme(theme === "day" ? "night" : "day")}
        >
          {theme === "day" ? copy("夜間模式", "夜间模式") : copy("日間模式", "日间模式")}
        </button>
      </aside>

      <article className="readerArticle">
        <header>
          <p>
            {readingKind === "introduction"
              ? `PUBLIC INTRODUCTION · ${copy("公開前導", "公开前导")}`
              : `FREE PREVIEW · ${copy("免費試讀", "免费试读")}`}
          </p>
          <h1>{chapterTitle}</h1>
          <span>{workTitle}</span>
        </header>
        <div className="readerProse">
          {paragraphs.map((paragraph) => (
            <p id={paragraph.id} key={paragraph.id}>{paragraph.text}</p>
          ))}
        </div>
        <footer className="previewEnd">
          <span>
            {readingKind === "introduction" ? copy("公開前導到這裡", "公开前导到这里") : copy("試讀內容到這裡", "试读内容到这里")}
          </span>
          <h2>{copy("正式章節正在逐章校對。", "正式章节正在逐章校对。")}</h2>
          <p>
            {readingKind === "introduction"
              ? copy("本頁只包含已公開的作品前導；完整手稿與未公開章節不會傳送到瀏覽器。", "本页只包含已公开的作品前导；完整手稿与未公开章节不会传送到浏览器。")
              : copy("本頁只包含作者核准公開的免費試讀章節；完整手稿與未公開章節不會傳送到瀏覽器。", "本页只包含作者核准公开的免费试读章节；完整手稿与未公开章节不会传送到浏览器。")}
          </p>
          <a href={`${localePath(locale, `/works/${workSlug}`)}#catalog`}>{copy("返回章節目錄", "返回章节目录")}</a>
        </footer>
        <nav className="readerChapterNav" aria-label="試讀章節導覽">
          {previousChapter ? (
            <a href={localePath(locale, `/read/${workSlug}/${previousChapter.slug}`)}>
              <span>← {copy("上一章", "上一章")}</span>
              <strong>{previousChapter.title}</strong>
            </a>
          ) : <span />}
          {nextChapter ? (
            <a href={localePath(locale, `/read/${workSlug}/${nextChapter.slug}`)}>
              <span>{copy("下一章", "下一章")} →</span>
              <strong>{nextChapter.title}</strong>
            </a>
          ) : <span />}
        </nav>
      </article>

      <div className="readerProgress">
        <span>{copy("閱讀進度", "阅读进度")}</span>
        <progress max="100" value={progress} aria-label={copy("閱讀進度", "阅读进度")} />
        <strong>{progress}%</strong>
      </div>
    </main>
  );
}
