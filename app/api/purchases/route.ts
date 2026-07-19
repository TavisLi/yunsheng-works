import { getReaderIdentity } from "../../reader-identity";
import {
  listPurchaseRecords,
  provisionReaderAccount,
} from "../../../db/readers";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getReaderIdentity();
  if (!identity) {
    return Response.json({ error: "需要登入讀者帳號" }, { status: 401 });
  }

  const account = await provisionReaderAccount(identity);
  const purchases = await listPurchaseRecords(account.id);
  return Response.json({ purchases });
}
