import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import ReplacementPage from '@/pages/ReplacementPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: ROUTES.REPLACEMENT, element: <ReplacementPage /> },
        ],
      },
    ],
  },
  { path: '/dashboard', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  { path: '*', element: <NotFoundPage /> },
])
