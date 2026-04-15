import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import type { AppRouter } from 'veed-api/src/appRouter';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({ url: `${API_URL}/trpc` }),
      false: httpBatchLink({ url: `${API_URL}/trpc` }),
    }),
  ],
});
