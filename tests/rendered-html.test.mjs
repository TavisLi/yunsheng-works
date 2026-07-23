import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { promisify } from "node:util";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createWorkRegistry,
  getPublicWork,
  isWithinPreviewLimit,
} from "../app/content/works.ts";
import {
  mergeStoredReaderStates,
  parseStoredReaderState,
  serializeReaderState,
} from "../app/read/reader-state.ts";

const execFileAsync = promisify(execFile);
process.env.AUTH_PASSWORD_PEPPER = "test-only-reader-pepper";

async function createTestDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const DB = createD1Binding(sqlite);
  const migrationDirectory = new URL("../drizzle/", import.meta.url);
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const migrationFile of migrationFiles) {
    const migration = await readFile(new URL(migrationFile, migrationDirectory), "utf8");
    for (const statement of migration
      .split("--> statement-breakpoint")
      .map((value) => value.trim())
      .filter(Boolean)) {
      sqlite.exec(statement);
    }
  }

  return { DB, dispose: () => sqlite.close() };
}

function createD1Binding(sqlite) {
  class PreparedStatement {
    constructor(sql, params = []) {
      this.sql = sql;
      this.params = params;
    }

    bind(...params) {
      return new PreparedStatement(this.sql, params);
    }

    async first(column) {
      const row = sqlite.prepare(this.sql).get(...this.params) ?? null;
      return column && row ? row[column] ?? null : row;
    }

    async all() {
      const results = sqlite.prepare(this.sql).all(...this.params);
      return { success: true, results, meta: {} };
    }

    async run() {
      const result = sqlite.prepare(this.sql).run(...this.params);
      return {
        success: true,
        results: [],
        meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) },
      };
    }

    async raw() {
      const statement = sqlite.prepare(this.sql);
      const columns = statement.columns().map(({ name }) => name);
      return statement.all(...this.params).map((row) => columns.map((name) => row[name]));
    }

    executeForBatch() {
      return /^\s*(?:select|pragma|with)\b/i.test(this.sql) ? this.all() : this.run();
    }
  }

  return {
    prepare(sql) {
      return new PreparedStatement(sql);
    },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.executeForBatch());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    async exec(sql) {
      sqlite.exec(sql);
      return { count: 0, duration: 0 };
    },
  };
}

async function render(pathname = "/", options = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost"), {
      method: options.method,
      headers: { accept: "text/html", ...options.headers },
      body: options.body,
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
      ...options.env,
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("rejects anonymous reader-state requests", async () => {
  const response = await render("/api/reader-state?work=cancan-lierixia");

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "需要登入讀者帳號" });
});

test("signed-in readers can save and restore state through the public route", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const headers = {
    "content-type": "application/json",
    "oai-authenticated-user-email": "Reader@Example.com",
    "oai-authenticated-user-full-name": "Yunsheng%20Reader",
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  };
  const state = {
    version: 1,
    chapterSlug: "chapter-01",
    fontSize: "large",
    theme: "night",
    anchor: "paragraph-12",
    progress: 58,
    updatedAt: "2026-07-19T08:00:00.000Z",
  };

  const saved = await render("/api/reader-state", {
    method: "PUT",
    headers,
    body: JSON.stringify({ workSlug: "cancan-lierixia", state }),
    env: { DB: database.DB },
  });
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { state, synced: true });

  const restored = await render("/api/reader-state?work=cancan-lierixia", {
    headers,
    env: { DB: database.DB },
  });
  assert.equal(restored.status, 200);
  assert.deepEqual(await restored.json(), { state });
});

test("reader-state synchronization keeps the most recently updated valid state", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const headers = {
    "content-type": "application/json",
    "oai-authenticated-user-email": "reader@example.com",
  };
  const newerState = {
    version: 1,
    chapterSlug: "chapter-01",
    fontSize: "large",
    theme: "night",
    progress: 70,
    updatedAt: "2026-07-19T09:00:00.000Z",
  };
  const olderState = {
    ...newerState,
    fontSize: "small",
    theme: "day",
    progress: 20,
    updatedAt: "2026-07-19T08:00:00.000Z",
  };

  for (const state of [newerState, olderState]) {
    const response = await render("/api/reader-state", {
      method: "PUT",
      headers,
      body: JSON.stringify({ workSlug: "cancan-lierixia", state }),
      env: { DB: database.DB },
    });
    assert.equal(response.status, 200);
  }

  const restored = await render("/api/reader-state?work=cancan-lierixia", {
    headers,
    env: { DB: database.DB },
  });
  assert.deepEqual(await restored.json(), { state: newerState });
});

