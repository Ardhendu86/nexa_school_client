export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_TEACHERS: 'manage_teachers',
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_ATTENDANCE: 'manage_attendance',
  MANAGE_EXAMS: 'manage_exams',
  MANAGE_FEES: 'manage_fees',
  VIEW_REPORTS: 'view_reports',
};

export function hasPermission(userRole, permission) {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'TEACHER') {
    return [PERMISSIONS.MANAGE_ATTENDANCE, PERMISSIONS.MANAGE_EXAMS].includes(permission);
  }
  return false;
}
