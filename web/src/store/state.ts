import type { trpc } from '../trpc';

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

export type AppState = {
  videos: VideosState;
  filters: FiltersState;
};

export const initialState: AppState = {
  videos: {
    items: [],
    nextCursor: null,
    loading: false,
  },
  filters: {
    search: '',
    activeTag: '',
  },
};
