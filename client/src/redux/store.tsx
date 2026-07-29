import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from './reduxPersistStorage';
import { baseAPI } from '../api/api';
// Import API slices to ensure they're registered
import '../api/shoesApi';
import '../api/ratingsApi';
import '../api/cartApi';
import '../api/userApi';
import userReducer from './userRedux';

const persistConfig = {
	key: 'root',
	version: 1,
	storage,
	// RTK Query's own cache (queries/mutations/tag bookkeeping) is internal
	// implementation detail, not user data — persisting it across sessions/versions
	// risks rehydrating a stale internal shape into a newer RTK Query engine and
	// crashing its tag-invalidation logic. Only `user` (auth state) needs to persist.
	blacklist: [baseAPI.reducerPath],
};

const rootReducer = combineReducers({
	user: userReducer,
	[baseAPI.reducerPath]: baseAPI.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(baseAPI.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;

export const persistor = persistStore(store);
