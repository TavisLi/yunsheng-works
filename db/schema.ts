import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const readerAccounts = sqliteTable(
  "reader_accounts",
  {
    id: text("id").primaryKey(),
    displayName: text("display_name").notNull(),
    preferredLocale: text("preferred_locale", { enum: ["zh-Hant", "zh-Hans"] })
      .notNull()
      .default("zh-Hant"),
    region: text("region", { enum: ["cn", "global"] })
      .notNull()
      .default("global"),
    marketingOptIn: integer("marketing_opt_in", { mode: "boolean" })
      .notNull()
      .default(true),
    marketingConsentAt: text("marketing_consent_at"),
    marketingNoticeVersion: text("marketing_notice_version")
      .notNull()
      .default("2026-07-19"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const readerIdentities = sqliteTable(
  "reader_identities",
  {
    id: text("id").primaryKey(),
    readerAccountId: text("reader_account_id")
      .notNull()
      .references(() => readerAccounts.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["chatgpt", "email", "phone"] }).notNull(),
    normalizedIdentifier: text("normalized_identifier").notNull(),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("reader_identities_kind_identifier_idx").on(
      table.kind,
      table.normalizedIdentifier,
    ),
    index("reader_identities_account_idx").on(table.readerAccountId),
  ],
);

export const readerPasswordCredentials = sqliteTable(
  "reader_password_credentials",
  {
    readerAccountId: text("reader_account_id")
      .primaryKey()
      .references(() => readerAccounts.id, { onDelete: "cascade" }),
    algorithm: text("algorithm").notNull(),
    version: integer("version").notNull().default(1),
    iterations: integer("iterations").notNull(),
    salt: text("salt").notNull(),
    derivedKey: text("derived_key").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const readerSessions = sqliteTable(
  "reader_sessions",
  {
    id: text("id").primaryKey(),
    readerAccountId: text("reader_account_id")
      .notNull()
      .references(() => readerAccounts.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    revokedAt: text("revoked_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("reader_sessions_token_idx").on(table.tokenHash),
    index("reader_sessions_account_idx").on(table.readerAccountId),
  ],
);

export const readerAuthRateLimits = sqliteTable(
  "reader_auth_rate_limits",
  {
    key: text("key").primaryKey(),
    attempts: integer("attempts").notNull().default(1),
    expiresAt: text("expires_at").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("reader_auth_rate_limits_expiry_idx").on(table.expiresAt)],
);

export const readerStates = sqliteTable(
  "reader_states",
  {
    readerAccountId: text("reader_account_id")
      .notNull()
      .references(() => readerAccounts.id, { onDelete: "cascade" }),
    workId: text("work_id").notNull(),
    workSlug: text("work_slug").notNull(),
    chapterId: text("chapter_id").notNull(),
    chapterSlug: text("chapter_slug").notNull(),
    anchor: text("anchor"),
    progress: integer("progress").notNull(),
    fontSize: text("font_size", { enum: ["small", "standard", "large"] })
      .notNull(),
    theme: text("theme", { enum: ["day", "night"] }).notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.readerAccountId, table.workId] }),
    index("reader_states_account_idx").on(table.readerAccountId),
  ],
);

export const purchaseRecords = sqliteTable(
  "purchase_records",
  {
    id: text("id").primaryKey(),
    readerAccountId: text("reader_account_id")
      .notNull()
      .references(() => readerAccounts.id, { onDelete: "cascade" }),
    workId: text("work_id").notNull(),
    workSlug: text("work_slug").notNull(),
    source: text("source").notNull(),
    externalOrderId: text("external_order_id").notNull(),
    status: text("status", {
      enum: ["pending", "paid", "refunded", "cancelled"],
    }).notNull(),
    purchasedAt: text("purchased_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("purchase_records_account_idx").on(table.readerAccountId),
    uniqueIndex("purchase_records_source_order_idx").on(
      table.source,
      table.externalOrderId,
    ),
  ],
);

export const purchaseEntitlements = sqliteTable(
  "purchase_entitlements",
  {
    readerAccountId: text("reader_account_id")
      .notNull()
      .references(() => readerAccounts.id, { onDelete: "cascade" }),
    workId: text("work_id").notNull(),
    workSlug: text("work_slug").notNull(),
    status: text("status", { enum: ["active", "revoked"] }).notNull(),
    purchaseRecordId: text("purchase_record_id").references(
      () => purchaseRecords.id,
    ),
    grantedAt: text("granted_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.readerAccountId, table.workId] }),
    index("purchase_entitlements_account_idx").on(table.readerAccountId),
  ],
);
