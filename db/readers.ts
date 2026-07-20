import { and, desc, eq, lt } from "drizzle-orm";
import type { ReaderIdentity } from "../app/reader-identity";
import type { StoredReaderState } from "../app/read/reader-state";
import { getDb } from ".";
import {
  purchaseRecords,
  readerAccounts,
  readerIdentities,
  readerStates,
} from "./schema";

export type ReaderAccount = typeof readerAccounts.$inferSelect;

export async function provisionReaderAccount(
  identity: ReaderIdentity,
): Promise<ReaderAccount> {
  const db = getDb();
  const now = new Date().toISOString();

  if (identity.readerAccountId) {
    const existing = await db.query.readerAccounts.findFirst({
      where: eq(readerAccounts.id, identity.readerAccountId),
    });
    if (!existing) throw new Error("讀者帳號不存在");
    return existing;
  }

  const existingIdentity = await db.query.readerIdentities.findFirst({
    where: and(
      eq(readerIdentities.normalizedIdentifier, identity.externalId),
      eq(readerIdentities.kind, "chatgpt"),
    ),
  });
  const accountId = existingIdentity?.readerAccountId ?? crypto.randomUUID();

  await db
    .insert(readerAccounts)
    .values({
      id: accountId,
      displayName: identity.displayName,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: readerAccounts.id,
      set: {
        displayName: identity.displayName,
        updatedAt: now,
      },
    });

  await db
    .insert(readerIdentities)
    .values({
      id: crypto.randomUUID(),
      readerAccountId: accountId,
      kind: "chatgpt",
      normalizedIdentifier: identity.externalId,
      verified: true,
    })
    .onConflictDoNothing();

  const account = await db.query.readerAccounts.findFirst({
    where: eq(readerAccounts.id, accountId),
  });
  if (!account) throw new Error("讀者帳號建立失敗");
  return account;
}

export async function getReaderAccountIdentifiers(readerAccountId: string) {
  return getDb()
    .select({
      kind: readerIdentities.kind,
      identifier: readerIdentities.normalizedIdentifier,
      verified: readerIdentities.verified,
    })
    .from(readerIdentities)
    .where(eq(readerIdentities.readerAccountId, readerAccountId));
}

export async function updateReaderAccountPreferences(
  readerAccountId: string,
  input: { preferredLocale?: "zh-Hant" | "zh-Hans"; marketingOptIn?: boolean },
) {
  const now = new Date().toISOString();
  const values = {
    ...(input.preferredLocale ? { preferredLocale: input.preferredLocale } : {}),
    ...(typeof input.marketingOptIn === "boolean"
      ? {
          marketingOptIn: input.marketingOptIn,
          marketingConsentAt: input.marketingOptIn ? now : null,
        }
      : {}),
    updatedAt: now,
  };
  await getDb()
    .update(readerAccounts)
    .set(values)
    .where(eq(readerAccounts.id, readerAccountId));

  return getDb().query.readerAccounts.findFirst({
    where: eq(readerAccounts.id, readerAccountId),
  });
}

export async function getReaderState(readerAccountId: string, workId: string) {
  const db = getDb();
  const row = await db.query.readerStates.findFirst({
    where: and(
      eq(readerStates.readerAccountId, readerAccountId),
      eq(readerStates.workId, workId),
    ),
  });

  return row ? toStoredReaderState(row) : null;
}

export async function mergeReaderState(input: {
  readerAccountId: string;
  workId: string;
  workSlug: string;
  chapterId: string;
  state: StoredReaderState;
}) {
  const db = getDb();
  const values = {
    readerAccountId: input.readerAccountId,
    workId: input.workId,
    workSlug: input.workSlug,
    chapterId: input.chapterId,
    chapterSlug: input.state.chapterSlug,
    anchor: input.state.anchor ?? null,
    progress: Math.round(input.state.progress),
    fontSize: input.state.fontSize,
    theme: input.state.theme,
    updatedAt: input.state.updatedAt,
  };

  await db
    .insert(readerStates)
    .values(values)
    .onConflictDoUpdate({
      target: [readerStates.readerAccountId, readerStates.workId],
      set: values,
      setWhere: lt(readerStates.updatedAt, input.state.updatedAt),
    });

  return getReaderState(input.readerAccountId, input.workId);
}

export async function listPurchaseRecords(readerAccountId: string) {
  return getDb()
    .select({
      id: purchaseRecords.id,
      workSlug: purchaseRecords.workSlug,
      status: purchaseRecords.status,
      purchasedAt: purchaseRecords.purchasedAt,
    })
    .from(purchaseRecords)
    .where(eq(purchaseRecords.readerAccountId, readerAccountId))
    .orderBy(desc(purchaseRecords.purchasedAt), desc(purchaseRecords.id));
}

function toStoredReaderState(
  row: typeof readerStates.$inferSelect,
): StoredReaderState {
  return {
    version: 1,
    chapterSlug: row.chapterSlug,
    fontSize: row.fontSize,
    theme: row.theme,
    ...(row.anchor ? { anchor: row.anchor } : {}),
    progress: row.progress,
    updatedAt: row.updatedAt,
  };
}
