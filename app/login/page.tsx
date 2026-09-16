"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("تحقق من بريدك لتأكيد الحساب");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        window.location.href = "/";
      }
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "facebook" | "twitter") => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) setError(oauthError.message);
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md flex-1 px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-stone-800">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            سجّل لحفظ قنواتك في السحابة
          </p>

          <div className="mt-6 space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Google
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("facebook")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Facebook
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("twitter")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              X (Twitter)
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs text-stone-400">أو بالبريد</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-stone-800 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              {loading
                ? "جاري..."
                : mode === "login"
                  ? "دخول"
                  : "إنشاء حساب"}
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

          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "login" ? "signup" : "login"))
            }
            className="mt-4 w-full text-center text-sm text-stone-500 hover:text-stone-700"
          >
            {mode === "login"
              ? "ليس لديك حساب؟ أنشئ واحداً"
              : "لديك حساب؟ سجّل الدخول"}
          </button>

          <Link
            href="/"
            className="mt-4 block text-center text-xs text-stone-400 hover:text-stone-600"
          >
            العودة للرئيسية
          </Link>
        </div>
      </main>
    </>
  );
}
