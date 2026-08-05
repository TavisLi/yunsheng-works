import { cookies } from "next/headers";
import { getSessionReaderIdentity } from "../db/auth";
import { chatGPTSignOutPath, getChatGPTUser, safeRelativeReturnPath } from "./chatgpt-auth";

export type ReaderIdentity = {
  readerAccountId?: string;
  externalId: string;
  email: string | null;
  displayName: string;
};

export async function getReaderIdentity(): Promise<ReaderIdentity | null> {
  const sessionToken = (await cookies()).get("yunsheng_session")?.value;
  if (sessionToken) {
    const sessionIdentity = await getSessionReaderIdentity(sessionToken);
    if (sessionIdentity) return sessionIdentity;
  }

  const user = await getChatGPTUser();
  if (!user) return null;

  const email = user.email.trim().toLowerCase();
  return {
    externalId: `chatgpt:${email}`,
    email,
    displayName: user.displayName,
  };
}

export function readerSignInPath(returnTo: string) {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  const locale = safeReturnTo.match(/^\/(zh-Hant|zh-Hans)(?:\/|$)/)?.[1];
  const signInPath = locale ? `/${locale}/account/sign-in` : "/account/sign-in";
  return `${signInPath}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function readerSignOutPath(returnTo = "/") {
  return chatGPTSignOutPath(returnTo);
}
