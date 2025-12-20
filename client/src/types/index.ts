export interface User {
  id: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  is_verified?: boolean
  created_at?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface CreateUserRequest {
  email: string
  password: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
}

export interface UsersResponse {
  data: User[]
}

export interface UserResponse {
  data: User
}

export interface Course {
  id: string
  title: string
  description: string
  mentor_id: string
  created_at: string
  mentor?: {
    id: string
    email: string
  }
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  course_id: string
  title: string
  description: string
  image_url?: string | null
  video_url?: string | null
  sequence_number: number
}

export interface CreateCourseRequest {
  title: string
  description: string
}

export interface CreateChapterRequest {
  title: string
  description: string
  video_url?: string
  image_url?: string
  sequence_number: number
}

export interface CoursesResponse {
  data: Course[]
}

export interface CourseResponse {
  data: Course
}

export interface ChapterResponse {
  data: Chapter
}

export interface ProgressData {
  courseId: string
  totalChapters: number
  completedChapters: number
  progressPercentage: number
  chapters: {
    chapter_id: string
    sequence_number: number
    is_completed: boolean
    completed_at: string | null
  }[]
}

export interface ProgressResponse {
  data: ProgressData
}

export interface CompleteChapterResponse {
  data: {
    user_id: string
    chapter_id: string
    is_completed: boolean
    completed_at: string
  }
}

// New types for implemented features
export interface StudentSearchResult {
  id: string
  email: string
  created_at: string
}

export interface StudentSearchResponse {
  data: StudentSearchResult[]
}

export interface BulkAssignRequest {
  user_ids: string[]
}

export interface BulkAssignResponse {
  data: {
    created: number
    total: number
  }
}

export interface CourseStudent {
  id: string
  email: string
  enrolled_at: string
  progress_percentage: number
}

export interface CourseStudentsResponse {
  data: CourseStudent[]
}

export interface AdminCourse {
  id: string
  title: string
  description: string
  mentor_id: string
  created_at: string
  mentor: { id: string; email: string }
  _count: {
    enrollments: number
    chapters: number
  }
}

export interface AdminCoursesResponse {
  data: AdminCourse[]
}

export interface AdminEnrollment {
  user_id: string
  course_id: string
  enrolled_at: string
  user: {
    id: string
    email: string
    role: string
  }
  course: {
    id: string
    title: string
    mentor: { id: string; email: string }
  }
}

export interface AdminEnrollmentsResponse {
  data: AdminEnrollment[]
}

export interface ChapterWithAccess extends Chapter {
  is_accessible?: boolean
}

export interface AdminStats {
  users: number
  courses: number
  certificates: number
}

// Chapter Modal Types
export interface ChapterModalProps {
  courseId: string
  chapterId: string
  isOpen: boolean
  onClose: () => void
  userRole: 'STUDENT' | 'MENTOR' | 'ADMIN'
  onMarkComplete?: () => void
}

export interface ChapterAccessStatus {
  status: 'locked' | 'accessible' | 'completed' | 'full-access'
  message?: string
}