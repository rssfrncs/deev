import { useCallback, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { VideoCard } from '../components/VideoCard';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { items, nextCursor, total, loading, error } = useAppSelector((s) => s.videos);
  const { search, activeTag, sortOrder } = useAppSelector((s) => s.filters);
  const topTags = useAppSelector((s) => s.topTags);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const handleLoadMore = useCallback(() => {
    if (nextCursor) dispatch({ type: '[ui] load more requested' });
  }, [nextCursor, dispatch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) handleLoadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Toolbar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <label htmlFor="video-search" className="sr-only">Search videos</label>
          <input
            id="video-search"
            className="w-full rounded-xl bg-input-bg pl-10 pr-4 py-2.5 text-sm text-ink placeholder-ink-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-veed-green transition-colors"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => dispatch({ type: '[ui] search input changed', payload: { search: e.target.value } })}
          />
        </div>

        {total > 0 && (
          <span className="self-center text-xs text-ink-tertiary whitespace-nowrap" aria-live="polite" aria-atomic="true">
            {total.toLocaleString()} videos
          </span>
        )}

        <button
          onClick={() => dispatch({ type: '[ui] sort order changed', payload: { sortOrder: sortOrder === 'desc' ? 'asc' : 'desc' } })}
          aria-label={`Sort by ${sortOrder === 'desc' ? 'oldest' : 'newest'} first`}
          className="flex items-center gap-1.5 rounded-pill bg-surface border border-border text-ink-secondary text-sm px-4 py-2.5 hover:bg-surface-hover transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green"
        >
          {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
        </button>
      </div>

      {/* Tag filter row — always reserve the row height to prevent layout shift */}
      {topTags.length === 0 ? (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex-shrink-0 h-7 rounded-pill bg-surface"
              style={{ width: `${60 + (i % 3) * 20}px` }}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {/* If active tag isn't in the top list, show it first so it's always dismissible */}
          {activeTag && !topTags.some((t) => t.name === activeTag) && (
            <button
              onClick={() => dispatch({ type: '[ui] tag filter cleared' })}
              aria-pressed={true}
              aria-label={`Remove ${activeTag} filter`}
              className="animate-tag-enter flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-pill border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green bg-veed-green border-veed-green text-ink"
            >
              {activeTag}
              <span aria-hidden="true" className="opacity-60 text-[10px]">✕</span>
            </button>
          )}
          {topTags.map((tag, i) => {
            const isActive = activeTag === tag.name;
            return (
              <button
                key={tag.name}
                onClick={() => dispatch(
                  isActive
                    ? { type: '[ui] tag filter cleared' }
                    : { type: '[ui] tag filter selected', payload: { tag: tag.name } }
                )}
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Remove' : 'Filter by'} ${tag.name}`}
                className={`animate-tag-enter flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-pill border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green
                  ${isActive
                    ? 'bg-veed-green border-veed-green text-ink'
                    : 'bg-surface border-border text-ink-secondary hover:border-veed-green hover:text-ink'
                  }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {tag.name}
                <span aria-hidden="true" className="opacity-50 text-[10px]">{tag.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((video) => <VideoCard key={video.id} video={video} />)}
          </div>
          {nextCursor && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
        </>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-card bg-surface" />
              <div className="mt-2.5 h-4 w-3/4 rounded bg-surface" />
              <div className="mt-1.5 h-3 w-1/3 rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-ink-secondary text-sm">{error}</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-ink-secondary text-sm">No videos found.</p>
        </div>
      )}
    </div>
  );
}
