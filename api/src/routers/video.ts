import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { db } from '../db';
import { videoEvents } from '../events';

const videoInclude = {
  tags: true,
} as const;

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
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(), // video id of the last item on the previous page
        tag: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { limit = 20, cursor, tag } = input ?? {};

      const videos = await db.video.findMany({
        where: tag ? { tags: { some: { name: tag } } } : undefined,
        include: videoInclude,
        take: limit + 1, // fetch one extra to know if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      const hasNextPage = videos.length > limit;
      if (hasNextPage) videos.pop(); // remove the extra item before returning

      return {
        items: videos.map(formatVideo),
        nextCursor: hasNextPage ? videos[videos.length - 1].id : null,
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
});