test("reader state is isolated to the authenticated account", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const ownerHeaders = {
    "content-type": "application/json",
    "oai-authenticated-user-email": "owner@example.com",
  };
  const state = {
    version: 1,
    chapterSlug: "chapter-01",
    fontSize: "standard",
    theme: "day",
    progress: 33,
    updatedAt: "2026-07-19T10:00:00.000Z",
  };

  const saved = await render("/api/reader-state", {
    method: "PUT",
    headers: ownerHeaders,
    body: JSON.stringify({ workSlug: "cancan-lierixia", state }),
    env: { DB: database.DB },
  });
  assert.equal(saved.status, 200);

  const otherReader = await render(
    "/api/reader-state?work=cancan-lierixia",
    {
      headers: { "oai-authenticated-user-email": "other@example.com" },
      env: { DB: database.DB },
    },
  );
  assert.equal(otherReader.status, 200);
  assert.deepEqual(await otherReader.json(), { state: null });
});

test("reader-state updates reject chapters outside the public preview", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const response = await render("/api/reader-state", {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "oai-authenticated-user-email": "reader@example.com",
    },
    body: JSON.stringify({
      workSlug: "cancan-lierixia",
      state: {
        version: 1,
        chapterSlug: "chapter-02",
        fontSize: "standard",
        theme: "day",
        progress: 10,
        updatedAt: "2026-07-19T10:00:00.000Z",
      },
    }),
    env: { DB: database.DB },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "章節尚未開放閱讀" });
});

test("purchase records require an authenticated reader", async () => {
  const response = await render("/api/purchases");

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "需要登入讀者帳號" });
});

test("a signed-in reader can view an empty purchase-record area", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const response = await render("/api/purchases", {
    headers: { "oai-authenticated-user-email": "reader@example.com" },
    env: { DB: database.DB },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { purchases: [] });
});

test("the browser cannot create purchase records or entitlements", async () => {
  const response = await render("/api/purchases", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "oai-authenticated-user-email": "reader@example.com",
    },
    body: JSON.stringify({ workSlug: "cancan-lierixia", status: "paid" }),
  });

  assert.equal(response.status, 405);
});

test("the reader account page redirects visitors to the localized sign-in choice", async () => {
  const response = await render("/zh-Hant/account");

  assert.equal(response.status, 307);
  const location = new URL(response.headers.get("location"));
  assert.equal(
    `${location.pathname}${location.search}`,
    "/zh-Hant/account/sign-in?return_to=%2Fzh-Hant%2Faccount",
  );
});

test("the sign-in page offers region-appropriate account methods", async () => {
  const mainlandResponse = await render("/zh-Hans/account/sign-in?region=cn");
  assert.equal(mainlandResponse.status, 200);
  const mainlandHtml = await mainlandResponse.text();
  assert.match(mainlandHtml, /Email (?:<!-- -->)?登录/);
  assert.match(mainlandHtml, /手机号登录/);
  assert.doesNotMatch(mainlandHtml, /使用 ChatGPT 登录/);

  const globalResponse = await render("/zh-Hant/account/sign-in?region=global");
  assert.equal(globalResponse.status, 200);
  const globalHtml = await globalResponse.text();
  assert.match(globalHtml, /Email (?:<!-- -->)?登入/);
  assert.match(globalHtml, /手機號登入/);
  assert.match(globalHtml, /使用 ChatGPT 登入/);
});

