import type { Video } from './state';

export type AppAction =
  | { type: '[ui] search input changed'; payload: { search: string } }
  | { type: '[ui] tag filter selected'; payload: { tag: string } }
  | { type: '[ui] tag filter cleared' }
  | { type: '[ui] load more requested' }
  | { type: '[ui] create video submitted'; payload: { title: string; duration: number } }
  | { type: '[effects] videos fetch started' }
  | { type: '[effects] videos fetched'; payload: { items: Video[]; nextCursor: string | null } }
  | { type: '[effects] more videos fetched'; payload: { items: Video[]; nextCursor: string | null } }
  | { type: '[effects] video created'; payload: { video: Video } }
  | { type: '[effects] video received via subscription'; payload: { video: Video } };
