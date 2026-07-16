import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(html, /故事從這裡出生/);
  assert.match(html, /《燦燦烈日下》是允生的第一部作品/);
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
  assert.match(html, /scene-01-dorm-after-lights\.jpg/);
  assert.match(html, /scene-02-farewell-song\.jpg/);
  assert.match(html, /scene-03-time-capsule-reunion\.jpg/);
  assert.match(html, /href="\/"[^>]*>允生作品<\/a>/);
  assert.match(html, /id="catalog"/);
  assert.match(html, /作品前導/);
  assert.match(html, /href="\/read\/cancan-lierixia\/prologue"/);
  assert.match(html, /正式試讀整理中/);
});

test("server-renders the public prologue in the web reader", async () => {
  const response = await render("/read/cancan-lierixia/prologue");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>作品前導｜燦燦烈日下<\/title>/i);
  assert.match(html, /何念恩和許承恩從彼此的少年時代穿過/);
  assert.match(html, /aria-label="閱讀設定"/);
  assert.match(html, />小<\/button>/);
  assert.match(html, />標準<\/button>/);
  assert.match(html, />大<\/button>/);
  assert.match(html, /夜間模式/);
  assert.match(html, /閱讀進度/);
  assert.match(html, /href="\/works\/cancan-lierixia"/);
});

test("does not send chapter text for a chapter that is not open", async () => {
  const response = await render("/read/cancan-lierixia/chapter-01");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /正式試讀整理中/);
  assert.match(html, /尚未向瀏覽器提供這一章的正文/);
  assert.doesNotMatch(html, /何念恩和許承恩從彼此的少年時代穿過/);
  assert.doesNotMatch(html, /readerProse/);
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