test("password-account return paths reject external and backslash-shaped redirects", async () => {
  for (const returnTo of ["//example.com", "/\\example.com"]) {
    const response = await render(
      `/zh-Hant/account/sign-in?region=global&return_to=${encodeURIComponent(returnTo)}`,
    );
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.doesNotMatch(html, /href="[^"]*return_to=[^"]*example\.com/);
    assert.match(html, /href="[^"]*return_to=%2F"/);
  }
});

test("a reader can register with email and use the resulting account session", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const registration = await render("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      method: "email",
      identifier: "Reader@Example.com",
      password: "a-long-reader-password-2026",
      displayName: "盛夏讀者",
      region: "cn",
      locale: "zh-Hans",
      marketingOptOut: true,
    }),
    env: { DB: database.DB, AUTH_PASSWORD_PEPPER: "test-only-reader-pepper" },
  });

  assert.equal(registration.status, 201);
  const cookie = registration.headers.get("set-cookie");
  assert.match(cookie ?? "", /yunsheng_session=/);
  assert.deepEqual(await registration.json(), {
    account: {
      displayName: "盛夏讀者",
      locale: "zh-Hans",
      marketingOptIn: false,
      region: "cn",
    },
  });

  const purchases = await render("/api/purchases", {
    headers: { cookie },
    env: { DB: database.DB },
  });
  assert.equal(purchases.status, 200);
  assert.deepEqual(await purchases.json(), { purchases: [] });
});

test("a phone-password account can manage preferences, log out and sign in again", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const registration = await render("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
    body: JSON.stringify({
      method: "phone",
      identifier: "+8613812345678",
      password: "another-long-reader-password-2026",
      displayName: "手机读者",
      region: "cn",
      locale: "zh-Hans",
    }),
    env: { DB: database.DB },
  });
  assert.equal(registration.status, 201);
  assert.deepEqual(await registration.json(), {
    account: {
      displayName: "手机读者",
      locale: "zh-Hans",
      marketingOptIn: true,
      region: "cn",
    },
  });
  const sessionCookie = registration.headers.get("set-cookie");
  assert.match(sessionCookie ?? "", /HttpOnly/);
  assert.match(sessionCookie ?? "", /Secure/);
  assert.match(sessionCookie ?? "", /SameSite=Lax/);
  assert.match(sessionCookie ?? "", /yunsheng_locale_v1=zh-Hans/);

  const preference = await render("/api/account/preferences", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: sessionCookie },
    body: JSON.stringify({ preferredLocale: "zh-Hant", marketingOptIn: false }),
    env: { DB: database.DB },
  });
  assert.equal(preference.status, 200);
  assert.deepEqual(await preference.json(), {
    account: { preferredLocale: "zh-Hant", marketingOptIn: false },
  });

  const logout = await render("/api/auth/logout?return_to=%2Fzh-Hant", {
    method: "POST",
    headers: { cookie: sessionCookie },
    env: { DB: database.DB },
  });
  assert.equal(logout.status, 303);
  const afterLogout = await render("/api/purchases", {
    headers: { cookie: sessionCookie },
    env: { DB: database.DB },
  });
  assert.equal(afterLogout.status, 401);

  const wrongLogin = await render("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
    body: JSON.stringify({
      method: "phone",
      identifier: "+8613812345678",
      password: "not-the-reader-password",
      locale: "zh-Hans",
    }),
    env: { DB: database.DB },
  });
  assert.equal(wrongLogin.status, 401);
  assert.deepEqual(await wrongLogin.json(), { error: "登入資料不正確" });

  const login = await render("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.10" },
    body: JSON.stringify({
      method: "phone",
      identifier: "+8613812345678",
      password: "another-long-reader-password-2026",
      locale: "zh-Hant",
    }),
    env: { DB: database.DB },
  });
  assert.equal(login.status, 200);
  assert.match(login.headers.get("set-cookie") ?? "", /yunsheng_session=/);
  assert.deepEqual(await login.json(), {
    account: {
      displayName: "手机读者",
      locale: "zh-Hant",
      marketingOptIn: false,
      region: "cn",
    },
  });
});

