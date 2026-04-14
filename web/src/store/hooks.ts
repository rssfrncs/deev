import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppState } from './state';
import type { AppAction } from './actions';
import type { Dispatch } from 'redux';

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<Dispatch<AppAction>>();
