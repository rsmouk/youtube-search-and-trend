"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("كلمة المرور 6 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Supabase غير مُعد");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("تم تحديث كلمة المرور بنجاح");
        setPassword("");
        setConfirm("");
      }
    } catch {
      setError("فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md flex-1 px-4 py-10">
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md flex-1 px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-50 text-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-800">حسابي</h1>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <p className="text-sm font-medium text-stone-700">
              تغيير كلمة المرور
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور الجديدة"
              minLength={6}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="تأكيد كلمة المرور"
              minLength={6}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