test("a signed-in ChatGPT reader links the same verified email without splitting state", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const chatGPTHeaders = {
    "content-type": "application/json",
    "oai-authenticated-user-email": "linked@example.com",
    "oai-authenticated-user-full-name": "Linked%20Reader",
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  };
  const state = {
    version: 1,
    chapterSlug: "chapter-01",
    fontSize: "large",
    theme: "night",
    progress: 42,
    updatedAt: "2026-07-20T10:00:00.000Z",
  };
  const saved = await render("/api/reader-state", {
    method: "PUT",
    headers: chatGPTHeaders,
    body: JSON.stringify({ workSlug: "cancan-lierixia", state }),
    env: { DB: database.DB },
  });
  assert.equal(saved.status, 200);

  const linked = await render("/api/auth/register", {
    method: "POST",
    headers: chatGPTHeaders,
    body: JSON.stringify({
      method: "email",
      identifier: "linked@example.com",
      password: "linked-reader-password-2026",
      displayName: "Linked Reader",
      region: "global",
      locale: "zh-Hant",
      marketingOptOut: true,
    }),
    env: { DB: database.DB },
  });
  assert.equal(linked.status, 201);
  const linkedCookie = linked.headers.get("set-cookie");
  const restored = await render("/api/reader-state?work=cancan-lierixia", {
    headers: { cookie: linkedCookie },
    env: { DB: database.DB },
  });
  assert.equal(restored.status, 200);
  assert.deepEqual(await restored.json(), { state });

  const anonymousDuplicate = await render("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.20" },
    body: JSON.stringify({
      method: "email",
      identifier: "linked@example.com",
      password: "different-reader-password-2026",
      displayName: "Other Reader",
      region: "global",
      locale: "zh-Hant",
    }),
    env: { DB: database.DB },
  });
  assert.equal(anonymousDuplicate.status, 400);
  assert.deepEqual(await anonymousDuplicate.json(), {
    error: "暫時無法建立帳號，請檢查資料或聯繫客服",
  });
});

test("a password account cannot pre-hijack a later ChatGPT identity with the same email", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const registered = await render("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.30" },
    body: JSON.stringify({
      method: "email",
      identifier: "victim@example.com",
      password: "attacker-controlled-password-2026",
      displayName: "Unverified email account",
      region: "global",
      locale: "zh-Hant",
    }),
    env: { DB: database.DB },
  });
  assert.equal(registered.status, 201);
  const attackerState = {
    version: 1,
    chapterSlug: "chapter-01",
    fontSize: "large",
    theme: "night",
    progress: 77,
    updatedAt: "2026-07-20T11:00:00.000Z",
  };
  const saved = await render("/api/reader-state", {
    method: "PUT",
    headers: { "content-type": "application/json", cookie: registered.headers.get("set-cookie") },
    body: JSON.stringify({ workSlug: "cancan-lierixia", state: attackerState }),
    env: { DB: database.DB },
  });
  assert.equal(saved.status, 200);

  const victim = await render("/api/reader-state?work=cancan-lierixia", {
    headers: {
      "oai-authenticated-user-email": "victim@example.com",
      "oai-authenticated-user-full-name": "Actual%20Victim",
      "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
    },
    env: { DB: database.DB },
  });
  assert.equal(victim.status, 200);
  assert.deepEqual(await victim.json(), { state: null });
});

test("a signed-in password reader can add a phone login to the same reader account", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const password = "one-reader-two-login-methods-2026";
  const registered = await render("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.40" },
    body: JSON.stringify({
      method: "email",
      identifier: "multi@example.com",
      password,
      displayName: "Multi Method Reader",
      region: "global",
      locale: "zh-Hant",
    }),
    env: { DB: database.DB },
  });
  assert.equal(registered.status, 201);
  const cookie = registered.headers.get("set-cookie");
  const state = {
    version: 1,
    chapterSlug: "chapter-01",
    fontSize: "standard",
    theme: "day",
    progress: 28,
    updatedAt: "2026-07-20T12:00:00.000Z",
  };
  assert.equal((await render("/api/reader-state", {
    method: "PUT",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ workSlug: "cancan-lierixia", state }),
    env: { DB: database.DB },
  })).status, 200);

  const linked = await render("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.41", cookie },
    body: JSON.stringify({
      method: "phone",
      identifier: "+886912345678",
      password,
      displayName: "Multi Method Reader",
      region: "global",
      locale: "zh-Hant",
    }),
    env: { DB: database.DB },
  });
  assert.equal(linked.status, 201);

  const phoneLogin = await render("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.42" },
    body: JSON.stringify({ method: "phone", identifier: "+886912345678", password }),
    env: { DB: database.DB },
  });
  assert.equal(phoneLogin.status, 200);
  const restored = await render("/api/reader-state?work=cancan-lierixia", {
    headers: { cookie: phoneLogin.headers.get("set-cookie") },
    env: { DB: database.DB },
  });
  assert.deepEqual(await restored.json(), { state });
});

