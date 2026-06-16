/**
 * 路由常量
 */

export const ROUTES = {
  LOGIN: '/login',
  STUDENT_HOME: '/student/home',
  STUDENT_FORM_CREATE: '/student/forms/new',
  STUDENT_FORM_EDIT: (id) => `/student/forms/${id}/edit`,
  TEACHER_HOME: '/teacher/home',
  HOME: '/',
};

/** 401 后回跳路径（sessionStorage key） */
export const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';
