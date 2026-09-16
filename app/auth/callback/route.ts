import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, isValidLocale } from "@/lib/i18n";
import { localePath } from "@/lib/seo";
import { NextResponse } from "next/server";

function loginPath(next: string | null): string {
  if (next) {
    const seg = next.split("/").filter(Boolean)[0];
    if (seg && isValidLocale(seg)) {
      return localePath(seg, "/login");
    }
  }
  return localePath(DEFAULT_LOCALE, "/login");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? localePath(DEFAULT_LOCALE, "/");
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(
      `${origin}${loginPath(next)}?error=auth&msg=${encodeURIComponent(authError)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}${loginPath(next)}?error=auth&msg=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}${loginPath(next)}?error=auth`);
}
