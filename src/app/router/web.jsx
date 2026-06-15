/**
 * Web路由（React Router）
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routes';

export const WebRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};
