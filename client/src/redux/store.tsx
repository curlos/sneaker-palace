import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  FLUSH, PAUSE,
  PERSIST, persistReducer, persistStore, PURGE,
  REGISTER, REHYDRATE
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { baseAPI } from '../api/api'
// Import API slices to ensure they're registered
import '../api/shoesApi'
import '../api/ratingsApi'
import '../api/cartApi'
import userReducer from './userRedux'

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
}

const rootReducer = combineReducers({ 
  user: userReducer,
  [baseAPI.reducerPath]: baseAPI.reducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseAPI.middleware),
})

export type RootState = ReturnType<typeof rootReducer>

export let persistor = persistStore(store)