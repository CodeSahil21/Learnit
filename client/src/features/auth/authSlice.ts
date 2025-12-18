import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  user: null | object
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Add auth reducers here
  },
})

export default authSlice.reducer