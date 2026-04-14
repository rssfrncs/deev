import { useEffect, useState } from 'react';
import { trpc } from './trpc';

type VideoList = Awaited<ReturnType<typeof trpc.video.list.query>>;

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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await trpc.video.create.mutate({
      title,
      thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
      duration: Number(duration),
    });
    setTitle('');
    setDuration('');
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
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
        disabled={submitting}
        className="rounded bg-white text-gray-950 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add video'}
      </button>
    </form>
  );
}

export default function App() {
  const [data, setData] = useState<VideoList | null>(null);

  useEffect(() => {
    trpc.video.list.query({ limit: 20 }).then(setData);

    const sub = trpc.video.onVideoAdded.subscribe(undefined, {
      onData: (video) => setData((prev) =>
        prev ? { ...prev, items: [video, ...prev.items] } : prev
      ),
    });

    return () => sub.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">VEED</h1>
      </header>
      <main className="px-6 py-8">
        <CreateVideoForm />
        {!data ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((video) => (
              <div key={video.id} className="group cursor-pointer rounded-lg overflow-hidden bg-gray-900">
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
                  <p className="mt-1 text-xs text-gray-500">
                    {formatViews(video.views)} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
