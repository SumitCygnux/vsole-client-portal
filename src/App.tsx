import { useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { appTheme } from './utils/theme'
import { useAppDispatch } from './hooks/useAppDispatch'
import { useAppSelector } from './hooks/useAppSelector'
import { logout } from './store/slices/authSlice'

function App() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    const checkTokenExpiry = () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const payloadBase64 = token.split('.')[1]
          if (payloadBase64) {
            const payload = JSON.parse(atob(payloadBase64))
            const exp = payload.exp
            if (exp && exp < Date.now() / 1000) {
              localStorage.removeItem('authToken')
              localStorage.removeItem('refreshToken')
              dispatch(logout())
            }
          }
        } catch (e) {
          console.error('Error decoding token:', e)
        }
      } else {
        dispatch(logout())
      }
    }

    checkTokenExpiry()
    const interval = setInterval(checkTokenExpiry, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, dispatch])

  return (
    <ConfigProvider theme={appTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
