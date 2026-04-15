import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import { appRouter, AppRouter } from './appRouter';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const server = Fastify({ logger: true });

async function main() {
  await server.register(cors, { origin: true });

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>);

  await server.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server listening on port ${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
