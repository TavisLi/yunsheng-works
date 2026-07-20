import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { getDb, getRuntimeBindings } from ".";
import {
  readerAccounts,
  readerAuthRateLimits,
  readerIdentities,
  readerPasswordCredentials,
  readerSessions,
} from "./schema";

export type AccountRegion = "cn" | "global";
export type ReaderLocale = "zh-Hant" | "zh-Hans";
export type PasswordIdentityKind = "email" | "phone";

const PASSWORD_ALGORITHM = "PBKDF2-HMAC-SHA-256";
const PASSWORD_VERSION = 1;
const PASSWORD_ITERATIONS = 600_000;
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const COMMON_PASSWORDS = new Set([
  "123456789012",
  "password1234",
  "qwerty123456",
  "yunsheng2026",
  "cancanlierixia",
]);

export class ReaderAuthError extends Error {
  constructor(
    readonly code: "invalid-input" | "identifier-exists" | "invalid-credentials",
    message: string,
  ) {
    super(message);
  }
}

export async function registerPasswordReader(input: {
  method: PasswordIdentityKind;
  identifier: string;
  password: string;
  displayName: string;
  region: AccountRegion;
  locale: ReaderLocale;
  marketingOptOut: boolean;
  linkReaderAccountId?: string;
}) {
  const pepper = requireAuthPepper();
  const identifier = normalizeIdentifier(input.method, input.identifier);
  const displayName = input.displayName.trim();
  validatePassword(input.password);
  if (!displayName || displayName.length > 80) {
    throw new ReaderAuthError("invalid-input", "請輸入有效的顯示名稱");
  }

  const db = getDb();
  const duplicate = await db.query.readerIdentities.findFirst({
    where: and(
      eq(readerIdentities.kind, input.method),
      eq(readerIdentities.normalizedIdentifier, identifier),
    ),
  });
  if (duplicate) {
    throw new ReaderAuthError("identifier-exists", "此登入識別已被使用");
  }

  const now = new Date();
  const readerAccountId = input.linkReaderAccountId ?? crypto.randomUUID();
  const session = await newSession(readerAccountId, now);
  const marketingOptIn = !input.marketingOptOut;

  const existingCredential = input.linkReaderAccountId
    ? await db.query.readerPasswordCredentials.findFirst({
        where: eq(readerPasswordCredentials.readerAccountId, readerAccountId),
      })
    : undefined;
  if (
    existingCredential &&
    !(await verifyPassword(input.password, existingCredential, pepper))
  ) {
    throw invalidCredentials();
  }
  const credential = existingCredential
    ? undefined
    : await passwordCredential(input.password, now, pepper);

  const accountWrite = input.linkReaderAccountId
    ? db.update(readerAccounts).set({
        displayName,
        preferredLocale: input.locale,
        region: input.region,
        updatedAt: now.toISOString(),
      }).where(eq(readerAccounts.id, readerAccountId))
    : db.insert(readerAccounts).values({
        id: readerAccountId,
        displayName,
        preferredLocale: input.locale,
        region: input.region,
        marketingOptIn,
        marketingConsentAt: marketingOptIn ? now.toISOString() : null,
        updatedAt: now.toISOString(),
      });

  const writes = [
    accountWrite,
    db.insert(readerIdentities).values({
      id: crypto.randomUUID(),
      readerAccountId,
      kind: input.method,
      normalizedIdentifier: identifier,
      verified: false,
    }),
    db.insert(readerSessions).values(session.row),
  ] as const;
  if (credential) {
    await db.batch([
      ...writes,
      db.insert(readerPasswordCredentials).values({
        readerAccountId,
        ...credential,
      }),
    ]);
  } else {
    await db.batch(writes);
  }

  return {
    account: {
      displayName,
      locale: input.locale,
      marketingOptIn: input.linkReaderAccountId ? undefined : marketingOptIn,
      region: input.region,
    },
    sessionToken: session.token,
  };
}

export async function consumeAuthRateLimit(
  action: "login" | "register",
  fingerprint: string,
  limit = 10,
) {
  const now = new Date();
  const windowMs = 15 * 60 * 1000;
  const window = Math.floor(now.getTime() / windowMs);
  const key = `${action}:${window}:${await digest(fingerprint)}`;
  const expiresAt = new Date((window + 1) * windowMs).toISOString();
  const db = getDb();
  await db
    .insert(readerAuthRateLimits)
    .values({ key, expiresAt, updatedAt: now.toISOString() })
    .onConflictDoUpdate({
      target: readerAuthRateLimits.key,
      set: {
        attempts: sql`${readerAuthRateLimits.attempts} + 1`,
        updatedAt: now.toISOString(),
      },
    });
  const row = await db.query.readerAuthRateLimits.findFirst({
    where: eq(readerAuthRateLimits.key, key),
  });
  return { allowed: (row?.attempts ?? limit + 1) <= limit, retryAfter: expiresAt };
}

