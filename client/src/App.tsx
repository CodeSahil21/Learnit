import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import type { RootState, AppDispatch } from '@/app/store'
import { getCurrentUser } from '@/features/auth/authSlice'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import UserManagement from '@/pages/admin/UserManagement'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import { CourseManagement } from '@/pages/admin/CourseManagement'
import AdminCourseDetails from '@/pages/admin/AdminCourseDetails'
import AdminEditCourse from '@/pages/admin/AdminEditCourse'
import AdminCourseStudents from '@/pages/admin/AdminCourseStudents'
import { EnrollmentManagement } from '@/pages/admin/EnrollmentManagement'
import MentorCourses from '@/pages/mentor/MentorCourses'
import CreateCourse from '@/pages/mentor/CreateCourse'
import CourseDetails from '@/pages/mentor/CourseDetails'
import EditCourse from '@/pages/mentor/EditCourse'
import AddChapter from '@/pages/mentor/AddChapter'
import StudentProgress from '@/pages/mentor/StudentProgress'
import StudentDashboard from '@/pages/student/StudentDashboard'
import CoursePlayer from '@/pages/student/CoursePlayer'
import CourseEnrollment from '@/pages/student/CourseEnrollment'

function App() {
  const { isAuthenticated, token, user, loading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, user])

  // Show loading while fetching user data
  if (token && !user && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['STUDENT', 'MENTOR', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Student Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="course/:id" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <CoursePlayer />
            </ProtectedRoute>
          } />
          <Route path="courses" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <CourseEnrollment />
            </ProtectedRoute>
          } />
          
          {/* Mentor Routes */}
          <Route path="mentor/courses" element={
            <ProtectedRoute allowedRoles={['MENTOR']}>
              <MentorCourses />
            </ProtectedRoute>
          } />
          <Route path="mentor/create-course" element={
            <ProtectedRoute allowedRoles={['MENTOR']}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="mentor/courses/:id" element={
            <ProtectedRoute allowedRoles={['MENTOR']}>
              <CourseDetails />
            </ProtectedRoute>
          } />
          <Route path="mentor/courses/:id/edit" element={
            <ProtectedRoute allowedRoles={['MENTOR']}>
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path="mentor/courses/:id/add-chapter" element={
            <ProtectedRoute allowedRoles={['MENTOR']}>
              <AddChapter />
            </ProtectedRoute>
          } />
          <Route path="mentor/courses/:id/progress" element={
            <ProtectedRoute allowedRoles={['MENTOR']}>
              <StudentProgress />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/courses" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CourseManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/courses/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminCourseDetails />
            </ProtectedRoute>
          } />
          <Route path="admin/courses/:id/edit" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminEditCourse />
            </ProtectedRoute>
          } />
          <Route path="admin/courses/:id/students" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminCourseStudents />
            </ProtectedRoute>
          } />
          <Route path="admin/enrollments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EnrollmentManagement />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'MENTOR' ? '/mentor/courses' : '/dashboard') : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
