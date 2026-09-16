import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAdminApiKeysForDisplay,
  setServerApiKeys,
} from "@/lib/api-keys-server";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const keys = await getAdminApiKeysForDisplay();
  return NextResponse.json({ keys });
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
