import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; status: number; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Admin access required" };
  }

  return { ok: true, userId: user.id };
}
