import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Course, CreateCourseRequest, CreateChapterRequest } from '@/types'

interface CourseState {
  courses: Course[]
  myCourses: Course[]
  currentCourse: Course | null
  chapters: any[]
  studentProgress: any | null
  loading: boolean
  error: string | null
}

const initialState: CourseState = {
  courses: [],
  myCourses: [],
  currentCourse: null,
  chapters: [],
  studentProgress: null,
  loading: false,
  error: null,
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Helper function to get auth headers
const getAuthHeaders = (getState: any) => {
  const token = getState().auth.token
  return { Authorization: `Bearer ${token}` }
}

// Async thunks
export const fetchCourses = createAsyncThunk<Course[], void>(
  'courses/fetchCourses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses')
    }
  }
)

export const fetchMyCourses = createAsyncThunk<Course[], void>(
  'courses/fetchMyCourses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/my`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my courses')
    }
  }
)

export const fetchCourse = createAsyncThunk<Course, string>(
  'courses/fetchCourse',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course')
    }
  }
)

export const createCourse = createAsyncThunk<Course, CreateCourseRequest>(
  'courses/createCourse',
  async (courseData, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses`, courseData, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course')
    }
  }
)

export const addChapter = createAsyncThunk<any, { courseId: string; chapterData: CreateChapterRequest }>(
  'courses/addChapter',
  async ({ courseId, chapterData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/chapters`, chapterData, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add chapter')
    }
  }
)

export const updateCourse = createAsyncThunk<Course, { courseId: string; courseData: Partial<CreateCourseRequest> }>(
  'courses/updateCourse',
  async ({ courseId, courseData }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/${courseId}`, courseData, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course')
    }
  }
)

export const deleteCourse = createAsyncThunk<string, string>(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      await axios.delete(`${API_BASE_URL}/courses/${courseId}`, {
        headers: getAuthHeaders(getState)
      })
      return courseId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course')
    }
  }
)

export const fetchCourseChapters = createAsyncThunk<any[], string>(
  'courses/fetchCourseChapters',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/chapters`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chapters')
    }
  }
)

export const assignCourse = createAsyncThunk<any, { courseId: string; userId: string }>(
  'courses/assignCourse',
  async ({ courseId, userId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/assign`, { user_id: userId }, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign course')
    }
  }
)

export const enrollCourse = createAsyncThunk<any, { courseId: string; userId: string }>(
  'courses/enrollCourse',
  async ({ courseId, userId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/enroll`, { user_id: userId }, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enroll course')
    }
  }
)

export const fetchStudentProgress = createAsyncThunk<any, { courseId: string; userId: string }>(
  'courses/fetchStudentProgress',
  async ({ courseId, userId }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/progress?userId=${userId}`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student progress')
    }
  }
)

export const bulkAssignCourse = createAsyncThunk<any, { courseId: string; userIds: string[] }>(
  'courses/bulkAssignCourse',
  async ({ courseId, userIds }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/assign/bulk`, { user_ids: userIds }, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk assign course')
    }
  }
)

export const fetchCourseStudents = createAsyncThunk<any[], string>(
  'courses/fetchCourseStudents',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/students`, {
        headers: getAuthHeaders(getState)
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course students')
    }
  }
)

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null
    },
  },
  extraReducers: (builder) => {
    // Fetch courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false
        state.courses = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Fetch my courses
    builder
      .addCase(fetchMyCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loading = false
        state.myCourses = action.payload
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Fetch single course
    builder
      .addCase(fetchCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.loading = false
        state.currentCourse = action.payload
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Create course
    builder
      .addCase(createCourse.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false
        state.myCourses.push(action.payload)
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Add chapter
    builder
      .addCase(addChapter.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addChapter.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(addChapter.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
    // Update course
    builder
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.myCourses.findIndex(course => course.id === action.payload.id)
        if (index !== -1) {
          state.myCourses[index] = action.payload
        }
        if (state.currentCourse?.id === action.payload.id) {
          state.currentCourse = action.payload
        }
      })
    // Delete course
    builder
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.myCourses = state.myCourses.filter(course => course.id !== action.payload)
        if (state.currentCourse?.id === action.payload) {
          state.currentCourse = null
        }
      })
    // Fetch course chapters
    builder
      .addCase(fetchCourseChapters.fulfilled, (state, action) => {
        state.chapters = action.payload
      })
    // Assign/Enroll course
    builder
      .addCase(assignCourse.fulfilled, () => {
        // Could add enrollment tracking here
      })
      .addCase(enrollCourse.fulfilled, () => {
        // Could add enrollment tracking here
      })
    // Fetch student progress
    builder
      .addCase(fetchStudentProgress.fulfilled, (state, action) => {
        state.studentProgress = action.payload
      })
  },
})

export const { clearError, clearCurrentCourse } = courseSlice.actions
export default courseSlice.reducer