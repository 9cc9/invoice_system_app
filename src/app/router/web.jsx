/**
 * Web路由（React Router）
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import { ProtectedRoute, RoleProtectedRoute } from 'components/protected-route';

export const WebRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => {
          let element = <route.component />;

          if (route.protected && (route.allowedRoles || route.role)) {
            element = (
              <RoleProtectedRoute
                allowedRole={route.role}
                allowedRoles={route.allowedRoles}
              >
                <route.component />
              </RoleProtectedRoute>
            );
          } else if (route.protected) {
            element = (
              <ProtectedRoute>
                <route.component />
              </ProtectedRoute>
            );
          }

          return (
            <Route
              key={route.path}
              path={route.path}
              element={element}
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
};
