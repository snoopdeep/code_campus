// src/redux/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import themeReducer from './theme/themeSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Combine your reducers
const rootReducer = combineReducers({
  user: userReducer,
  theme:themeReducer 
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  version: 1
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create the persistor
export const persistor = persistStore(store);
