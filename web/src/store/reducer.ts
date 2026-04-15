import { produce } from 'immer';
import { initialState, type AppState } from './state';
import type { AppAction } from './actions';

export function rootReducer(state: AppState = initialState, action: AppAction): AppState {
  return produce(state, (draft) => {
    switch (action.type) {
      case '[routing] navigated':
        draft.route = action.payload.route;
        if (action.payload.route.name === 'home') {
          draft.filters.search = action.payload.route.query.search ?? '';
          draft.filters.activeTags = action.payload.route.query.tags ?? [];
          draft.filters.sortOrder = action.payload.route.query.sort === 'asc' ? 'asc' : 'desc';
        }
        break;

      case '[ui] search input changed':
        draft.filters.search = action.payload.search;
        break;

      case '[ui] tag filter selected': {
        const tag = action.payload.tag;
        const idx = draft.filters.activeTags.indexOf(tag);
        if (idx === -1) {
          draft.filters.activeTags.push(tag);
        } else {
          draft.filters.activeTags.splice(idx, 1);
        }
        break;
      }

      case '[ui] detail tag filter selected':
        draft.filters.activeTags = [action.payload.tag];
        break;

      case '[ui] tag filter cleared':
        draft.filters.activeTags = [];
        break;

      case '[ui] sort order changed':
        draft.filters.sortOrder = action.payload.sortOrder;
        break;

      case '[ui] create video submitted':
        draft.videos.creating = true;
        break;

      case '[effects] videos fetch started':
        if (!action.payload.preserveItems) {
          draft.videos.loading = true;
          draft.videos.error = null;
          draft.videos.items = [];
          draft.videos.nextCursor = null;
        }
        break;

      case '[effects] videos fetched':
        draft.videos.loading = false;
        draft.videos.items = action.payload.items;
        draft.videos.nextCursor = action.payload.nextCursor;
        draft.videos.total = action.payload.total;
        for (const video of action.payload.items) {
          draft.videoCache[video.id] = video;
        }
        break;

      case '[effects] videos fetch failed':
        draft.videos.loading = false;
        draft.videos.error = action.payload.error;
        break;

      case '[effects] more videos fetched':
        draft.videos.items.push(...action.payload.items);
        draft.videos.nextCursor = action.payload.nextCursor;
        draft.videos.total = action.payload.total;
        for (const video of action.payload.items) {
          draft.videoCache[video.id] = video;
        }
        break;

      case '[effects] video created':
        draft.videos.creating = false;
        draft.videoCache[action.payload.video.id] = action.payload.video;
        if (!draft.videos.items.some((v) => v.id === action.payload.video.id)) {
          draft.videos.items.unshift(action.payload.video);
          draft.videos.total += 1;
        }
        break;

      case '[effects] create video failed':
        draft.videos.creating = false;
        break;

      case '[effects] video received via subscription': {
        const { video } = action.payload;
        draft.videoCache[video.id] = video;
        const { search, activeTags } = draft.filters;
        const matchesSearch = !search || video.title.toLowerCase().includes(search.toLowerCase());
        const matchesTag = activeTags.length === 0 || video.tags.some((t) => activeTags.includes(t));
        if (matchesSearch && matchesTag && !draft.videos.items.some((v) => v.id === video.id)) {
          draft.videos.items.unshift(video);
          draft.videos.total += 1;
        }
        break;
      }

      case '[effects] video detail fetch started':
        draft.videoDetail.id = action.payload.id;
        draft.videoDetail.loading = true;
        draft.videoDetail.error = null;
        draft.videoDetail.relatedIds = [];
        break;

      case '[effects] video detail fetched':
        draft.videoDetail.loading = false;
        draft.videoCache[action.payload.video.id] = action.payload.video;
        break;

      case '[effects] video detail fetch failed':
        draft.videoDetail.loading = false;
        draft.videoDetail.error = action.payload.error;
        break;

      case '[effects] related videos fetched':
        for (const video of action.payload.videos) {
          draft.videoCache[video.id] = video;
        }
        draft.videoDetail.relatedIds = action.payload.videos.map((v) => v.id);
        break;

      case '[effects] top tags fetched':
        draft.topTags = action.payload.tags;
        break;

      case '[effects] video view count updated': {
        const { id, views } = action.payload;
        if (draft.videoCache[id]) draft.videoCache[id].views = views;
        const listItem = draft.videos.items.find((v) => v.id === id);
        if (listItem) listItem.views = views;
        break;
      }
    }
  });
}
