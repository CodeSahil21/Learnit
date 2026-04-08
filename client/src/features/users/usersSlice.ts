import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User, CreateUserRequest } from '@/types'

interface UsersState {
  users: User[]
  stats: any | null
  adminCourses: any[]
  adminEnrollments: any[]
  searchResults: any[]
  loading: boolean
  error: string | null
}

const initialState: UsersState = {
  users: [],
  stats: null,
  adminCourses: [],
  adminEnrollments: [],
  searchResults: [],
  loading: false,
  error: null,
}

import API_BASE_URL from '@/lib/api'

// Helper function to get auth headers
const getAuthHeaders = (getState: any) => {
  const token = getState().auth.token
  return { Authorization: `Bearer ${token}` }
}

// Async thunks
export const fetchUsers = createAsyncThunk<User[], void>(
  'users/fetchUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const createUser = createAsyncThunk<User, CreateUserRequest>(
  'users/createUser',
  async (userData, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/users`, userData, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user')
    }
  }
)

export const approveMentor = createAsyncThunk<User, string>(
  'users/approveMentor',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/approve-mentor`, {}, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve mentor')
    }
  }
)

export const rejectMentor = createAsyncThunk<User, string>(
  'users/rejectMentor',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/reject-mentor`, {}, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject mentor')
    }
  }
)

export const deleteUser = createAsyncThunk<string, string>(
  'users/deleteUser',
  async (userId, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: getAuthHeaders(getState)
      })
      return userId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

export const fetchAdminStats = createAsyncThunk<any, void>(
  'users/fetchAdminStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders(getState)
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin stats')
    }
  }
)

export const searchStudents = createAsyncThunk<any[], string>(
  'users/searchStudents',
  async (query, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users/search-students?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search students')
    }
  }
)

export const fetchAdminCourses = createAsyncThunk<any[], void>(
  'users/fetchAdminCourses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/courses`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin courses')
    }
  }
)

export const fetchAdminEnrollments = createAsyncThunk<any[], void>(
  'users/fetchAdminEnrollments',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/enrollments`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin enrollments')
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Approve mentor
    builder
      .addCase(approveMentor.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
    // Reject mentor
    builder
      .addCase(rejectMentor.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
    // Delete user
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload)
      })
    // Fetch admin stats
    builder
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
    // Search students
    builder
      .addCase(searchStudents.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })
    // Fetch admin courses
    builder
      .addCase(fetchAdminCourses.fulfilled, (state, action) => {
        state.adminCourses = action.payload
      })
    // Fetch admin enrollments
    builder
      .addCase(fetchAdminEnrollments.fulfilled, (state, action) => {
        state.adminEnrollments = action.payload
      })
  },
})

export const { clearError } = usersSlice.actions
export default usersSlice.reducer