export async function loginPasswordReader(input: {
  method: PasswordIdentityKind;
  identifier: string;
  password: string;
}) {
  const pepper = requireAuthPepper();
  const identifier = normalizeIdentifier(input.method, input.identifier);
  const db = getDb();
  const identity = await db.query.readerIdentities.findFirst({
    where: and(
      eq(readerIdentities.kind, input.method),
      eq(readerIdentities.normalizedIdentifier, identifier),
    ),
  });
  if (!identity) throw invalidCredentials();

  const credential = await db.query.readerPasswordCredentials.findFirst({
    where: eq(readerPasswordCredentials.readerAccountId, identity.readerAccountId),
  });
  if (!credential || !(await verifyPassword(input.password, credential, pepper))) {
    throw invalidCredentials();
  }

  const account = await db.query.readerAccounts.findFirst({
    where: eq(readerAccounts.id, identity.readerAccountId),
  });
  if (!account) throw invalidCredentials();
  const session = await newSession(account.id, new Date());
  await db.insert(readerSessions).values(session.row);

  return { account, sessionToken: session.token };
}

export async function getSessionReaderIdentity(token: string) {
  const tokenHash = await digest(token);
  const db = getDb();
  const session = await db.query.readerSessions.findFirst({
    where: and(
      eq(readerSessions.tokenHash, tokenHash),
      isNull(readerSessions.revokedAt),
      gt(readerSessions.expiresAt, new Date().toISOString()),
    ),
  });
  if (!session) return null;

  const account = await db.query.readerAccounts.findFirst({
    where: eq(readerAccounts.id, session.readerAccountId),
  });
  if (!account) return null;
  const identities = await db
    .select({ kind: readerIdentities.kind, identifier: readerIdentities.normalizedIdentifier })
    .from(readerIdentities)
    .where(eq(readerIdentities.readerAccountId, account.id));
  const email = identities.find(({ kind }) => kind === "email" || kind === "chatgpt")?.identifier;

  return {
    readerAccountId: account.id,
    externalId: `reader:${account.id}`,
    email: email ?? null,
    displayName: account.displayName,
  };
}

export async function revokeSession(token: string) {
  await getDb()
    .update(readerSessions)
    .set({ revokedAt: new Date().toISOString() })
    .where(eq(readerSessions.tokenHash, await digest(token)));
}

export function readerSessionCookie(token: string) {
  return `yunsheng_session=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function expiredReaderSessionCookie() {
  return "yunsheng_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";
}

export function readerLocaleCookie(locale: ReaderLocale) {
  return `yunsheng_locale_v1=${locale}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`;
}

function normalizeIdentifier(kind: PasswordIdentityKind, value: string) {
  const normalized = value.trim().toLowerCase();
  if (kind === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) {
      throw new ReaderAuthError("invalid-input", "請輸入有效的 Email");
    }
    return normalized;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    throw new ReaderAuthError("invalid-input", "手機號必須包含國碼，例如 +8613812345678");
  }
  return normalized;
}

function validatePassword(password: string) {
  if (password.length < 12 || password.length > 128) {
    throw new ReaderAuthError("invalid-input", "密碼長度必須為 12 至 128 個字元");
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    throw new ReaderAuthError("invalid-input", "請避免使用常見或與本站相關的密碼");
  }
}

async function passwordCredential(password: string, now: Date, pepper: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    algorithm: PASSWORD_ALGORITHM,
    version: PASSWORD_VERSION,
    iterations: PASSWORD_ITERATIONS,
    salt: encode(salt),
    derivedKey: encode(await derivePassword(password, salt, PASSWORD_ITERATIONS, pepper)),
    updatedAt: now.toISOString(),
  };
}

async function verifyPassword(
  password: string,
  credential: typeof readerPasswordCredentials.$inferSelect,
  pepper: string,
) {
  if (credential.algorithm !== PASSWORD_ALGORITHM || credential.version !== PASSWORD_VERSION) return false;
  const expected = decode(credential.derivedKey);
  const actual = await derivePassword(password, decode(credential.salt), credential.iterations, pepper);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }
  return difference === 0;
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number, pepper: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${password}\u0000${pepper}`),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

function requireAuthPepper() {
  const pepper = getRuntimeBindings()?.AUTH_PASSWORD_PEPPER;
  if (!pepper) throw new Error("AUTH_PASSWORD_PEPPER is not configured");
  return pepper;
}

async function newSession(readerAccountId: string, now: Date) {
  const token = encode(crypto.getRandomValues(new Uint8Array(32)));
  return {
    token,
    row: {
      id: crypto.randomUUID(),
      readerAccountId,
      tokenHash: await digest(token),
      expiresAt: new Date(now.getTime() + SESSION_SECONDS * 1000).toISOString(),
    },
  };
}

async function digest(value: string) {
  return encode(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

function encode(value: Uint8Array) {
  return btoa(String.fromCharCode(...value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decode(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function invalidCredentials() {
  return new ReaderAuthError("invalid-credentials", "登入資料不正確");
}
