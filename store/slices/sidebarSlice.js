import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: true,
  isMobileOpen: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isOpen = Boolean(action.payload);
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    openMobileSidebar: (state) => {
      state.isMobileOpen = true;
    },
    closeMobileSidebar: (state) => {
      state.isMobileOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  openMobileSidebar,
  closeMobileSidebar,
} = sidebarSlice.actions;

export const selectSidebarOpen = (state) => state.sidebar.isOpen;
export const selectMobileSidebarOpen = (state) => state.sidebar.isMobileOpen;

export default sidebarSlice.reducer;
