"use client";

interface SearchFormProps {
  keyword: string;
  loading: boolean;
  onKeywordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchForm({
  keyword,
  loading,
  onKeywordChange,
  onSubmit,
}: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="ابحث عن كلمة... مثل: برمجة، طبخ، تصميم"
            className="w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-stone-800 shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-stone-300 focus:ring-4 focus:ring-stone-100"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="rounded-2xl bg-stone-800 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "جاري البحث..." : "بحث"}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-stone-400">
        يعرض القنوات التي نشرت فيديوهات حديثة (آخر 30 يوم) تحتوي على كلمتك
      </p>
    </form>
  );
}
