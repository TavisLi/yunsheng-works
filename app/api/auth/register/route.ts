import {
  ReaderAuthError,
  consumeAuthRateLimit,
  readerLocaleCookie,
  readerSessionCookie,
  registerPasswordReader,
  type AccountRegion,
  type PasswordIdentityKind,
  type ReaderLocale,
} from "../../../../db/auth";
import { provisionReaderAccount } from "../../../../db/readers";
import { getReaderIdentity } from "../../../reader-identity";

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return error("請提供有效的註冊資料", 400);
  }

  if (
    !isMethod(input.method) ||
    typeof input.identifier !== "string" ||
    typeof input.password !== "string" ||
    typeof input.displayName !== "string" ||
    !isRegion(input.region) ||
    !isLocale(input.locale)
  ) {
    return error("請提供完整的註冊資料", 400);
  }

  try {
    if (!(await withinRateLimit(request, input.identifier))) {
      return error("嘗試次數過多，請稍後再試", 429);
    }
    const currentIdentity = await getReaderIdentity();
    const currentAccount = currentIdentity
      ? await provisionReaderAccount(currentIdentity)
      : undefined;
    const result = await registerPasswordReader({
      method: input.method,
      identifier: input.identifier,
      password: input.password,
      displayName: input.displayName,
      region: input.region,
      locale: input.locale,
      marketingOptOut: input.marketingOptOut === true,
      linkReaderAccountId: currentAccount?.id,
    });
    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
    headers.append("set-cookie", readerSessionCookie(result.sessionToken));
    headers.append("set-cookie", readerLocaleCookie(result.account.locale));
    return new Response(JSON.stringify({ account: result.account }), { status: 201, headers });
  } catch (cause) {
    if (cause instanceof ReaderAuthError) {
      return error(
        cause.code === "identifier-exists"
          ? "暫時無法建立帳號，請檢查資料或聯繫客服"
          : cause.message,
        400,
      );
    }
    throw cause;
  }
}

async function withinRateLimit(request: Request, identifier: string) {
  const source = request.headers.get("cf-connecting-ip") ?? "unknown-source";
  const [sourceBudget, identifierBudget] = await Promise.all([
    consumeAuthRateLimit("register", `source:${source}`, 20),
    consumeAuthRateLimit("register", `identifier:${identifier.trim().toLowerCase()}`, 10),
  ]);
  return sourceBudget.allowed && identifierBudget.allowed;
}

function isMethod(value: unknown): value is PasswordIdentityKind {
  return value === "email" || value === "phone";
}

function isRegion(value: unknown): value is AccountRegion {
  return value === "cn" || value === "global";
}

function isLocale(value: unknown): value is ReaderLocale {
  return value === "zh-Hant" || value === "zh-Hans";
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
