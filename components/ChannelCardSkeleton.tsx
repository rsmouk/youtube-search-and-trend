export default function ChannelCardSkeleton() {
  return (
    <article className="flex h-full w-full min-h-[196px] flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="flex flex-1 items-start gap-4 p-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-stone-200" />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-stone-200" />
          <div className="h-4 w-2/5 animate-pulse rounded-lg bg-stone-100" />
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-stone-100 bg-stone-50/60 p-3">
        <div className="flex items-center gap-2">
          <div className="h-9 min-h-[36px] flex-1 animate-pulse rounded-xl bg-stone-200" />
          <div className="h-9 min-h-[36px] flex-1 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-stone-100" />
        </div>
      </div>
    </article>
  );
}
