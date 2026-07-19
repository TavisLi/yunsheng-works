import { and, desc, eq, lt } from "drizzle-orm";
import type { ReaderIdentity } from "../app/reader-identity";
import type { StoredReaderState } from "../app/read/reader-state";
import { getDb } from ".";
import {
  purchaseRecords,
  readerAccounts,
  readerStates,
} from "./schema";

export type ReaderAccount = typeof readerAccounts.$inferSelect;

export async function provisionReaderAccount(
  identity: ReaderIdentity,
): Promise<ReaderAccount> {
  const db = getDb();
  const now = new Date().toISOString();

  await db
    .insert(readerAccounts)
    .values({
      id: crypto.randomUUID(),
      externalIdentity: identity.externalId,
      normalizedEmail: identity.email,
      displayName: identity.displayName,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: readerAccounts.externalIdentity,
      set: {
        normalizedEmail: identity.email,
        displayName: identity.displayName,
        updatedAt: now,
      },
    });

  const account = await db.query.readerAccounts.findFirst({
    where: eq(readerAccounts.externalIdentity, identity.externalId),
  });
  if (!account) throw new Error("讀者帳號建立失敗");
  return account;
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
