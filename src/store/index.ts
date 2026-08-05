import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { useDispatch, useSelector } from 'react-redux';
import sessionReducer from './sessionSlice';

/**
 * `redux-persist` reaches for `localStorage` at import time, which does not
 * exist while Next renders on the server. This no-op keeps SSR quiet; the real
 * storage takes over in the browser.
 */
const createNoopStorage = () => ({
  getItem: () => Promise.resolve<string | null>(null),
  setItem: (_key: string, value: string) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
});

const storage =
  typeof window === 'undefined' ? createNoopStorage() : createWebStorage('local');

const rootReducer = combineReducers({
  session: sessionReducer,
});

const persistedReducer = persistReducer(
  { key: 'deepdoc', version: 1, storage, whitelist: ['session'] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist dispatches non-serializable actions by design.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
