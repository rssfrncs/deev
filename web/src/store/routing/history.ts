import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

// Let the browser save and restore scroll position on back/forward
window.history.scrollRestoration = 'auto';
