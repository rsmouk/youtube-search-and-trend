import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminApiKeysForDisplay,
  getEnvApiKeySuffixes,
  setServerApiKeys,
} from "@/lib/api-keys-server";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const keys = await getAdminApiKeysForDisplay();
  const envKeySuffixes = getEnvApiKeySuffixes();
  return NextResponse.json({ keys, envKeySuffixes });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const keys = Array.isArray(body.keys)
    ? body.keys.filter((k: unknown) => typeof k === "string")
    : [];

  const result = await setServerApiKeys(keys);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: keys.length });
}
