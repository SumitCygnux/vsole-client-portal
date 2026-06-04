import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type AuthState = {
  isAuthenticated: boolean
  user: {
    company?: string
    email: string
    name: string
    phone?: string
  } | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email?: string } | undefined>) => {
      const email = action.payload?.email ?? 'vsole@yopmail.com'

      state.isAuthenticated = true
      state.user = {
        company: 'VSOLE Solar Energy Pvt. Ltd.',
        email,
        name: 'John Doe',
        phone: '+91 98765 43210',
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
