/**
 * 路由守卫组件
 * 未登录（无 Session Cookie）时跳转登录页，并保留扫码等来源 URL
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from 'entities/auth';
import { ROUTES } from 'shared/constants/routes';
import { Redirect } from 'shared/ui/Redirect';
import { hasCookie, COOKIE_NAMES } from 'shared/utils/cookie';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, clearAuth } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !hasCookie(COOKIE_NAMES.SESSION_TOKEN)) {
      clearAuth();
    }
    setIsChecking(false);
  }, [isAuthenticated, clearAuth]);

  if (isChecking) {
    return null;
  }

  if (!hasCookie(COOKIE_NAMES.SESSION_TOKEN)) {
    return (
      <Redirect
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};
