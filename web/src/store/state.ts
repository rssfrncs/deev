import type { trpc } from '../trpc';
import type { Route } from './routing/routes';

type VideoList = Awaited<ReturnType<typeof trpc.video.list.query>>;
export type Video = VideoList['items'][number];

export type VideosState = {
  items: Video[];
  nextCursor: string | null;
  total: number;
  loading: boolean;
  creating: boolean;
  createError: string | null;
  error: string | null;
};

export type FiltersState = {
  search: string;
  activeTags: string[];
  sortOrder: 'asc' | 'desc';
};

export type VideoDetailState = {
  id: string | null;
  loading: boolean;
  error: string | null;
  relatedIds: string[];
};

export type Tag = { name: string; count: number };

export type AppState = {
  route: Route;
  videos: VideosState;
  videoCache: Record<string, Video>;
  filters: FiltersState;
  videoDetail: VideoDetailState;
  topTags: Tag[];
};

export const initialState: AppState = {
  route: { name: 'home', query: {} },
  videos: {
    items: [],
    nextCursor: null,
    total: 0,
    loading: false,
    creating: false,
    createError: null,
    error: null,
  },
  filters: {
    search: '',
    activeTags: [],
    sortOrder: 'desc',
  },
  videoCache: {},
  videoDetail: {
    id: null,
    loading: false,
    error: null,
    relatedIds: [],
  },
  topTags: [],
};
