export default function ChannelCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="flex items-start gap-4 p-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-stone-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded-lg bg-stone-200" />
          <div className="h-3 w-1/3 animate-pulse rounded-lg bg-stone-100" />
          <div className="h-3 w-full animate-pulse rounded-lg bg-stone-100" />
          <div className="h-3 w-5/6 animate-pulse rounded-lg bg-stone-100" />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-stone-100 bg-stone-50/60 p-3">
        <div className="h-8 animate-pulse rounded-xl bg-stone-200" />
        <div className="h-8 animate-pulse rounded-xl bg-stone-100" />
        <div className="h-8 animate-pulse rounded-xl bg-stone-100" />
      </div>
    </article>
  );
}
