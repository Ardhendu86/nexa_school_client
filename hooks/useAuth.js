import { useSelector, useDispatch } from 'react-redux';
import {
  setUser,
  setRole,
  updateProfile,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthRole,
} from '@/store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectAuthRole);

  return {
    user,
    isAuthenticated,
    setUser: (userData) => dispatch(setUser(userData)),
    setRole: (userRole) => dispatch(setRole(userRole)),
    updateProfile: (profileData) => dispatch(updateProfile(profileData)),
    logout: () => dispatch(logout()),
    isAdmin: role === 'ADMIN',
    isTeacher: role === 'TEACHER',
    isStudent: role === 'STUDENT',
  };
}

export default useAuth;
