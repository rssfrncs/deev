import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { db } from '../db';
import { videoEvents } from '../events';

const videoInclude = {
  tags: true,
} as const;

// ─── View counter buffer ──────────────────────────────────────────────────────
// Accumulate increments in memory, flush to DB every FLUSH_INTERVAL_MS.
// This avoids one DB write per view — at high traffic, many increments collapse
// into a single UPDATE per video per interval.
// At scale: swap this Map for Redis INCR and the setInterval for a queue worker.

const FLUSH_INTERVAL_MS = 5_000;
const viewBuffer = new Map<string, number>();

async function flushViews() {
  if (viewBuffer.size === 0) return;
  const snapshot = new Map(viewBuffer);
  viewBuffer.clear();

  await Promise.all(
    [...snapshot.entries()].map(async ([id, increment]) => {
      const video = await db.video.update({
        where: { id },
        data: { views: { increment } },
        include: videoInclude,
      });
      videoEvents.emit('video.viewUpdated', { id, views: video.views });
    })
  );
}

setInterval(flushViews, FLUSH_INTERVAL_MS);

function formatVideo(video: { id: string; title: string; thumbnailUrl: string; createdAt: Date; duration: number; views: number; tags: { id: number; name: string }[] }) {
  return {
    ...video,
    tags: video.tags.map((t) => t.name),
  };
}

export const videoRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        search: z.string().optional(),
        tag: z.string().optional(),
        order: z.enum(['asc', 'desc']).default('desc'),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 10, cursor, search, tag, order = 'desc' } = input ?? {};

      const where = {
        ...(search && { title: { contains: search } }),
        ...(tag && { tags: { some: { name: tag } } }),
      };

      const [videos, total] = await Promise.all([
        db.video.findMany({
          where,
          include: videoInclude,
          take: limit + 1, // fetch one extra to know if there's a next page
          cursor: cursor ? { id: cursor } : undefined,
          skip: cursor ? 1 : undefined, // skip the cursor item itself
          orderBy: { createdAt: order },
        }),
        db.video.count({ where }),
      ]);

      const hasNextPage = videos.length > limit;
      if (hasNextPage) videos.pop(); // remove the extra item before returning

      return {
        items: videos.map(formatVideo),
        nextCursor: hasNextPage ? videos[videos.length - 1].id : null,
        total,
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const video = await db.video.findUnique({
        where: { id: input.id },
        include: videoInclude,
      });

      if (!video) throw new Error(`Video not found: ${input.id}`);

      return formatVideo(video);
    }),

  create: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        thumbnailUrl: z.string().url(),
        createdAt: z.string().datetime().optional(),
        duration: z.number().int().positive(),
        views: z.number().int().min(0).default(0),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const { tags, id, createdAt, ...rest } = input;

      const video = await db.video.create({
        data: {
          ...rest,
          id: id ?? crypto.randomUUID(),
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          tags: {
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        },
        include: videoInclude,
      });

      const formatted = formatVideo(video);
      videoEvents.emit('video.added', formatted);
      return formatted;
    }),

  view: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      viewBuffer.set(input.id, (viewBuffer.get(input.id) ?? 0) + 1);
    }),

  onViewUpdated: publicProcedure
    .subscription(async function* () {
      while (true) {
        yield await new Promise<{ id: string; views: number }>((resolve) => {
          videoEvents.once('video.viewUpdated', resolve);
        });
      }
    }),

  onVideoAdded: publicProcedure.subscription(async function* () {
    while (true) {
      yield await new Promise<ReturnType<typeof formatVideo>>((resolve) => {
        videoEvents.once('video.added', resolve);
      });
    }
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        thumbnailUrl: z.string().url().optional(),
        duration: z.number().int().positive().optional(),
        views: z.number().int().min(0).optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tags, ...rest } = input;

      const video = await db.video.update({
        where: { id },
        data: {
          ...rest,
          ...(tags !== undefined && {
            tags: {
              set: [],
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }),
        },
        include: videoInclude,
      });

      return formatVideo(video);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.video.delete({ where: { id: input.id } });
      return { id: input.id };
    }),

  related: publicProcedure
    .input(z.object({ id: z.string(), limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ input }) => {
      const source = await db.video.findUnique({
        where: { id: input.id },
        include: videoInclude,
      });
      if (!source || source.tags.length === 0) return [];

      const tagNames = source.tags.map((t) => t.name);
      const videos = await db.video.findMany({
        where: {
          id: { not: input.id },
          tags: { some: { name: { in: tagNames } } },
        },
        include: videoInclude,
        orderBy: { views: 'desc' },
        take: input.limit,
      });

      return videos.map(formatVideo);
    }),

  topTags: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      const tags = await db.tag.findMany({
        include: { _count: { select: { videos: true } } },
        orderBy: { videos: { _count: 'desc' } },
        take: input?.limit ?? 10,
      });
      return tags.map((t) => ({ name: t.name, count: t._count.videos }));
    }),
});
