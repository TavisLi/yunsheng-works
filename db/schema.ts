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
    externalIdentity: text("external_identity").notNull(),
    normalizedEmail: text("normalized_email").notNull(),
    displayName: text("display_name").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("reader_accounts_external_identity_idx").on(
      table.externalIdentity,
    ),
    uniqueIndex("reader_accounts_email_idx").on(table.normalizedEmail),
  ],
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
