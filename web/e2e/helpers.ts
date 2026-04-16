import type { APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001';

export async function createVideo(
  request: APIRequestContext,
  data: { title: string; duration: number; tags?: string[] },
) {
  const res = await request.post(`${API}/trpc/video.create?batch=1`, {
    data: {
      '0': {
        title: data.title,
        duration: data.duration,
        thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(data.title)}/300/200`,
        tags: data.tags ?? [],
      },
    },
  });
  const [result] = await res.json() as [{ result: { data: unknown } }];
  return result.result.data as { id: string; title: string };
}
