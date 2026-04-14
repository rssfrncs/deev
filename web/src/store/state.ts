import type { trpc } from '../trpc';
import type { Route } from './routing/routes';

type VideoList = Awaited<ReturnType<typeof trpc.video.list.query>>;
export type Video = VideoList['items'][number];

export type VideosState = {
  items: Video[];
  nextCursor: string | null;
  loading: boolean;
};

export type FiltersState = {
  search: string;
  activeTag: string;
};

export type VideoDetailState = {
  video: Video | null;
  loading: boolean;
};

export type AppState = {
  route: Route;
  videos: VideosState;
  filters: FiltersState;
  videoDetail: VideoDetailState;
};

export const initialState: AppState = {
  route: { name: 'home', query: {} },
  videos: {
    items: [],
    nextCursor: null,
    loading: false,
  },
  filters: {
    search: '',
    activeTag: '',
  },
  videoDetail: {
    video: null,
    loading: false,
  },
};
