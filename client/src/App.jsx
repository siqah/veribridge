import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './layouts/AppLayout';
import {
  authRoutes,
  standaloneRoutes,
  appLayoutRoutes,
  ProtectedRoute,
  AdminRoute
} from './routes';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Auth Routes - Fullscreen, No Layout */}
      {authRoutes.map(({ path, element: Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}

      {/* Standalone Routes - No AppLayout */}
      {standaloneRoutes.map(({ path, element: Element, protected: isProtected }) => (
        <Route
          key={path}
          path={path}
          element={isProtected ? <ProtectedRoute><Element /></ProtectedRoute> : <Element />}
        />
      ))}

      {/* Routes with AppLayout */}
      <Route path="/" element={<AppLayout />}>
        {/* Dashboard - Protected */}
        {appLayoutRoutes.dashboard?.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute><Element /></ProtectedRoute>}
          />
        ))}

        {/* Verification Tools - Public */}
        {appLayoutRoutes.verification.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}

        {/* Business Services - Protected */}
        {appLayoutRoutes.business.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute><Element /></ProtectedRoute>}
          />
        ))}

        {/* Admin Routes - Admin Only */}
        {appLayoutRoutes.admin.map(({ path, element: Element }) => (
          <Route
            key={path}
            path={path}
            element={<AdminRoute><Element /></AdminRoute>}
          />
        ))}

        {/* Legal - Public */}
        {appLayoutRoutes.legal.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      </Route>

      {/* 404 - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
