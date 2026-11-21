import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  searchModalOpen: false,
  activeNotification: null,
  unreadNotificationsCount: 3,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchModalOpen: (state, action) => {
      state.searchModalOpen = Boolean(action.payload);
    },
    setActiveNotification: (state, action) => {
      state.activeNotification = action.payload;
    },
    clearActiveNotification: (state) => {
      state.activeNotification = null;
    },
    decrementNotificationsCount: (state) => {
      if (state.unreadNotificationsCount > 0) {
        state.unreadNotificationsCount -= 1;
      }
    },
    resetNotificationsCount: (state) => {
      state.unreadNotificationsCount = 0;
    },
  },
});

export const {
  setSearchQuery,
  setSearchModalOpen,
  setActiveNotification,
  clearActiveNotification,
  decrementNotificationsCount,
  resetNotificationsCount,
} = uiSlice.actions;

export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectSearchModalOpen = (state) => state.ui.searchModalOpen;
export const selectUnreadNotificationsCount = (state) => state.ui.unreadNotificationsCount;
export const selectActiveNotification = (state) => state.ui.activeNotification;

export default uiSlice.reducer;
