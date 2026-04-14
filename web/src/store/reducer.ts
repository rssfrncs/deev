import { produce } from 'immer';
import { initialState, type AppState } from './state';
import type { AppAction } from './actions';

export function rootReducer(state: AppState = initialState, action: AppAction): AppState {
  return produce(state, (draft) => {
    switch (action.type) {
      case '[ui] search input changed':
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
    }
  });
}
