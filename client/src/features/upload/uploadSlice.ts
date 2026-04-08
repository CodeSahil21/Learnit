import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface UploadState {
  uploading: boolean
  uploadedUrl: string | null
  error: string | null
}

const initialState: UploadState = {
  uploading: false,
  uploadedUrl: null,
  error: null,
}

import API_BASE_URL from '@/lib/api'

const getAuthHeaders = (getState: any) => {
  const token = getState().auth.token
  return { Authorization: `Bearer ${token}` }
}

export const uploadFile = createAsyncThunk<string, File>(
  'upload/uploadFile',
  async (file, { rejectWithValue, getState }) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }
      
      const data = await response.json()
      return data.url
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload file')
    }
  }
)

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearUpload: (state) => {
      state.uploadedUrl = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploading = false
        state.uploadedUrl = action.payload
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearUpload } = uploadSlice.actions
export default uploadSlice.reducer