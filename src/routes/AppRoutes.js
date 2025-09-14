import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import { routeRegistry } from './routeRegistry';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* 🔓 Static Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 🔐 Dynamic Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {Object.entries(routeRegistry).map(([path, Component]) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;