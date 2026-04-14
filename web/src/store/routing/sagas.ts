import { eventChannel } from 'redux-saga';
import { put, take, takeLatest, takeEvery, delay, select } from 'typed-redux-saga';
import { history } from './history';
import { matchRoute, buildUrl, type Route } from './routes';
import type { AppAction } from '../actions';
import type { AppState } from '../state';

function createHistoryChannel() {
  return eventChannel<Route>((emit) =>
    history.listen(({ location }) => {
      emit(matchRoute(location.pathname, location.search));
    })
  );
}

function* syncSearchToUrl() {
  yield* delay(300);
  const { search, activeTag } = yield* select((s: AppState) => s.filters);
  history.replace(buildUrl({ name: 'home', query: { search: search || undefined, tag: activeTag || undefined } }));
}

function* syncTagToUrl(action: Extract<AppAction, { type: '[ui] tag filter selected' }>) {
  const { search } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined, tag: action.payload.tag } }));
}

function* clearTagFromUrl() {
  const { search } = yield* select((s: AppState) => s.filters);
  history.push(buildUrl({ name: 'home', query: { search: search || undefined } }));
}

function* navigateToVideo(action: Extract<AppAction, { type: '[ui] video selected' }>) {
  history.push(`/video/${action.payload.id}`);
}

function* navigateToHome() {
  // Go back if there's a previous entry so filters/scroll restore correctly.
  // Fall back to push when the user arrived via a direct/deep link.
  if (history.index > 0) {
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
  yield* takeEvery('[ui] video selected', navigateToVideo);
  yield* takeEvery('[ui] navigate home', navigateToHome);

  while (true) {
    const route = yield* take(channel);
    yield* put<AppAction>({ type: '[routing] navigated', payload: { route } });
  }
}
