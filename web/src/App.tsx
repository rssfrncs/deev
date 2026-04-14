import { useState } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import type { Video } from './store/state';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views: number) {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

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
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-28 rounded bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
        placeholder="Duration (s)"
        type="number"
        min="1"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        required
      />
      <button
        type="submit"
        className="rounded bg-white text-gray-950 px-4 py-2 text-sm font-medium"
      >
        Add video
      </button>
    </form>
  );
}

function VideoCard({ video, onTagClick }: { video: Video; onTagClick: (tag: string) => void }) {
  return (
    <div className="group cursor-pointer rounded-lg overflow-hidden bg-gray-900">
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full aspect-video object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-white text-gray-200">
          {video.title}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-500">{formatViews(video.views)} views</p>
          {video.tags[0] && (
            <button
              onClick={() => onTagClick(video.tags[0])}
              className="text-xs text-gray-600 hover:text-gray-400"
            >
              {video.tags[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const { items, nextCursor, loading } = useAppSelector((s) => s.videos);
  const { search, activeTag } = useAppSelector((s) => s.filters);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">VEED</h1>
      </header>
      <main className="px-6 py-8">
        <CreateVideoForm />

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-600"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => dispatch({ type: '[ui] search input changed', payload: { search: e.target.value } })}
          />
          {activeTag && (
            <button
              onClick={() => dispatch({ type: '[ui] tag filter cleared' })}
              className="flex items-center gap-1 rounded bg-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
            >
              {activeTag} ✕
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No videos found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onTagClick={(tag) => dispatch({ type: '[ui] tag filter selected', payload: { tag } })}
                />
              ))}
            </div>
            {nextCursor && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => dispatch({ type: '[ui] load more requested' })}
                  className="rounded bg-gray-800 px-6 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
