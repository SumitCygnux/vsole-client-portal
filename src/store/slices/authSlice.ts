import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
  isAuthenticated: boolean
  user: {
    company?: string
    email: string
    name: string
    phone?: string
    role?: string
  } | null
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: localStorage.getItem('authToken') ? {
    company: localStorage.getItem('customerCompany') || '',
    email: localStorage.getItem('customerEmail') || '',
    name: localStorage.getItem('customerName') || '',
    phone: localStorage.getItem('customerPhone') || '',
    role: localStorage.getItem('customerRole') || 'customer',
  } : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email?: string; name?: string; role?: string; phone?: string; company?: string } | undefined>) => {
      const email = action.payload?.email ?? ''
      const name = action.payload?.name ?? ''
      const role = action.payload?.role ?? 'customer'
      const phone = action.payload?.phone ?? ''
      const company = action.payload?.company ?? ''

      state.isAuthenticated = true
      state.user = {
        company,
        email,
        name,
        phone,
        role,
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
    updateProfile: (
      state,
      action: PayloadAction<{
        company?: string
        email: string
        name: string
        phone?: string
      }>,
    ) => {
      if (!state.user) return

      state.user = {
        ...state.user,
        ...action.payload,
      }
    },
  },
})

export const { login, logout, updateProfile } = authSlice.actions
export default authSlice.reducer
