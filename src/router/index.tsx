import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { useAppSelector } from '@/hooks/useAppSelector'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'


import CustomerDashboard from '@/pages/CustomerDashboard'
import RegisterProduct from '@/pages/RegisterProduct'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import ReplacementPage from '@/pages/ReplacementPage'
import NotFoundPage from '@/pages/NotFoundPage'
import MyProductsPage from '@/pages/MyProductsPage'
import WarrantyStatusPage from '@/pages/WarrantyStatusPage'
import AdminWarrantyDashboard from '@/pages/AdminWarrantyDashboard'
import AdminWarrantyDashboardDetails from '@/pages/AdminWarrantyDashboard/Details'
import WarrantyCardPrint from '@/pages/AdminWarrantyDashboard/WarrantyCardPrint'
import AdminReplacementDashboard from '@/pages/AdminReplacementDashboard'
import AdminReplacementDashboardDetails from '@/pages/AdminReplacementDashboard/Details'
import MyReplacementRequestsPage from '@/pages/MyReplacementRequestsPage'


const AdminRoute = () => {
  const userRole = useAppSelector((state) => state.auth.user?.role) || localStorage.getItem('customerRole') || 'customer'
  if (userRole !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }
  return <Outlet />
}

export const router = createBrowserRouter([

  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.REPLACEMENT,
    element: <ReplacementPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.CUSTOMER_DASHBOARD, element: <CustomerDashboard /> },
          { path: ROUTES.REGISTER_PRODUCT, element: <RegisterProduct /> },
          { path: ROUTES.MY_PRODUCTS, element: <MyProductsPage /> },
          { path: ROUTES.WARRANTY_STATUS, element: <WarrantyStatusPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: ROUTES.MY_REPLACEMENTS, element: <MyReplacementRequestsPage /> },
          { path: ROUTES.WARRANTY_CARD_PRINT, element: <WarrantyCardPrint /> },
          {
            element: <AdminRoute />,
            children: [
              { path: ROUTES.ADMIN_WARRANTY_REQUESTS, element: <AdminWarrantyDashboard /> },
              { path: ROUTES.ADMIN_WARRANTY_REQUEST_DETAILS, element: <AdminWarrantyDashboardDetails /> },
              { path: ROUTES.ADMIN_REPLACEMENT_REQUESTS, element: <AdminReplacementDashboard /> },
              { path: ROUTES.ADMIN_REPLACEMENT_REQUEST_DETAILS, element: <AdminReplacementDashboardDetails /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/dashboard', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  { path: '*', element: <NotFoundPage /> },
])

