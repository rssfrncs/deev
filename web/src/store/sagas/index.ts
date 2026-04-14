import { all, call, put } from 'typed-redux-saga';
import type { AppAction } from '../actions';
import { videosSaga, watchSubscription } from './videos';
import { trpc } from '../../trpc';

function* bootstrapSaga() {
  yield* put<AppAction>({ type: '[effects] videos fetch started' });
  const result = yield* call(() => trpc.video.list.query({ limit: 10 }));
  yield* put<AppAction>({ type: '[effects] videos fetched', payload: result });
}

export function* rootSaga() {
  yield* all([
    call(bootstrapSaga),
    call(videosSaga),
    call(watchSubscription),
  ]);
}
