import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getServerApiKeys } from "@/lib/api-keys-server";
import { getQuotaStats } from "@/lib/youtube-quota";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const keys = await getServerApiKeys();
  const stats = await getQuotaStats(keys);
  return NextResponse.json(stats);
}
