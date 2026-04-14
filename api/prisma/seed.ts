import { PrismaClient } from '@prisma/client';
import data from '../seed.json';

const db = new PrismaClient();

async function main() {
  for (const video of data.videos) {
    await db.video.upsert({
      where: { id: video.id },
      create: {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnail_url,
        createdAt: new Date(video.created_at),
        duration: video.duration,
        views: video.views,
        tags: {
          connectOrCreate: video.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      update: {},
    });
  }

  console.log(`Seeded ${data.videos.length} videos`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
