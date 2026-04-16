import { useState, useEffect, lazy, Suspense } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';

const HlsPlayerDetail = lazy(() => import('../components/HlsPlayer').then(m => ({ default: m.HlsPlayerDetail })));
import { formatDuration, formatViews } from '../utils/format';
import type { Video } from '../store/state';

export function VideoDetailPage() {
  const dispatch = useAppDispatch();
  const { id, loading, error, relatedIds } = useAppSelector((s) => s.videoDetail);
  const video = useAppSelector((s) => id ? s.videoCache[id] ?? null : null);
  const relatedVideos = useAppSelector((s) =>
    relatedIds.map((rid) => s.videoCache[rid]).filter(Boolean) as Video[]
  );
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => { setVideoReady(false); }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button
        onClick={() => dispatch({ type: '[ui] navigate home' })}
        className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green rounded"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      {loading ? (
        <div className="flex flex-col md:flex-row gap-6 animate-pulse">
          <div className="flex-[2]">
            <div className="aspect-video rounded-card bg-surface" />
          </div>
          <div className="flex-1 space-y-4 pt-1">
            <div className="h-6 w-3/4 rounded bg-surface" />
            <div className="h-4 w-1/3 rounded bg-surface" />
            <div className="flex gap-2 mt-1">
              <div className="h-6 w-14 rounded-full bg-surface" />
              <div className="h-6 w-14 rounded-full bg-surface" />
            </div>
            <div className="pt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-32 aspect-video rounded-lg bg-surface" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-full rounded bg-surface" />
                    <div className="h-3 w-2/3 rounded bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <p className="text-ink-secondary text-sm">{error}</p>
      ) : !video ? (
        <p className="text-ink-secondary text-sm">Video not found.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left: player only */}
          <div className="flex-[2] min-w-0 w-full">
            <div
              className="relative rounded-card overflow-hidden bg-surface w-full"
              style={{ aspectRatio: '16/9', maxHeight: 'calc(100svh - 12rem)' }}
            >
              <img src={video.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: videoReady ? 1 : 0 }}
              >
                <Suspense fallback={null}>
                  <HlsPlayerDetail onReady={() => setVideoReady(true)} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Right: details + related */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-semibold text-ink">{video.title}</h1>
              <p className="mt-1 text-sm text-ink-tertiary">
                {formatViews(video.views)} views · {formatDuration(video.duration)}
              </p>
              {video.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        dispatch({ type: '[ui] detail tag filter selected', payload: { tag } });
                      }}
                      aria-label={`Filter by ${tag}`}
                      className="text-xs bg-surface hover:bg-surface-hover text-ink-secondary px-3 py-1.5 rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {relatedVideos.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wide mb-3">Related</h2>
                <div className="flex flex-col gap-3">
                  {relatedVideos.map((rv) => (
                    <button
                      key={rv.id}
                      onClick={() => dispatch({ type: '[ui] video selected', payload: { id: rv.id } })}
                      aria-label={`Watch ${rv.title}`}
                      className="flex gap-3 items-start text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green rounded-lg"
                    >
                      <div className="relative flex-shrink-0 w-32 rounded-lg overflow-hidden bg-surface aspect-video">
                        <img src={rv.thumbnailUrl} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span aria-hidden="true" className="absolute bottom-1 right-1 bg-ink/70 text-canvas text-[10px] font-medium px-1 py-0.5 rounded">
                          {formatDuration(rv.duration)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-ink truncate group-hover:text-ink/70 transition-colors">{rv.title}</p>
                        <p className="mt-0.5 text-xs text-ink-tertiary">{formatViews(rv.views)} views</p>
                        {rv.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {rv.tags.map((tag) => (
                              <span key={tag} className="text-[10px] text-ink-secondary bg-surface px-1.5 py-0.5 rounded-pill">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
