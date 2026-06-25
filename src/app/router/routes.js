/**
 * 路由定义
 */

import { LoginPage } from 'pages/LoginPage';
import { StudentHomePage } from 'pages/StudentHomePage';
import { TeacherHomePage } from 'pages/TeacherHomePage';
import { ReimbursementFormPage } from 'pages/ReimbursementFormPage';
import { ReimbursementFormDetailPage } from 'pages/ReimbursementFormDetailPage';
import { RootRedirect } from './RootRedirect';
import { USER_ROLES } from 'entities/auth';

const UPLOAD_ROLES = [USER_ROLES.STUDENT, USER_ROLES.TEACHER];

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
    allowedRoles: UPLOAD_ROLES,
  },
  {
    path: '/student/forms/new',
    name: 'StudentFormCreate',
    component: ReimbursementFormPage,
    protected: true,
    allowedRoles: UPLOAD_ROLES,
  },
  {
    path: '/student/forms/:id/edit',
    name: 'StudentFormEdit',
    component: ReimbursementFormPage,
    protected: true,
    allowedRoles: UPLOAD_ROLES,
  },
  {
    path: '/student/forms/:id',
    name: 'StudentFormDetail',
    component: ReimbursementFormDetailPage,
    protected: true,
    allowedRoles: UPLOAD_ROLES,
  },
  {
    path: '/admin/home',
    name: 'AdminHome',
    component: TeacherHomePage,
    protected: true,
    allowedRoles: [USER_ROLES.ADMIN],
  },
  {
    path: '/admin/forms/:id',
    name: 'AdminFormDetail',
    component: ReimbursementFormDetailPage,
    protected: true,
    allowedRoles: [USER_ROLES.ADMIN],
  },
  {
    path: '/',
    name: 'Root',
    component: RootRedirect,
    public: true,
  },
];
