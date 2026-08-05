import { expiredReaderSessionCookie, revokeSession } from "../../../../db/auth";
import { safeRelativeReturnPath } from "../../../chatgpt-auth";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.match(/(?:^|;\s*)yunsheng_session=([^;]+)/)?.[1];
  if (token) await revokeSession(token);

  const returnTo = safeRelativeReturnPath(new URL(request.url).searchParams.get("return_to") ?? "/");
  return new Response(null, {
    status: 303,
    headers: {
      location: returnTo,
      "set-cookie": expiredReaderSessionCookie(),
    },
  });
}
