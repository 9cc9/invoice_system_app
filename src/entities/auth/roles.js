/**
 * 用户角色常量（与后端 UserRole 枚举一致）
 */

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
};

export const ROLE_HOME_ROUTES = {
  [USER_ROLES.STUDENT]: '/student/home',
  [USER_ROLES.TEACHER]: '/teacher/home',
};

export const getHomeRouteByRole = (role) => ROLE_HOME_ROUTES[role] ?? '/login';
