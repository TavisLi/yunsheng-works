import { drizzle } from "drizzle-orm/d1";
import { getRequestExecutionContext } from "vinext/shims/request-context";
import * as schema from "./schema";

export type D1Binding = Parameters<typeof drizzle>[0];

type RuntimeBindings = {
  DB?: D1Binding;
  AUTH_PASSWORD_PEPPER?: string;
};

export function getRuntimeBindings() {
  const context = getRequestExecutionContext() as RuntimeBindings | null;
  return {
    DB: context?.DB,
    AUTH_PASSWORD_PEPPER:
      context?.AUTH_PASSWORD_PEPPER ?? process.env.AUTH_PASSWORD_PEPPER,
  } as RuntimeBindings;
}

export function getDb() {
  const context = getRuntimeBindings();
  if (!context?.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(context.DB, { schema });
}
