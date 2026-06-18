/**
 * 用户角色常量（与后端 UserRole 枚举一致）
 */

export const USER_ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};

/** 登录入口模式：上传发票 / 处理发票 */
export const LOGIN_MODES = {
  UPLOAD: 'UPLOAD',
  PROCESS: 'PROCESS',
};

export const UPLOAD_ROLES = [USER_ROLES.STUDENT, USER_ROLES.TEACHER];
export const PROCESS_ROLES = [USER_ROLES.ADMIN];

export const ROLE_HOME_ROUTES = {
  [USER_ROLES.STUDENT]: '/student/home',
  [USER_ROLES.TEACHER]: '/student/home',
  [USER_ROLES.ADMIN]: '/admin/home',
};

export const getHomeRouteByRole = (role) => ROLE_HOME_ROUTES[role] ?? '/login';

export const canAccessLoginMode = (role, mode) => {
  if (mode === LOGIN_MODES.UPLOAD) {
    return UPLOAD_ROLES.includes(role);
  }
  if (mode === LOGIN_MODES.PROCESS) {
    return PROCESS_ROLES.includes(role);
  }
  return false;
};
