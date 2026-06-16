/**
 * 路由定义
 */

import { LoginPage } from 'pages/LoginPage';
import { StudentHomePage } from 'pages/StudentHomePage';
import { TeacherHomePage } from 'pages/TeacherHomePage';
import { ReimbursementFormPage } from 'pages/ReimbursementFormPage';
import { RootRedirect } from './RootRedirect';
import { USER_ROLES } from 'entities/auth';

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    public: true,
  },
  {
    path: '/student/home',
    name: 'StudentHome',
    component: StudentHomePage,
    protected: true,
    role: USER_ROLES.STUDENT,
  },
  {
    path: '/student/forms/new',
    name: 'StudentFormCreate',
    component: ReimbursementFormPage,
    protected: true,
    role: USER_ROLES.STUDENT,
  },
  {
    path: '/student/forms/:id/edit',
    name: 'StudentFormEdit',
    component: ReimbursementFormPage,
    protected: true,
    role: USER_ROLES.STUDENT,
  },
  {
    path: '/teacher/home',
    name: 'TeacherHome',
    component: TeacherHomePage,
    protected: true,
    role: USER_ROLES.TEACHER,
  },
  {
    path: '/',
    name: 'Root',
    component: RootRedirect,
    public: true,
  },
];
