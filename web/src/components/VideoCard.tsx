import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAppDispatch } from '../store/hooks';

const HlsPlayerCard = lazy(() => import('../HlsPlayer').then(m => ({ default: m.HlsPlayerCard })));
import { formatDuration, formatViews, formatDate } from '../utils/format';
import type { Video } from '../store/state';

export function VideoCard({ video }: { video: Video }) {
  const dispatch = useAppDispatch();
  const [hovered, setHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // onPointerLeave is unreliable at fast pointer speeds — the browser can
  // "teleport" between elements without firing leave on the previous one.
  // Instead: when hovered, attach a document-level pointermove listener and
  // check containment on every move. Guaranteed to clear hovered state.
  useEffect(() => {
    if (!hovered) {
      setVideoReady(false);
      return;
    }
    function onMove(e: PointerEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setHovered(false);
      }
    }
    document.addEventListener('pointermove', onMove);
    return () => document.removeEventListener('pointermove', onMove);
  }, [hovered]);

  return (
    <div
      ref={cardRef}
      className="group"
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 200px' }}
      onPointerEnter={() => setHovered(true)}
    >
      <button
        className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green rounded-card"
        onClick={() => dispatch({ type: '[ui] video selected', payload: { id: video.id } })}
        aria-label={`Watch ${video.title}`}
      >
        <div className="relative rounded-card overflow-hidden bg-surface aspect-video">
          {/* Thumbnail — always present as base layer */}
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 ${hovered ? 'scale-105' : 'group-hover:scale-105'}`}
          />
          <span className="absolute bottom-2 right-2 bg-ink/70 text-canvas text-xs font-medium px-1.5 py-0.5 rounded" aria-hidden="true">
            {formatDuration(video.duration)}
          </span>

          {/* Video layer — mounts on hover, fades in once ready */}
          {hovered && (
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: videoReady ? 1 : 0 }}
            >
              <Suspense fallback={null}>
                <HlsPlayerCard onReady={() => setVideoReady(true)} />
              </Suspense>
            </div>
          )}
        </div>
        <div className="mt-2.5 px-0.5">
          <p className="text-sm font-medium text-ink truncate group-hover:text-ink/70 transition-colors">
            {video.title}
          </p>
          <p className="mt-1 text-xs text-ink-tertiary">
            {formatDate(video.createdAt)} · {formatViews(video.views)} views
          </p>
        </div>
      </button>
      {video.tags.length > 0 && (
        <div className="mt-1.5 px-0.5 flex flex-wrap gap-1">
          {video.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => dispatch({ type: '[ui] tag filter selected', payload: { tag } })}
              aria-label={`Filter by ${tag}`}
              className="text-xs text-ink-secondary bg-surface hover:bg-surface-hover px-2 py-0.5 rounded-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veed-green"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
