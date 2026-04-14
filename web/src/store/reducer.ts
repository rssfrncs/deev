import { produce } from 'immer';
import { initialState, type AppState } from './state';
import type { AppAction } from './actions';

export function rootReducer(state: AppState = initialState, action: AppAction): AppState {
  return produce(state, (draft) => {
    switch (action.type) {
      case '[routing] navigated':
        draft.route = action.payload.route;
        // Sync filters from URL so back/forward and deep links restore state
        if (action.payload.route.name === 'home') {
          draft.filters.search = action.payload.route.query.search ?? '';
          draft.filters.activeTag = action.payload.route.query.tag ?? '';
        }
        break;

      case '[ui] search input changed':
        // Update immediately so the input stays responsive while URL sync debounces
        draft.filters.search = action.payload.search;
        break;

      case '[ui] tag filter selected':
        draft.filters.activeTag = action.payload.tag;
        break;

      case '[ui] tag filter cleared':
        draft.filters.activeTag = '';
        break;

      case '[effects] videos fetch started':
        draft.videos.loading = true;
        draft.videos.items = [];
        draft.videos.nextCursor = null;
        break;

      case '[effects] videos fetched':
        draft.videos.loading = false;
        draft.videos.items = action.payload.items;
        draft.videos.nextCursor = action.payload.nextCursor;
        break;

      case '[effects] more videos fetched':
        draft.videos.items.push(...action.payload.items);
        draft.videos.nextCursor = action.payload.nextCursor;
        break;

      case '[effects] video created':
        draft.videos.items.unshift(action.payload.video);
        break;

      case '[effects] video received via subscription':
        if (!draft.videos.items.some((v) => v.id === action.payload.video.id)) {
          draft.videos.items.unshift(action.payload.video);
        }
        break;

      case '[effects] video detail fetch started':
        draft.videoDetail.loading = true;
        draft.videoDetail.video = null;
        break;

      case '[effects] video detail fetched':
        draft.videoDetail.loading = false;
        draft.videoDetail.video = action.payload.video;
        break;
    }
  });
}
