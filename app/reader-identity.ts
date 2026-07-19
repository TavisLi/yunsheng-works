import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "./chatgpt-auth";

export type ReaderIdentity = {
  externalId: string;
  email: string;
  displayName: string;
};

export async function getReaderIdentity(): Promise<ReaderIdentity | null> {
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
  return chatGPTSignInPath(returnTo);
}

export function readerSignOutPath(returnTo = "/") {
  return chatGPTSignOutPath(returnTo);
}
