import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { ProgressData } from '@/types'

interface ProgressState {
  progressData: Record<string, ProgressData>
  loading: boolean
  error: string | null
}

const initialState: ProgressState = {
  progressData: {},
  loading: false,
  error: null,
}

const API_BASE_URL = 'http://localhost:4000/api'

// Helper function to get auth headers
const getAuthHeaders = (getState: any) => {
  const token = getState().auth.token
  return { Authorization: `Bearer ${token}` }
}

// Async thunks
export const fetchStudentProgress = createAsyncThunk<ProgressData, string>(
  'progress/fetchStudentProgress',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/progress/my?courseId=${courseId}`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress')
    }
  }
)

export const markChapterComplete = createAsyncThunk<any, string>(
  'progress/markChapterComplete',
  async (chapterId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/progress/${chapterId}/complete`, {}, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark chapter complete')
    }
  }
)

export const downloadCertificate = createAsyncThunk<Blob, string>(
  'progress/downloadCertificate',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/${courseId}`, {
        headers: getAuthHeaders(getState),
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download certificate')
    }
  }
)

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch student progress
    builder
      .addCase(fetchStudentProgress.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudentProgress.fulfilled, (state, action) => {
        state.loading = false
        state.progressData[action.payload.courseId] = action.payload
      })
      .addCase(fetchStudentProgress.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Mark chapter complete
    builder
      .addCase(markChapterComplete.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markChapterComplete.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(markChapterComplete.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Download certificate
    builder
      .addCase(downloadCertificate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(downloadCertificate.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(downloadCertificate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = progressSlice.actions
export default progressSlice.reducer