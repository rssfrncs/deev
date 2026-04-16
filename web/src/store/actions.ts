import type { Video } from './state';
import type { Route } from './routing/routes';

export type AppAction =
  // UI — user intent
  | { type: '[ui] search input changed'; payload: { search: string } }
  | { type: '[ui] tag filter selected'; payload: { tag: string } }
  | { type: '[ui] tag filter cleared' }
  | { type: '[ui] sort order changed'; payload: { sortOrder: 'asc' | 'desc' } }
  | { type: '[ui] load more requested' }
  | { type: '[ui] create video submitted'; payload: { title: string; duration: number; tags: string[]; tagInput: string } }
  | { type: '[ui] create form title changed'; payload: { title: string } }
  | { type: '[ui] create form duration changed'; payload: { duration: string } }
  | { type: '[ui] create form tag added'; payload: { tag: string } }
  | { type: '[ui] create form tag removed'; payload: { tag: string } }
  | { type: '[ui] create form tag input changed'; payload: { tagInput: string } }
  | { type: '[ui] create form reset' }
  | { type: '[ui] video selected'; payload: { id: string } }
  | { type: '[ui] navigate home' }
  | { type: '[ui] detail tag filter selected'; payload: { tag: string } }
  // Routing — location changes
  | { type: '[routing] navigated'; payload: { route: Route; historyAction: 'push' | 'pop' | 'replace' } }
  // Effects — async results
  | { type: '[effects] videos fetch started'; payload: { preserveItems: boolean } }
  | { type: '[effects] videos fetched'; payload: { items: Video[]; nextCursor: string | null; total: number } }
  | { type: '[effects] more videos fetched'; payload: { items: Video[]; nextCursor: string | null; total: number } }
  | { type: '[effects] video created'; payload: { video: Video } }
  | { type: '[effects] video received via subscription'; payload: { video: Video } }
  | { type: '[effects] videos fetch failed'; payload: { error: string } }
  | { type: '[effects] create video failed'; payload: { error: string } }
  | { type: '[effects] video detail fetch started'; payload: { id: string } }
  | { type: '[effects] video detail fetched'; payload: { video: Video } }
  | { type: '[effects] video detail fetch failed'; payload: { error: string } }
  | { type: '[effects] top tags fetched'; payload: { tags: { name: string; count: number }[] } }
  | { type: '[effects] video view count updated'; payload: { id: string; views: number } }
  | { type: '[effects] related videos fetched'; payload: { videos: Video[] } };
