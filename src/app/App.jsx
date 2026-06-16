/**
 * 应用根组件
 */

import { useEffect } from 'react';
import { Router } from './router';
import 'shared/i18n';
import { useI18nStore } from 'shared/i18n/store';
import { useAuthStore } from 'entities/auth';
import { hasCookie, COOKIE_NAMES } from 'shared/utils/cookie';

export const App = () => {
  const initLanguage = useI18nStore((state) => state.initLanguage);
  const { isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    initLanguage();
  }, [initLanguage]);

  useEffect(() => {
    if (isAuthenticated && !hasCookie(COOKIE_NAMES.SESSION_TOKEN)) {
      clearAuth();
    }
  }, [isAuthenticated, clearAuth]);

  return <Router />;
};
