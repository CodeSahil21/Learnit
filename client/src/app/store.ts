import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import courseReducer from '@/features/courses/courseSlice'
import progressReducer from '@/features/progress/progressSlice'
import usersReducer from '@/features/users/usersSlice'
import uploadReducer from '@/features/upload/uploadSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    progress: progressReducer,
    users: usersReducer,
    upload: uploadReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch