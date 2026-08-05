import {
  ReaderAuthError,
  consumeAuthRateLimit,
  readerLocaleCookie,
  loginPasswordReader,
  readerSessionCookie,
  type PasswordIdentityKind,
} from "../../../../db/auth";

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return error("請提供有效的登入資料", 400);
  }
  if (!isMethod(input.method) || typeof input.identifier !== "string" || typeof input.password !== "string") {
    return error("請提供完整的登入資料", 400);
  }

  try {
    if (!(await withinRateLimit(request, input.identifier))) {
      return error("嘗試次數過多，請稍後再試", 429);
    }
    const result = await loginPasswordReader({
      method: input.method,
      identifier: input.identifier,
      password: input.password,
    });
    const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
    headers.append("set-cookie", readerSessionCookie(result.sessionToken));
    headers.append("set-cookie", readerLocaleCookie(result.account.preferredLocale));
    return new Response(
      JSON.stringify({
        account: {
          displayName: result.account.displayName,
          locale: result.account.preferredLocale,
          marketingOptIn: result.account.marketingOptIn,
          region: result.account.region,
        },
      }),
      {
        headers,
      },
    );
  } catch (cause) {
    if (cause instanceof ReaderAuthError) return error(cause.message, 401);
    throw cause;
  }
}

async function withinRateLimit(request: Request, identifier: string) {
  const source = request.headers.get("cf-connecting-ip") ?? "unknown-source";
  const [sourceBudget, identifierBudget] = await Promise.all([
    consumeAuthRateLimit("login", `source:${source}`, 30),
    consumeAuthRateLimit("login", `identifier:${identifier.trim().toLowerCase()}`, 10),
  ]);
  return sourceBudget.allowed && identifierBudget.allowed;
}

function isMethod(value: unknown): value is PasswordIdentityKind {
  return value === "email" || value === "phone";
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
