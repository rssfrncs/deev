import { useState } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import type { Video } from './store/state';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  const dispatch = useAppDispatch();
  return (
    <header className="sticky top-0 z-10 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: '[ui] navigate home' })}
          className="text-ink hover:opacity-70 transition-opacity"
          aria-label="VEED home"
        >
          <svg viewBox="0 0 115 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5">
            <path d="m32.626.367-8.802 21.589a3.284 3.284 0 0 1-3.041 2.043h-8.895a3.283 3.283 0 0 1-3.04-2.04L.02.367A.266.266 0 0 1 .266 0h8.91c.222 0 .421.138.5.346l6.672 17.795L22.967.348a.533.533 0 0 1 .5-.348h8.912c.189 0 .318.192.247.367Zm.813-.1v23.466c0 .147.12.267.267.267h24.463c.146 0 .266-.12.266-.267v-5.851a.267.267 0 0 0-.266-.267h-15.92a.267.267 0 0 1-.266-.267v-1.927c0-.146.12-.266.267-.266h15.557c.147 0 .267-.12.267-.267V9.082a.267.267 0 0 0-.267-.267H42.25a.267.267 0 0 1-.267-.267V6.652c0-.147.12-.267.267-.267h15.919c.146 0 .266-.12.266-.267V.267A.267.267 0 0 0 58.17 0H33.706a.267.267 0 0 0-.267.267Zm26.12 0v23.466c0 .147.12.267.268.267H84.29c.146 0 .266-.12.266-.267v-5.851a.268.268 0 0 0-.266-.267H68.37a.267.267 0 0 1-.266-.267v-1.927c0-.146.12-.266.267-.266h15.557c.147 0 .267-.12.267-.267V9.082a.267.267 0 0 0-.267-.267H68.37a.267.267 0 0 1-.267-.267V6.652c0-.147.12-.267.267-.267H84.29c.146 0 .266-.12.266-.267V.267A.268.268 0 0 0 84.29 0H59.826a.267.267 0 0 0-.266.267Zm26.123 23.466c0 .147.12.267.266.267h16.76c3.668 0 6.627-.951 8.891-2.868 2.264-1.902 3.396-4.95 3.396-9.147s-1.132-7.245-3.396-9.148C109.335.95 106.377 0 102.708 0h-16.76a.267.267 0 0 0-.266.267v23.466Zm8.81-6.163a.267.267 0 0 1-.267-.267V6.697c0-.147.12-.267.266-.267h6.255c1.932 0 3.366.423 4.302 1.268.936.845 1.403 2.279 1.403 4.287s-.467 3.472-1.403 4.317c-.936.846-2.37 1.268-4.302 1.268h-6.255Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
}

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateVideoForm() {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const dispatch = useAppDispatch();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: '[ui] create video submitted', payload: { title, duration: Number(duration) } });
    setTitle('');
    setDuration('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 rounded-lg bg-surface border border-border px-4 py-2.5 text-sm text-ink placeholder-ink-tertiary focus:outline-none focus:border-border-strong transition-colors"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-32 rounded-lg bg-surface border border-border px-4 py-2.5 text-sm text-ink placeholder-ink-tertiary focus:outline-none focus:border-border-strong transition-colors"
        placeholder="Duration (s)"
        type="number"
        min="1"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        required
      />
      <button
        type="submit"
        className="flex items-center gap-2 rounded-pill bg-veed-green hover:bg-veed-green-hover text-ink font-medium text-sm px-5 py-2.5 transition-colors whitespace-nowrap"
      >
        + Add video
      </button>
    </form>
  );
}

// ─── Video card ───────────────────────────────────────────────────────────────

function VideoCard({ video }: { video: Video }) {
  const dispatch = useAppDispatch();
  return (
    <div
      className="group cursor-pointer"
      onClick={() => dispatch({ type: '[ui] video selected', payload: { id: video.id } })}
    >
      <div className="relative rounded-card overflow-hidden bg-surface aspect-video">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 bg-ink/70 text-canvas text-xs font-medium px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2 group-hover:text-ink/70 transition-colors">
          {video.title}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-ink-tertiary">{formatViews(video.views)} views</p>
          {video.tags[0] && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: '[ui] tag filter selected', payload: { tag: video.tags[0] } });
              }}
              className="text-xs text-ink-secondary bg-surface hover:bg-surface-hover px-2 py-0.5 rounded-pill transition-colors"
            >
              {video.tags[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

function HomePage() {
  const dispatch = useAppDispatch();
  const { items, nextCursor, loading } = useAppSelector((s) => s.videos);
  const { search, activeTag } = useAppSelector((s) => s.filters);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Toolbar */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="w-full rounded-lg bg-surface border border-border pl-10 pr-4 py-2.5 text-sm text-ink placeholder-ink-tertiary focus:outline-none focus:border-border-strong transition-colors"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => dispatch({ type: '[ui] search input changed', payload: { search: e.target.value } })}
          />
        </div>

        {activeTag && (
          <button
            onClick={() => dispatch({ type: '[ui] tag filter cleared' })}
            className="flex items-center gap-1.5 rounded-pill bg-veed-green-subtle text-ink text-sm font-medium px-4 py-2.5 hover:bg-veed-green/20 transition-colors"
          >
            {activeTag}
            <span className="text-ink-secondary">✕</span>
          </button>
        )}

        <CreateVideoForm />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-card bg-surface" />
              <div className="mt-2.5 h-4 w-3/4 rounded bg-surface" />
              <div className="mt-1.5 h-3 w-1/3 rounded bg-surface" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-secondary text-sm">No videos found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {nextCursor && (
            <div className="mt-10 text-center">
              <button
                onClick={() => dispatch({ type: '[ui] load more requested' })}
                className="rounded-pill border border-border text-sm font-medium text-ink-secondary hover:bg-surface px-6 py-2.5 transition-colors"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Video detail page ────────────────────────────────────────────────────────

function VideoDetailPage() {
  const dispatch = useAppDispatch();
  const { video, loading } = useAppSelector((s) => s.videoDetail);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button
        onClick={() => dispatch({ type: '[ui] navigate home' })}
        className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink mb-8 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="aspect-video rounded-card bg-surface" />
          <div className="h-6 w-2/3 rounded bg-surface" />
          <div className="h-4 w-1/4 rounded bg-surface" />
        </div>
      ) : !video ? (
        <p className="text-ink-secondary text-sm">Video not found.</p>
      ) : (
        <div>
          <div className="rounded-card overflow-hidden aspect-video bg-surface">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
          </div>

          <div className="mt-5">
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
                      dispatch({ type: '[ui] tag filter selected', payload: { tag } });
                      dispatch({ type: '[ui] navigate home' });
                    }}
                    className="text-xs bg-surface hover:bg-surface-hover text-ink-secondary px-3 py-1.5 rounded-pill transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const route = useAppSelector((s) => s.route);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      {route.name === 'home' && <HomePage />}
      {route.name === 'video' && <VideoDetailPage />}
      {route.name === 'not-found' && (
        <div className="text-center py-20">
          <p className="text-ink-secondary text-sm">Page not found.</p>
        </div>
      )}
    </div>
  );
}
