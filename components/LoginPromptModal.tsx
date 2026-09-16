"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";
import { useLocalePath } from "@/lib/use-locale-path";

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
  const { t } = useI18n();
  const lp = useLocalePath();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-stone-200/80 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2
          id="login-prompt-title"
          className="text-center text-lg font-semibold text-stone-800"
        >
          {t("likes.loginTitle")}
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          {t("likes.loginHint")}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={lp("/login")}
            className="rounded-xl bg-stone-800 px-4 py-3 text-center text-sm font-medium text-white hover:bg-stone-700"
            onClick={onClose}
          >
            {t("likes.signIn")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 hover:bg-stone-50"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