test("the identity migration preserves legacy account and reader-state ownership", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const migrationDirectory = new URL("../drizzle/", import.meta.url);
  const apply = async (name) => {
    const migration = await readFile(new URL(name, migrationDirectory), "utf8");
    for (const statement of migration.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
      sqlite.exec(statement);
    }
  };

  await apply("0000_stiff_naoko.sql");
  sqlite.prepare("INSERT INTO reader_accounts (id, external_identity, normalized_email, display_name) VALUES (?, ?, ?, ?)")
    .run("reader_legacy", "chatgpt:legacy@example.com", "legacy@example.com", "Legacy Reader");
  sqlite.prepare("INSERT INTO reader_states (reader_account_id, work_id, work_slug, chapter_id, chapter_slug, progress, font_size, theme, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("reader_legacy", "work_001_cancan_lierixia", "cancan-lierixia", "chapter_001_cancan_lierixia", "chapter-01", 31, "standard", "day", "2026-07-19T00:00:00.000Z");

  await apply("0001_tired_centennial.sql");
  await apply("0002_marvelous_yellow_claw.sql");
  assert.deepEqual({ ...sqlite.prepare("SELECT id, marketing_opt_in FROM reader_accounts").get() }, {
    id: "reader_legacy",
    marketing_opt_in: 0,
  });
  assert.deepEqual({ ...sqlite.prepare("SELECT reader_account_id, kind, normalized_identifier, verified FROM reader_identities").get() }, {
    reader_account_id: "reader_legacy",
    kind: "chatgpt",
    normalized_identifier: "chatgpt:legacy@example.com",
    verified: 1,
  });
  assert.equal(sqlite.prepare("SELECT reader_account_id FROM reader_states").get().reader_account_id, "reader_legacy");
  sqlite.close();
});

test("the signed-in account page provisions a reader and shows purchase history", async (t) => {
  const database = await createTestDb();
  t.after(database.dispose);
  const response = await render("/zh-Hant/account?work=cancan-lierixia", {
    headers: {
      "oai-authenticated-user-email": "reader@example.com",
      "oai-authenticated-user-full-name": "%E5%85%81%E7%94%9F%E8%AE%80%E8%80%85",
      "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
    },
    env: { DB: database.DB },
  });

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>我的閱讀帳號｜允生作品<\/title>/i);
  assert.match(html, /允生讀者/);
  assert.match(html, /re•••@example\.com/);
  assert.match(html, /尚無購買記錄/);
  assert.match(
    html,
    /href="\/signout-with-chatgpt\?return_to=%2Fzh-Hant%2Fworks%2Fcancan-lierixia"/,
  );
});

