import type { Video } from './state';
import type { Route } from './routing/routes';

export type AppAction =
  // UI — user intent
  | { type: '[ui] search input changed'; payload: { search: string } }
  | { type: '[ui] tag filter selected'; payload: { tag: string } }
  | { type: '[ui] tag filter cleared' }
  | { type: '[ui] load more requested' }
  | { type: '[ui] create video submitted'; payload: { title: string; duration: number } }
  | { type: '[ui] video selected'; payload: { id: string } }
  | { type: '[ui] navigate home' }
  // Routing — location changes
  | { type: '[routing] navigated'; payload: { route: Route } }
  // Effects — async results
  | { type: '[effects] videos fetch started' }
  | { type: '[effects] videos fetched'; payload: { items: Video[]; nextCursor: string | null } }
  | { type: '[effects] more videos fetched'; payload: { items: Video[]; nextCursor: string | null } }
  | { type: '[effects] video created'; payload: { video: Video } }
  | { type: '[effects] video received via subscription'; payload: { video: Video } }
  | { type: '[effects] video detail fetch started' }
  | { type: '[effects] video detail fetched'; payload: { video: Video } };
