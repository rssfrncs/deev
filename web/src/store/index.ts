import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from './reducer';
import { rootSaga } from './sagas/index';
import { matchRoute } from './routing/routes';

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

// Dispatch initial route after all sagas have started their watchers
store.dispatch({
  type: '[routing] navigated' as const,
  payload: {
    route: matchRoute(window.location.pathname, window.location.search),
    historyAction: 'push' as const,
  },
});
