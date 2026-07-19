"use client";

import { useEffect, useState } from "react";
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
  workTitle,
  chapterSlug,
  chapterTitle,
  readingKind,
  paragraphs,
  previousChapter,
  nextChapter,
}: ReaderShellProps) {
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
                `/read/${workSlug}/${merged.chapterSlug}`,
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
  }, [chapterSlug, ready, storageKey, workSlug]);

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
    checking: "確認同步狀態",
    local: "登入後跨裝置同步",
    synced: "閱讀進度已同步",
    pending: "尚未同步，將自動重試",
  }[syncStatus];

  return (
    <main className={`readerPage font-${fontSize}`} data-theme={theme}>
      <header className="readerTopbar">
        <a href={`/works/${workSlug}`} aria-label={`返回《${workTitle}》作品頁`}>
          <span aria-hidden="true">←</span> {workTitle}
        </a>
        <div>
          <span>允生作品 · 網頁閱讀器</span>
          <a
            className={`readerSync is-${syncStatus}`}
            href={`/account?work=${encodeURIComponent(workSlug)}`}
          >
            {syncLabel}
          </a>
        </div>
      </header>

      <aside className="readerControls" aria-label="閱讀設定">
        <div className="fontControls" role="group" aria-label="字體大小">
          {fontSizes.map(({ value, label }) => (
            <button
              type="button"
              aria-pressed={fontSize === value}
              key={value}
              onClick={() => setFontSize(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="themeControl"
          type="button"
          aria-pressed={theme === "night"}
          onClick={() => setTheme(theme === "day" ? "night" : "day")}
        >
          {theme === "day" ? "夜間模式" : "日間模式"}
        </button>
      </aside>

      <article className="readerArticle">
        <header>
          <p>
            {readingKind === "introduction"
              ? "PUBLIC INTRODUCTION · 公開前導"
              : "FREE PREVIEW · 免費試讀"}
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
            {readingKind === "introduction" ? "公開前導到這裡" : "試讀內容到這裡"}
          </span>
          <h2>正式章節正在逐章校對。</h2>
          <p>
            {readingKind === "introduction"
              ? "本頁只包含已公開的作品前導；完整手稿與未公開章節不會傳送到瀏覽器。"
              : "本頁只包含作者核准公開的免費試讀章節；完整手稿與未公開章節不會傳送到瀏覽器。"}
          </p>
          <a href={`/works/${workSlug}#catalog`}>返回章節目錄</a>
        </footer>
        <nav className="readerChapterNav" aria-label="試讀章節導覽">
          {previousChapter ? (
            <a href={`/read/${workSlug}/${previousChapter.slug}`}>
              <span>← 上一章</span>
              <strong>{previousChapter.title}</strong>
            </a>
          ) : <span />}
          {nextChapter ? (
            <a href={`/read/${workSlug}/${nextChapter.slug}`}>
              <span>下一章 →</span>
              <strong>{nextChapter.title}</strong>
            </a>
          ) : <span />}
        </nav>
      </article>

      <div className="readerProgress">
        <span>閱讀進度</span>
        <progress max="100" value={progress} aria-label="閱讀進度" />
        <strong>{progress}%</strong>
      </div>
    </main>
  );
}
