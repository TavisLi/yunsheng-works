import { getReaderIdentity } from "../../reader-identity";
import { getPublicReading, getPublicWork } from "../../content/works";
import { isStoredReaderState } from "../../read/reader-state";
import {
  getReaderState,
  mergeReaderState,
  provisionReaderAccount,
} from "../../../db/readers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identity = await getReaderIdentity();
  if (!identity) {
    return Response.json({ error: "需要登入讀者帳號" }, { status: 401 });
  }

  const workSlug = new URL(request.url).searchParams.get("work") ?? "";
  const work = getPublicWork(workSlug);
  if (!work) {
    return Response.json({ error: "找不到作品" }, { status: 404 });
  }

  const account = await provisionReaderAccount(identity);
  const state = await getReaderState(account.id, work.id);
  return Response.json({ state });
}

export async function PUT(request: Request) {
  const identity = await getReaderIdentity();
  if (!identity) {
    return Response.json({ error: "需要登入讀者帳號" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "閱讀狀態格式不正確" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "閱讀狀態格式不正確" }, { status: 400 });
  }
  const { workSlug, state } = payload as {
    workSlug?: unknown;
    state?: unknown;
  };
  if (typeof workSlug !== "string" || !isStoredReaderState(state)) {
    return Response.json({ error: "閱讀狀態格式不正確" }, { status: 400 });
  }

  const work = getPublicWork(workSlug);
  const chapter = getPublicReading(workSlug, state.chapterSlug);
  if (!work || !chapter) {
    return Response.json({ error: "找不到作品或章節" }, { status: 404 });
  }
  if (
    !chapter.paragraphs ||
    (chapter.availability !== "public" && chapter.availability !== "preview")
  ) {
    return Response.json({ error: "章節尚未開放閱讀" }, { status: 403 });
  }

  const account = await provisionReaderAccount(identity);
  const merged = await mergeReaderState({
    readerAccountId: account.id,
    workId: work.id,
    workSlug: work.slug,
    chapterId: chapter.id,
    state,
  });

  return Response.json({ state: merged, synced: true });
}
