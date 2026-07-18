import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/app'
import { useAppSelector } from '@/hooks/useAppSelector'

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
