import { buffers, eventChannel } from 'redux-saga';
import { call, put, select, take, takeLatest, takeLeading, cancelled } from 'typed-redux-saga';
import { trpc } from '../../trpc';
import type { AppAction } from '../actions';
import type { AppState } from '../state';
import type { Video } from '../state';

function recordVideoViewSaga(action: Extract<AppAction, { type: '[routing] navigated' }>) {
  if (action.payload.route.name !== 'video') return;
  const { id } = action.payload.route.params;
  trpc.video.view.mutate({ id }).catch(() => {});
}
 
function createViewUpdateChannel() {
  return eventChannel<{ id: string; views: number }>((emit) => {
    const subscription = trpc.video.onViewUpdated.subscribe(undefined, { onData: emit });
    return () => subscription.unsubscribe();
  }, buffers.expanding());
}

export function* watchViewUpdates() {
  const channel = createViewUpdateChannel();
  try {
    while (true) {
      const update = yield* take(channel);
      yield* put<AppAction>({ type: '[effects] video view count updated', payload: update });
    }
  } finally {
    channel.close();
  }
}

const DEFAULT_LIMIT = 10;

function* fetchVideosSaga(action: Extract<AppAction, { type: '[routing] navigated' }>) {
  if (action.payload.route.name !== 'home') return;

  const controller = new AbortController();
  const { search, tag, sort } = action.payload.route.query;
  const order = sort === 'asc' ? 'asc' as const : 'desc' as const;
  const preserveItems = action.payload.historyAction === 'pop';

  yield* put<AppAction>({ type: '[effects] videos fetch started', payload: { preserveItems } });

  try {
    const result = yield* call(() =>
      trpc.video.list.query(
        { limit: DEFAULT_LIMIT, search: search || undefined, tag: tag || undefined, order },
        { signal: controller.signal }
      )
    );
    yield* put<AppAction>({ type: '[effects] videos fetched', payload: result });
  } catch (err) {
    if (!(err instanceof Error && err.name === 'AbortError')) {
      const message = err instanceof Error ? err.message : 'Failed to load videos';
      yield* put<AppAction>({ type: '[effects] videos fetch failed', payload: { error: message } });
    }
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

  yield* put<AppAction>({ type: '[effects] video detail fetch started', payload: { id } });

  try {
    const [video, related] = yield* call(() =>
      Promise.all([
        trpc.video.byId.query({ id }, { signal: controller.signal }),
        trpc.video.related.query({ id }, { signal: controller.signal }),
      ])
    );
    yield* put<AppAction>({ type: '[effects] video detail fetched', payload: { video } });
    yield* put<AppAction>({ type: '[effects] related videos fetched', payload: { videos: related } });
  } catch (err) {
    if (!(err instanceof Error && err.name === 'AbortError')) {
      const message = err instanceof Error ? err.message : 'Failed to load video';
      yield* put<AppAction>({ type: '[effects] video detail fetch failed', payload: { error: message } });
    }
  } finally {
    if (yield* cancelled()) {
      controller.abort();
    }
  }
}

function* loadMoreSaga() {
  const controller = new AbortController();
  const { nextCursor } = yield* select((state: AppState) => state.videos);
  const { search, activeTag, sortOrder } = yield* select((state: AppState) => state.filters);

  if (!nextCursor) return;

  try {
    const result = yield* call(() =>
      trpc.video.list.query(
        { limit: DEFAULT_LIMIT, cursor: nextCursor, search: search || undefined, tag: activeTag || undefined, order: sortOrder },
        { signal: controller.signal }
      )
    );
    yield* put<AppAction>({ type: '[effects] more videos fetched', payload: result });
  } catch {
    // Silent failure — sentinel will re-trigger on next scroll
  } finally {
    if (yield* cancelled()) {
      controller.abort();
    }
  }
}

function* createVideoSaga(action: Extract<AppAction, { type: '[ui] create video submitted' }>) {
  try {
    const video = yield* call(() =>
      trpc.video.create.mutate({
        title: action.payload.title,
        thumbnailUrl: `https://picsum.photos/seed/${Math.random()}/300/200`,
        duration: action.payload.duration,
        tags: action.payload.tags,
      })
    );
    yield* put<AppAction>({ type: '[effects] video created', payload: { video } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create video';
    yield* put<AppAction>({ type: '[effects] create video failed', payload: { error: message } });
  }
}

function createSubscriptionChannel() {
  return eventChannel<Video>((emit) => {
    const subscription = trpc.video.onVideoAdded.subscribe(undefined, {
      onData: emit,
    });
    return () => subscription.unsubscribe();
  }, buffers.expanding());
}

export function* watchSubscription() {
  const channel = createSubscriptionChannel();
  try {
    while (true) {
      const video = yield* take(channel);
      yield* put<AppAction>({ type: '[effects] video received via subscription', payload: { video } });
    }
  } finally {
    channel.close();
  }
}

export function* videosSaga() {
  yield* takeLatest('[routing] navigated', fetchVideosSaga);
  yield* takeLatest('[routing] navigated', fetchVideoDetailSaga);
  yield* takeLatest('[routing] navigated', recordVideoViewSaga);
  yield* takeLeading('[ui] load more requested', loadMoreSaga);
  yield* takeLeading('[ui] create video submitted', createVideoSaga);
}