test("server-renders the Yunsheng Works brand home with its first work", async () => {
  const response = await render("/zh-Hant");
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
  assert.match(html, /href="\/zh-Hant\/works\/cancan-lierixia"/);
  assert.match(html, /href="\/zh-Hant\/account"[^>]*>讀者帳號<\/a>/);
  assert.match(html, /casting-concept-ensemble\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("unprefixed public links choose and remember a supported locale", async () => {
  const response = await render("/", {
    headers: { "accept-language": "zh-CN,zh;q=0.9" },
  });
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location")).pathname, "/zh-Hans");

  const simplified = await render("/zh-Hans");
  assert.equal(simplified.status, 200);
  assert.match(simplified.headers.get("set-cookie") ?? "", /yunsheng_locale_v1=zh-Hans/);
  const html = await simplified.text();
  assert.match(html, /<html lang="zh-Hans">/i);
  assert.match(html, /故事从这里出生/);
  assert.match(html, /href="\/zh-Hant"[^>]*lang="zh-Hant"/);
  assert.match(html, /hreflang="zh-Hans"/i);
  assert.match(html, /hreflang="zh-Hant"/i);
});

test("simplified public content keeps unreviewed chapter text unpublished", async () => {
  const workResponse = await render("/zh-Hans/works/cancan-lierixia");
  assert.equal(workResponse.status, 200);
  const workHtml = await workResponse.text();
  assert.match(workHtml, /目录与免费试读/);
  assert.match(workHtml, /简体试读内容审校中|正式试读整理中/);

  const chapterResponse = await render("/zh-Hans/read/cancan-lierixia/chapter-01");
  const chapterHtml = await chapterResponse.text();
  assert.equal(chapterResponse.status, 200);
  assert.match(chapterHtml, /简体试读内容审校中/);
  assert.doesNotMatch(chapterHtml, /月上樹梢|月上树梢/);

  const prologueResponse = await render("/zh-Hans/read/cancan-lierixia/prologue");
  const prologueHtml = await prologueResponse.text();
  assert.equal(prologueResponse.status, 200);
  assert.match(prologueHtml, /何念恩和许承恩从彼此的少年时代穿过/);
  assert.match(prologueHtml, /id="summer-begins"/);
});

test("server-renders the dedicated Cancan Lierixia work page", async () => {
  const response = await render("/zh-Hant/works/cancan-lierixia");
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
  assert.match(html, /href="\/zh-Hant\/works\/cancan-lierixia\/scenes\/dorm-after-lights"/);
  assert.match(html, /href="\/zh-Hant\/works\/cancan-lierixia\/scenes\/farewell-song"/);
  assert.match(html, /href="\/zh-Hant\/works\/cancan-lierixia\/scenes\/time-capsule-reunion"/);
  assert.match(html, /href="\/zh-Hant"[^>]*>允生作品<\/a>/);
  assert.match(
    html,
    /href="\/zh-Hant\/account\?work=cancan-lierixia"[^>]*>讀者帳號<\/a>/,
  );
  assert.match(html, /id="catalog"/);
  assert.match(html, /作品前導/);
  assert.match(html, /href="\/zh-Hant\/read\/cancan-lierixia\/prologue"/);
  assert.match(html, /第一章｜致一如初見的你們/);
  assert.match(html, /href="\/zh-Hant\/read\/cancan-lierixia\/chapter-01"/);
  assert.match(html, /免費試讀/);
  assert.match(html, /目前開放作品前導與第一章免費試讀/);
  assert.match(html, /小說第一冊電子書即將發行，敬請期待/);
  assert.doesNotMatch(html, /完整手稿不會放入網站或公開下載/);
});

test("server-renders all three illustrated scene excerpts", async () => {
  const cases = [
    {
      path: "/zh-Hant/works/cancan-lierixia/scenes/dorm-after-lights",
      title: "宿舍熄燈之後",
      image: "scene-detail-01-dorm-after-lights-v3.webp",
      source: "第一章節選 · 完稿內容",
      excerpt: "宿舍樓裡早早陷入一片黑暗",
    },
    {
      path: "/zh-Hant/works/cancan-lierixia/scenes/farewell-song",
      title: "隔樓唱起《送別》",
      image: "scene-detail-02-farewell-song-v2.webp",
      source: "後續創作場景節選 · 草稿內容",
      excerpt: "她就是突然想喊他的名字",
    },
    {
      path: "/zh-Hant/works/cancan-lierixia/scenes/time-capsule-reunion",
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
    assert.match(html, /href="\/zh-Hant\/works\/cancan-lierixia#scenes"/);
  }
});

test("server-renders the public prologue in the web reader", async () => {
  const response = await render("/zh-Hant/read/cancan-lierixia/prologue");
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
  assert.match(
    html,
    /href="\/zh-Hant\/account\?work=cancan-lierixia"[^>]*>確認同步狀態<\/a>/,
  );
  assert.match(html, /href="\/zh-Hant\/read\/cancan-lierixia\/chapter-01"/);
  assert.match(html, /下一章/);
  assert.match(html, /href="\/zh-Hant\/works\/cancan-lierixia"/);
});

test("server-renders the complete approved first chapter as a free preview", async () => {
  const response = await render("/zh-Hant/read/cancan-lierixia/chapter-01");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>第一章｜致一如初見的你們｜燦燦烈日下<\/title>/i);
  assert.match(html, /FREE PREVIEW · 免費試讀/);
  assert.match(html, /月上樹梢，校園安靜的只剩下蟬鳴聲。/);
  assert.match(html, /嗯，討厭的青梅竹馬。/);
  assert.match(html, /本頁只包含作者核准公開的免費試讀章節/);
  assert.doesNotMatch(html, /正式試讀整理中/);
  assert.match(html, /href="\/zh-Hant\/read\/cancan-lierixia\/prologue"/);
  assert.match(html, /上一章/);
});

test("does not send chapter text for a chapter that is not open", async () => {
  const response = await render("/zh-Hant/read/cancan-lierixia/chapter-02");
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

test("the work registry keeps routes and preview content isolated across works", () => {
  const makeWork = (id, slug, title, text) => ({
    id,
    slug,
    title,
    author: "允生",
    cover: { src: `/${slug}.webp`, alt: `${title}測試封面` },
    synopsis: `${title}測試簡介`,
    publicationStatus: "測試作品",
    previewChapterCount: 1,
    introduction: {
      id: `${id}_intro`,
      slug: "prologue",
      title: "作品前導",
      contentVersion: 1,
      paragraphs: [{ id: `${slug}-intro`, text: `${title}前導` }],
    },
    chapters: [
      {
        id: `${id}_chapter_01`,
        order: 1,
        slug: "chapter-01",
        title: "第一章",
        contentVersion: 1,
        sourceParagraphs: [{ id: `${slug}-paragraph`, text }],
      },
    ],
  });
  const registry = createWorkRegistry([
    makeWork("work_a", "summer-a", "盛夏甲", "甲作品正文"),
    makeWork("work_b", "winter-b", "冬日乙", "乙作品正文"),
  ]);

  assert.deepEqual(
    registry.list().map(({ slug }) => slug),
    ["summer-a", "winter-b"],
  );
  assert.equal(registry.getWork("summer-a")?.title, "盛夏甲");
  assert.equal(registry.getWork("winter-b")?.title, "冬日乙");
  assert.deepEqual(
    registry.getReading("summer-a", "chapter-01")?.paragraphs,
    [{ id: "summer-a-paragraph", text: "甲作品正文" }],
  );
  assert.deepEqual(
    registry.getReading("winter-b", "chapter-01")?.paragraphs,
    [{ id: "winter-b-paragraph", text: "乙作品正文" }],
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
  assert.equal(
    parseStoredReaderState(JSON.stringify({
      version: 0,
      chapterSlug: "prologue",
      fontSize: "standard",
      theme: "day",
      progress: 20,
      updatedAt: "2026-07-16T10:00:00.000Z",
    })),
    null,
  );
  assert.equal(
    parseStoredReaderState(JSON.stringify({
      version: 1,
      chapterSlug: "prologue",
      fontSize: "standard",
      theme: "day",
      progress: 20,
      updatedAt: "2026-07-19T16:00:00+08:00",
    })),
    null,
  );
  assert.equal(
    parseStoredReaderState(JSON.stringify({
      version: 1,
      chapterSlug: "prologue",
      fontSize: "standard",
      theme: "day",
      progress: 101,
      updatedAt: "2026-07-16T10:00:00.000Z",
    })),
    null,
  );
});

test("local and cloud reader state merge by update time with cloud winning ties", () => {
  const localState = parseStoredReaderState(serializeReaderState({
    chapterSlug: "prologue",
    fontSize: "standard",
    theme: "day",
    progress: 40,
    updatedAt: "2026-07-19T08:00:00.000Z",
  }));
  const cloudState = parseStoredReaderState(serializeReaderState({
    chapterSlug: "chapter-01",
    fontSize: "large",
    theme: "night",
    progress: 60,
    updatedAt: "2026-07-19T09:00:00.000Z",
  }));

  assert.equal(mergeStoredReaderStates(localState, cloudState), cloudState);
  assert.equal(mergeStoredReaderStates(cloudState, localState), cloudState);
  const tiedCloudState = { ...cloudState };
  assert.equal(mergeStoredReaderStates(cloudState, tiedCloudState), tiedCloudState);
  assert.equal(mergeStoredReaderStates(localState, null), localState);
  assert.equal(mergeStoredReaderStates(null, cloudState), cloudState);
});

test("starter preview is removed from the finished site", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /允生作品/);
  assert.match(layout, /<html lang=\{locale\}>/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app\/_sites-preview", import.meta.url)));
});

test("git ignores private manuscript formats without excluding approved previews", async () => {
  const cwd = new URL("..", import.meta.url);
  const privatePaths = [
    "private-manuscripts/full-manuscript.txt",
    "manuscripts/燦燦烈日下.docx",
    "content-source/full-text/extracted.txt",
    "exports/燦燦烈日下.epub",
    "exports/燦燦烈日下.pdf",
  ];

  const { stdout } = await execFileAsync(
    "git",
    ["-c", "core.quotepath=false", "check-ignore", "--no-index", ...privatePaths],
    { cwd },
  );
  assert.deepEqual(stdout.trim().split("\n"), privatePaths);

  await assert.rejects(
    execFileAsync(
      "git",
      [
        "-c",
        "core.quotepath=false",
        "check-ignore",
        "--no-index",
        "app/content/previews/cancan-lierixia-chapter-01.js",
      ],
      { cwd },
    ),
  );
});
