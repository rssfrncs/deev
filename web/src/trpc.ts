import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import type { AppRouter } from 'veed-api/src/appRouter';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({ url: 'http://localhost:3000/trpc' }),
      false: httpBatchLink({ url: 'http://localhost:3000/trpc' }),
    }),
  ],
});
