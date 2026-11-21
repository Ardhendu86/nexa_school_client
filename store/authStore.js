import { useSelector, useDispatch } from 'react-redux';
import {
  setUser,
  logout,
  setRole,
  updateProfile,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthRole,
  selectAuthLoading,
} from './slices/authSlice';

export function useAuthStore() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    setUser: (newUser) => dispatch(setUser(newUser)),
    setRole: (role) => dispatch(setRole(role)),
    updateProfile: (data) => dispatch(updateProfile(data)),
    logout: () => dispatch(logout()),
  };
}

export {
  setUser,
  logout,
  setRole,
  updateProfile,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthRole,
  selectAuthLoading,
};

export default useAuthStore;
