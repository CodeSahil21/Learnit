export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'mentor' | 'admin'
}

export interface Course {
  id: string
  title: string
  description: string
  mentorId: string
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  content: string
  courseId: string
}