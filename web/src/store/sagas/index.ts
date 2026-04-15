import { all, call, put, take, takeEvery } from 'typed-redux-saga';
import type { AppAction } from '../actions';
import { videosSaga, watchSubscription, watchViewUpdates } from './videos';
import { routingSaga } from '../routing/sagas';
import { trpc } from '../../trpc';

function* fetchTopTagsSaga() {
  try {
    const tags = yield* call(() => trpc.video.topTags.query());
    yield* put<AppAction>({ type: '[effects] top tags fetched', payload: { tags } });
  } catch {
    // Non-critical — tags are decorative, don't crash the app if this fails
  }
}

// Wait for the first video list to land before fetching tags — avoids
// contending with the critical-path video fetch on initial page load.
function* fetchTagsAfterFirstLoad() {
  yield* take('[effects] videos fetched');
  yield* call(fetchTopTagsSaga);
}

function* watchTopTagsRefresh() {
  yield* takeEvery('[effects] video created', fetchTopTagsSaga);
  yield* takeEvery('[effects] video received via subscription', fetchTopTagsSaga);
}

export function* rootSaga() {
  yield* all([
    call(videosSaga),
    call(watchSubscription),
    call(watchViewUpdates),
    call(routingSaga),
    call(fetchTagsAfterFirstLoad),
    call(watchTopTagsRefresh),
  ]);
}
