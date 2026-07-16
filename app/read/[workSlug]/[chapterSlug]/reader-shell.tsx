"use client";

import { useEffect, useState } from "react";

type FontSize = "small" | "standard" | "large";
type ReaderTheme = "day" | "night";

type ReaderShellProps = {
  workSlug: string;
  workTitle: string;
  chapterTitle: string;
  paragraphs: ReadonlyArray<{ id: string; text: string }>;
};

type StoredReaderState = {
  version: 1;
  fontSize: FontSize;
  theme: ReaderTheme;
  anchor?: string;
  progress: number;
};

const fontSizes: ReadonlyArray<{ value: FontSize; label: string }> = [
  { value: "small", label: "小" },
  { value: "standard", label: "標準" },
  { value: "large", label: "大" },
];

function isStoredReaderState(value: unknown): value is StoredReaderState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StoredReaderState>;
  return (
    state.version === 1 &&
    fontSizes.some(({ value: fontSize }) => fontSize === state.fontSize) &&
    (state.theme === "day" || state.theme === "night") &&
    typeof state.progress === "number"
  );
}

export default function ReaderShell({
  workSlug,
  workTitle,
  chapterTitle,
  paragraphs,
}: ReaderShellProps) {
  const storageKey = `yunsheng-reader:${workSlug}`;
  const [fontSize, setFontSize] = useState<FontSize>("standard");
  const [theme, setTheme] = useState<ReaderTheme>("day");
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        const parsed: unknown = stored ? JSON.parse(stored) : null;

        if (isStoredReaderState(parsed)) {
          setFontSize(parsed.fontSize);
          setTheme(parsed.theme);
          setProgress(Math.min(100, Math.max(0, Math.round(parsed.progress))));

          window.requestAnimationFrame(() => {
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
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;

    let frame = 0;
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
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          fontSize,
          theme,
          anchor: visibleParagraph?.id,
          progress: roundedProgress,
        } satisfies StoredReaderState),
      );
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(saveProgress);
    };

    saveProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [fontSize, paragraphs, ready, storageKey, theme]);

  return (
    <main className={`readerPage font-${fontSize}`} data-theme={theme}>
      <header className="readerTopbar">
        <a href={`/works/${workSlug}`} aria-label={`返回《${workTitle}》作品頁`}>
          <span aria-hidden="true">←</span> {workTitle}
        </a>
        <span>允生作品 · 網頁閱讀器</span>
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
          <p>FREE PREVIEW · 免費試讀</p>
          <h1>{chapterTitle}</h1>
          <span>{workTitle}</span>
        </header>
        <div className="readerProse">
          {paragraphs.map((paragraph) => (
            <p id={paragraph.id} key={paragraph.id}>{paragraph.text}</p>
          ))}
        </div>
        <footer className="previewEnd">
          <span>試讀內容到這裡</span>
          <h2>正式章節正在逐章校對。</h2>
          <p>本頁只包含已公開的作品前導；完整手稿與未公開章節不會傳送到瀏覽器。</p>
          <a href={`/works/${workSlug}#catalog`}>返回章節目錄</a>
        </footer>
      </article>

      <div className="readerProgress">
        <span>閱讀進度</span>
        <progress max="100" value={progress} aria-label="閱讀進度" />
        <strong>{progress}%</strong>
      </div>
    </main>
  );
}
