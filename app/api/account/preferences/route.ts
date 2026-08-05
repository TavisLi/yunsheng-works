import { getReaderIdentity } from "../../../reader-identity";
import {
  provisionReaderAccount,
  updateReaderAccountPreferences,
} from "../../../../db/readers";

export async function POST(request: Request) {
  const identity = await getReaderIdentity();
  if (!identity) return Response.json({ error: "需要登入讀者帳號" }, { status: 401 });

  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "請提供有效的偏好設定" }, { status: 400 });
  }

  const preferredLocale =
    input.preferredLocale === "zh-Hant" || input.preferredLocale === "zh-Hans"
      ? input.preferredLocale
      : undefined;
  const marketingOptIn =
    typeof input.marketingOptIn === "boolean" ? input.marketingOptIn : undefined;
  if (!preferredLocale && marketingOptIn === undefined) {
    return Response.json({ error: "請提供有效的偏好設定" }, { status: 400 });
  }

  const account = await provisionReaderAccount(identity);
  const updated = await updateReaderAccountPreferences(account.id, {
    preferredLocale,
    marketingOptIn,
  });
  if (!updated) return Response.json({ error: "讀者帳號不存在" }, { status: 404 });

  const headers = new Headers({ "content-type": "application/json; charset=utf-8" });
  if (preferredLocale) {
    headers.append(
      "set-cookie",
      `yunsheng_locale_v1=${preferredLocale}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`,
    );
  }
  return new Response(
    JSON.stringify({
      account: {
        preferredLocale: updated.preferredLocale,
        marketingOptIn: updated.marketingOptIn,
      },
    }),
    { headers },
  );
}
