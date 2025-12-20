import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchCourses } from '@/features/courses/courseSlice'
import type { AppDispatch, RootState } from '@/app/store'

export default function CourseEnrollment() {
  const dispatch = useDispatch<AppDispatch>()
  const { courses, loading } = useSelector((state: RootState) => state.courses)

  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  if (loading) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="w-full space-y-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
          <p className="text-emerald-100 text-lg">Discover and enroll in courses to start your learning journey</p>
        </div>

      {courses.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">No courses available</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are no courses available for enrollment at the moment. Check back later or contact your mentor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="line-clamp-2 text-lg font-bold">{course.title}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    Available
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>by {course.mentor?.email}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.chapters?.length || 0} chapters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Self-paced</span>
                  </div>
                </div>

                <Button asChild className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-medium text-white">
                  <Link to={`/course/${course.id}`} className="!text-white">
                    View Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}