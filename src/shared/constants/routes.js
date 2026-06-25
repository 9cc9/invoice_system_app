/**
 * 路由常量
 */

export const ROUTES = {
  LOGIN: '/login',
  STUDENT_HOME: '/student/home',
  STUDENT_FORM_CREATE: '/student/forms/new',
  STUDENT_FORM_EDIT: (id) => `/student/forms/${id}/edit`,
  STUDENT_FORM_DETAIL: (id) => `/student/forms/${id}`,
  ADMIN_HOME: '/admin/home',
  ADMIN_FORM_DETAIL: (id) => `/admin/forms/${id}`,
  HOME: '/',
};

/** 401 后回跳路径（sessionStorage key） */
export const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';
