"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import {
  createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "البريد أو كلمة المرور غير صحيحة";
  }
  if (lower.includes("email not confirmed")) {
    return "يجب تأكيد بريدك أولاً — راجع صندوق الوارد";
  }
  if (lower.includes("user already registered")) {
    return "هذا البريد مسجّل مسبقاً — جرّب تسجيل الدخول";
  }
  if (lower.includes("password")) {
    return "كلمة المرور ضعيفة — 6 أحرف على الأقل";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      const msg = searchParams.get("msg");
      setError(
        msg
          ? decodeURIComponent(msg)
          : "فشل تسجيل الدخول — تحقق من Supabase و Redirect URLs"
      );
    }
  }, [searchParams]);

  const finishLogin = () => {
    router.refresh();
    router.push("/");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError("Supabase غير مُعد — أضف NEXT_PUBLIC_SUPABASE_URL و ANON_KEY");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          setError(translateAuthError(signUpError.message));
          return;
        }

        if (data.session) {
          setMessage("تم إنشاء الحساب بنجاح");
          finishLogin();
          return;
        }

        setMessage(
          "تم إرسال رابط التأكيد لبريدك — افتحه ثم سجّل الدخول. أو عطّل «Confirm email» من Supabase للاختبار."
        );
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          setError(translateAuthError(signInError.message));
          return;
        }

        if (!data.session) {
          setError("لم يتم إنشاء جلسة — تحقق من تأكيد البريد");
          return;
        }

        finishLogin();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ غير متوقع — تحقق من إعدادات Supabase"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "facebook" | "twitter") => {
    if (!configured) {
      setError("Supabase غير مُعد — أضف متغيرات البيئة في Vercel");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError(translateAuthError(oauthError.message));
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("تعذر بدء تسجيل الدخول — تأكد من تفعيل المزود في Supabase");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل OAuth"
      );
    } finally {
      setLoading(false);
    }
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

          {!configured && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Supabase غير مُعد. أضف في Vercel:
              <code className="mt-1 block text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
              <code className="block text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <button
              type="button"
              disabled={loading || !configured}
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Google
            </button>
            <button
              type="button"
              disabled={loading || !configured}
              onClick={() => handleOAuth("facebook")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Facebook
            </button>
            <button
              type="button"
              disabled={loading || !configured}
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
              disabled={!configured}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100 disabled:opacity-50"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              disabled={!configured}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !configured}
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
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setError("");
              setMessage("");
            }}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-10">
          <div className="h-60 animate-pulse rounded-2xl bg-stone-100" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
