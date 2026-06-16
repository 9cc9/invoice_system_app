/**
 * 根路径重定向
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore, getHomeRouteByRole } from 'entities/auth';
import { ROUTES } from 'shared/constants/routes';
import { hasCookie, COOKIE_NAMES } from 'shared/utils/cookie';

export const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && hasCookie(COOKIE_NAMES.SESSION_TOKEN) && user?.role) {
    return <Navigate to={getHomeRouteByRole(user.role)} replace />;
  }

  return <Navigate to={ROUTES.LOGIN} replace />;
};
