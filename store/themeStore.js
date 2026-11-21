import { useSelector, useDispatch } from 'react-redux';
import {
  toggleTheme,
  setTheme,
  selectCurrentTheme,
} from './slices/themeSlice';

export function useThemeStore() {
  const dispatch = useDispatch();
  const theme = useSelector(selectCurrentTheme);

  return {
    theme,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (newTheme) => dispatch(setTheme(newTheme)),
  };
}

export {
  toggleTheme,
  setTheme,
  selectCurrentTheme,
};

export default useThemeStore;
