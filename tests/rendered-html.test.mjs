import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { getPublicWork, isWithinPreviewLimit } from "../app/content/works.ts";
import {
  parseStoredReaderState,
  serializeReaderState,
} from "../app/read/reader-state.ts";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Yunsheng Works brand home with its first work", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-Hant">/i);
  assert.match(html, /<title>允生作品｜原創小說與網頁閱讀<\/title>/i);
  assert.match(html, /<link rel="icon" href="\/favicon\.svg"/i);
  assert.match(html, /允生作品/);
  assert.match(html, /yunsheng-home-sunset-illustration\.webp/);
  assert.match(html, /故事從這裡出生/);
  assert.match(
    html,
    /《(?:<!-- -->)?燦燦烈日下(?:<!-- -->)?》是允生的第一部作品/,
  );
  assert.match(html, /href="\/works\/cancan-lierixia"/);
  assert.match(html, /casting-concept-ensemble\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server-renders the dedicated Cancan Lierixia work page", async () => {
  const response = await render("/works/cancan-lierixia");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>燦燦烈日下｜允生作品<\/title>/i);
  assert.match(html, /有些人陪你長大/);
  assert.match(html, /id="story"/);
  assert.match(html, /id="characters"/);
  assert.match(html, /id="casting"/);
  assert.match(html, /scene-detail-01-dorm-after-lights-v3\.webp/);
  assert.match(html, /scene-detail-02-farewell-song-v2\.webp/);
  assert.match(html, /scene-detail-03-time-capsule-reunion-v2\.webp/);
  assert.match(html, /casting-concept-ensemble-v2\.webp/);
  assert.match(html, /href="\/works\/cancan-lierixia\/scenes\/dorm-after-lights"/);
  assert.match(html, /href="\/works\/cancan-lierixia\/scenes\/farewell-song"/);
  assert.match(html, /href="\/works\/cancan-lierixia\/scenes\/time-capsule-reunion"/);
  assert.match(html, /href="\/"[^>]*>允生作品<\/a>/);
  assert.match(html, /id="catalog"/);
  assert.match(html, /作品前導/);
  assert.match(html, /href="\/read\/cancan-lierixia\/prologue"/);
  assert.match(html, /第一章｜致一如初見的你們/);
  assert.match(html, /href="\/read\/cancan-lierixia\/chapter-01"/);
  assert.match(html, /免費試讀/);
  assert.match(html, /目前開放作品前導與第一章免費試讀/);
  assert.match(html, /小說第一冊電子書即將發行，敬請期待/);
  assert.doesNotMatch(html, /完整手稿不會放入網站或公開下載/);
});

test("server-renders all three illustrated scene excerpts", async () => {
  const cases = [
    {
      path: "/works/cancan-lierixia/scenes/dorm-after-lights",
      title: "宿舍熄燈之後",
      image: "scene-detail-01-dorm-after-lights-v3.webp",
      source: "第一章節選 · 完稿內容",
      excerpt: "宿舍樓裡早早陷入一片黑暗",
    },
    {
      path: "/works/cancan-lierixia/scenes/farewell-song",
      title: "隔樓唱起《送別》",
      image: "scene-detail-02-farewell-song-v2.webp",
      source: "後續創作場景節選 · 草稿內容",
      excerpt: "她就是突然想喊他的名字",
    },
    {
      path: "/works/cancan-lierixia/scenes/time-capsule-reunion",
      title: "十年後，打開時間膠囊",
      image: "scene-detail-03-time-capsule-reunion-v2.webp",
      source: "後續創作場景節選 · 草稿內容",
      excerpt: "何念恩到的時候，時間膠囊已經都被挖出來了",
    },
  ];

  for (const scene of cases) {
    const response = await render(scene.path);
    assert.equal(response.status, 200);

    const html = await response.text();
    assert.ok(html.includes(scene.title));
    assert.ok(html.includes(scene.image));
    assert.ok(html.includes(scene.source));
    assert.ok(html.includes(scene.excerpt));
    assert.match(html, /href="\/works\/cancan-lierixia#scenes"/);
  }
});

test("server-renders the public prologue in the web reader", async () => {
  const response = await render("/read/cancan-lierixia/prologue");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>作品前導｜燦燦烈日下<\/title>/i);
  assert.match(html, /PUBLIC INTRODUCTION · 公開前導/);
  assert.match(html, /公開前導到這裡/);
  assert.doesNotMatch(html, /FREE PREVIEW|試讀內容到這裡/);
  assert.match(html, /何念恩和許承恩從彼此的少年時代穿過/);
  assert.match(html, /aria-label="閱讀設定"/);
  assert.match(html, />小<\/button>/);
  assert.match(html, />標準<\/button>/);
  assert.match(html, />大<\/button>/);
  assert.match(html, /夜間模式/);
  assert.match(html, /閱讀進度/);
  assert.match(html, /href="\/works\/cancan-lierixia"/);
});

test("server-renders the complete approved first chapter as a free preview", async () => {
  const response = await render("/read/cancan-lierixia/chapter-01");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>第一章｜致一如初見的你們｜燦燦烈日下<\/title>/i);
  assert.match(html, /FREE PREVIEW · 免費試讀/);
  assert.match(html, /月上樹梢，校園安靜的只剩下蟬鳴聲。/);
  assert.match(html, /嗯，討厭的青梅竹馬。/);
  assert.match(html, /本頁只包含作者核准公開的免費試讀章節/);
  assert.doesNotMatch(html, /正式試讀整理中/);
});

test("does not send chapter text for a chapter that is not open", async () => {
  const response = await render("/read/cancan-lierixia/chapter-02");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /本章尚未開放/);
  assert.match(html, /尚未向瀏覽器提供這一章的正文/);
  assert.doesNotMatch(html, /SERVER_ONLY_LOCKED_CHAPTER_SENTINEL_7F3A/);
  assert.doesNotMatch(html, /readerProse/);
});

test("preview chapter limits allow only the configured first one to three chapters", () => {
  for (const limit of [1, 2, 3]) {
    for (let order = 1; order <= 4; order += 1) {
      assert.equal(isWithinPreviewLimit(limit, order), order <= limit);
    }
  }
  assert.equal(isWithinPreviewLimit(1, 0), false);
  const work = getPublicWork("cancan-lierixia");
  assert.equal(work?.introduction.contentVersion, 1);
  assert.deepEqual(
    work?.chapters.map(({ contentVersion }) => contentVersion),
    [2, 1, 1],
  );
});

test("reader state keeps the latest chapter, position, preferences and update time", () => {
  const serialized = serializeReaderState({
    chapterSlug: "prologue",
    fontSize: "large",
    theme: "night",
    anchor: "ten-years-later",
    progress: 73,
    updatedAt: "2026-07-16T10:00:00.000Z",
  });

  assert.deepEqual(parseStoredReaderState(serialized), {
    version: 1,
    chapterSlug: "prologue",
    fontSize: "large",
    theme: "night",
    anchor: "ten-years-later",
    progress: 73,
    updatedAt: "2026-07-16T10:00:00.000Z",
  });
  assert.equal(parseStoredReaderState("{not-json"), null);
});

test("starter preview is removed from the finished site", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /允生作品/);
  assert.match(layout, /lang="zh-Hant"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app\/_sites-preview", import.meta.url)));
});
