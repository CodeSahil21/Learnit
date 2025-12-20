import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchMyCourses, fetchCourseStudents } from '@/features/courses/courseSlice'
import type { AppDispatch, RootState } from '@/app/store'

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function MentorCourses() {
  const dispatch = useDispatch<AppDispatch>()
  const { myCourses, loading, error } = useSelector((state: RootState) => state.courses)
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    dispatch(fetchMyCourses())
  }, [])

  useEffect(() => {
    // Fetch enrollment count for each course
    myCourses.forEach(async (course) => {
      try {
        const result = await dispatch(fetchCourseStudents(course.id))
        if (fetchCourseStudents.fulfilled.match(result)) {
          setEnrollmentCounts(prev => ({
            ...prev,
            [course.id]: result.payload.length
          }))
        }
      } catch (error) {
        console.error('Failed to fetch enrollment count for course:', course.id)
      }
    })
  }, [myCourses, dispatch])

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load courses</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Courses</h1>
              <p className="text-green-100 text-lg">Manage your courses and track student progress</p>
            </div>
            <Button asChild className="bg-white text-green-600 hover:bg-gray-100 h-11 px-6 font-medium">
              <Link to="/mentor/create-course" className="!text-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </div>
        </div>

      {loading ? (
        <LoadingSkeleton />
      ) : myCourses.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">No courses yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start creating your first course to share knowledge with students and build your teaching portfolio
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700 h-11 px-6 text-white">
              <Link to="/mentor/create-course" className="!text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="line-clamp-2 text-lg font-bold">{course.title}</CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {course.chapters?.length || 0} chapters
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{enrollmentCounts[course.id] || 0} students</span>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button asChild className="flex-1 h-10 bg-green-600 hover:bg-green-700 font-medium text-white">
                    <Link to={`/mentor/courses/${course.id}`} className="!text-white">
                      Manage
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-10">
                    <Link to={`/mentor/courses/${course.id}/progress`} className="!text-gray-700">
                      Analytics
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}