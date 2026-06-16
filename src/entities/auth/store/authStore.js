/**
 * 认证状态管理（Zustand）
 * sessionToken 由后端通过 Cookie 管理
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  login as loginApi,
  logout as logoutApi,
  getProfile as getProfileApi,
} from '../api/authApi';
import { deleteCookie, COOKIE_NAMES } from 'shared/utils/cookie';
import i18n from 'shared/i18n';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (accountNo, password) => {
        set({ loading: true, error: null });
        try {
          const response = await loginApi(accountNo, password);
          set({
            user: response.user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          return { success: true, user: response.user };
        } catch (error) {
          const errorMessage = error.message || i18n.t('auth:error.loginFailed');
          set({
            loading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await logoutApi();
        } catch (error) {
          console.error('登出失败:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          deleteCookie(COOKIE_NAMES.SESSION_TOKEN, { path: '/' });
        }
      },

      refreshUser: async () => {
        set({ loading: true, error: null });
        try {
          const user = await getProfileApi();
          set({
            user,
            isAuthenticated: !!user,
            loading: false,
            error: null,
          });
          return { success: true, user };
        } catch (error) {
          const errorMessage = error.message || i18n.t('auth:error.loginFailed');
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        deleteCookie(COOKIE_NAMES.SESSION_TOKEN, { path: '/' });
      },

      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: 'invoice-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
