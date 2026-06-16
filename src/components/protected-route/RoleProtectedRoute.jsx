/**
 * 角色路由守卫：限制页面仅对应角色可访问
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, getHomeRouteByRole } from 'entities/auth';
import { ROUTES } from 'shared/constants/routes';
import { Redirect } from 'shared/ui/Redirect';
import { hasCookie, COOKIE_NAMES } from 'shared/utils/cookie';

export const RoleProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
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

  if (user?.role && user.role !== allowedRole) {
    return <Redirect to={getHomeRouteByRole(user.role)} replace />;
  }

  return children;
};
