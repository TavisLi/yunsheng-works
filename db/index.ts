import { drizzle } from "drizzle-orm/d1";
import { getRequestExecutionContext } from "vinext/shims/request-context";
import * as schema from "./schema";

export type D1Binding = Parameters<typeof drizzle>[0];

export function getDb() {
  const context = getRequestExecutionContext() as
    | { DB?: D1Binding }
    | null;
  if (!context?.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(context.DB, { schema });
}
