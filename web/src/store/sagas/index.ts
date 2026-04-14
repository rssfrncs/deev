import { all, call } from 'typed-redux-saga';
import { videosSaga, watchSubscription } from './videos';
import { routingSaga } from '../routing/sagas';

export function* rootSaga() {
  yield* all([
    call(videosSaga),
    call(watchSubscription),
    call(routingSaga),
  ]);
}
