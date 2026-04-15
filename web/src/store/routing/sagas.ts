import { eventChannel } from 'redux-saga';
import { put, take, takeLatest, takeEvery, delay, select } from 'typed-redux-saga';
import { history } from './history';
import { matchRoute, buildUrl, type Route } from './routes';
import type { AppAction } from '../actions';
import type { AppState } from '../state';

type HistoryEvent = {
  route: Route;
  historyAction: 'push' | 'pop' | 'replace';
};

function createHistoryChannel() {
  return eventChannel<HistoryEvent>((emit) =>
    history.listen(({ location, action }) => {
      emit({
        route: matchRoute(location.pathname, location.search),
        historyAction: action.toLowerCase() as 'push' | 'pop' | 'replace',
      });
    })
  );
}

function sortParam(sortOrder: string) {
  return sortOrder !== 'desc' ? sortOrder : undefined;
}

function* syncSearchToUrl() {
  yield* delay(300);
  const { search, activeTag, sortOrder } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined, tag: activeTag || undefined, sort: sortParam(sortOrder) } }));
}

function* syncTagToUrl() {
  const { search, activeTags, sortOrder } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined, tags: activeTags.length ? activeTags : undefined, sort: sortParam(sortOrder) } }));
}

function* clearTagFromUrl() {
  const { search, sortOrder } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined, sort: sortParam(sortOrder) } }));
}

function* syncSortToUrl(action: Extract<AppAction, { type: '[ui] sort order changed' }>) {
  const { search, activeTag } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined, tag: activeTag || undefined, sort: sortParam(action.payload.sortOrder) } }));
}

function* navigateHomeWithTag(action: Extract<AppAction, { type: '[ui] detail tag filter selected' }>) {
  const { search, sortOrder } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined, tags: [action.payload.tag], sort: sortParam(sortOrder) } }));
}

function navigateToVideo(action: Extract<AppAction, { type: '[ui] video selected' }>) {
  // Store fromApp so navigateToHome knows it can safely go back
  history.push(`/video/${action.payload.id}`, { fromApp: true });
}

function navigateToHome() {
  // If we navigated here from within the app, go back so URL (sort, tag, search)
  // is restored correctly. Fall back to push for direct/deep-link arrivals.
  const state = history.location.state as { fromApp?: boolean } | null;
  if (state?.fromApp) {
    history.back();
  } else {
    history.push('/');
  }
}

export function* routingSaga() {
  const channel = createHistoryChannel();

  yield* takeLatest('[ui] search input changed', syncSearchToUrl);
  yield* takeEvery('[ui] tag filter selected', syncTagToUrl);
  yield* takeEvery('[ui] tag filter cleared', clearTagFromUrl);
  yield* takeEvery('[ui] sort order changed', syncSortToUrl);
  yield* takeEvery('[ui] detail tag filter selected', navigateHomeWithTag);
  yield* takeEvery('[ui] video selected', navigateToVideo);
  yield* takeEvery('[ui] navigate home', navigateToHome);

  while (true) {
    const { route, historyAction } = yield* take(channel);
    yield* put<AppAction>({ type: '[routing] navigated', payload: { route, historyAction } });
  }
}
