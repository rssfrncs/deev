import { call, put, select, takeLatest, takeLeading, takeEvery, cancelled } from 'typed-redux-saga';
import { trpc } from '../../trpc';
import type { AppAction } from '../actions';
import type { AppState } from '../state';

function* fetchVideosSaga(action: Extract<AppAction, { type: '[routing] navigated' }>) {
  if (action.payload.route.name !== 'home') return;

  const controller = new AbortController();
  const { search, tag } = action.payload.route.query;

  yield* put<AppAction>({ type: '[effects] videos fetch started' });

  try {
    const result = yield* call(() =>
      trpc.video.list.query(
        { limit: 10, search: search || undefined, tag: tag || undefined },
        { signal: controller.signal }
      )
    );
    yield* put<AppAction>({ type: '[effects] videos fetched', payload: result });
  } finally {
    if (yield* cancelled()) {
      controller.abort();
    }
  }
}

function* fetchVideoDetailSaga(action: Extract<AppAction, { type: '[routing] navigated' }>) {
  if (action.payload.route.name !== 'video') return;

  const controller = new AbortController();
  const { id } = action.payload.route.params;

  yield* put<AppAction>({ type: '[effects] video detail fetch started' });

  try {
    const video = yield* call(() =>
      trpc.video.byId.query({ id }, { signal: controller.signal })
    );
    yield* put<AppAction>({ type: '[effects] video detail fetched', payload: { video } });
  } finally {
    if (yield* cancelled()) {
      controller.abort();
    }
  }
}

function* loadMoreSaga() {
  const controller = new AbortController();
  const { nextCursor } = yield* select((state: AppState) => state.videos);
  const { search, activeTag } = yield* select((state: AppState) => state.filters);

  if (!nextCursor) return;

  try {
    const result = yield* call(() =>
      trpc.video.list.query(
        { limit: 10, cursor: nextCursor, search: search || undefined, tag: activeTag || undefined },
        { signal: controller.signal }
      )
    );
    yield* put<AppAction>({ type: '[effects] more videos fetched', payload: result });
  } finally {
    if (yield* cancelled()) {
      controller.abort();
    }
  }
}

function* createVideoSaga(action: Extract<AppAction, { type: '[ui] create video submitted' }>) {
  const video = yield* call(() =>
    trpc.video.create.mutate({
      title: action.payload.title,
      thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
      duration: action.payload.duration,
    })
  );
  yield* put<AppAction>({ type: '[effects] video created', payload: { video } });
}

export function* watchSubscription() {
  yield* call(
    () =>
      new Promise<never>(() => {
        trpc.video.onVideoAdded.subscribe(undefined, {
          onData: (video) => {
            import('../index').then(({ store }) => {
              store.dispatch({ type: '[effects] video received via subscription', payload: { video } });
            });
          },
        });
      })
  );
}

export function* videosSaga() {
  yield* takeLatest('[routing] navigated', fetchVideosSaga);
  yield* takeLatest('[routing] navigated', fetchVideoDetailSaga);
  yield* takeLeading('[ui] load more requested', loadMoreSaga);
  yield* takeEvery('[ui] create video submitted', createVideoSaga);
}
