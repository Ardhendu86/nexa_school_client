import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sidebarReducer from './slices/sidebarSlice';
import themeReducer from './slices/themeSlice';
import uiReducer from './slices/uiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      sidebar: sidebarReducer,
      theme: themeReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = makeStore();

export default store;
