import { useSelector, useDispatch } from 'react-redux';
import {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  openMobileSidebar,
  closeMobileSidebar,
  selectSidebarOpen,
  selectMobileSidebarOpen,
} from './slices/sidebarSlice';

export function useSidebarStore() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectSidebarOpen);
  const isMobileOpen = useSelector(selectMobileSidebarOpen);

  return {
    isOpen,
    isMobileOpen,
    toggleSidebar: () => dispatch(toggleSidebar()),
    setSidebarOpen: (val) => dispatch(setSidebarOpen(val)),
    toggleMobileSidebar: () => dispatch(toggleMobileSidebar()),
    openMobileSidebar: () => dispatch(openMobileSidebar()),
    closeMobileSidebar: () => dispatch(closeMobileSidebar()),
  };
}

export {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  openMobileSidebar,
  closeMobileSidebar,
  selectSidebarOpen,
  selectMobileSidebarOpen,
};

export default useSidebarStore;
