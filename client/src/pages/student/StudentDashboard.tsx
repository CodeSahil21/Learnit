import { useEffect, memo, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchCourses } from '@/features/courses/courseSlice'
import { fetchStudentProgress } from '@/features/progress/progressSlice'
import type { AppDispatch, RootState } from '@/app/store'

const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }, (_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-2 w-full mb-4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
))

const CourseCard = memo(function CourseCard({ course }: { course: any }) {
  const dispatch = useDispatch<AppDispatch>()
  const { progressData } = useSelector((state: RootState) => state.progress)
  const courseProgress = progressData[course.id]
  const progress = useMemo(() => courseProgress?.progressPercentage || 0, [courseProgress])

  const fetchProgress = useCallback(() => {
    if (!courseProgress) {
      dispatch(fetchStudentProgress(course.id))
    }
  }, [course.id, courseProgress, dispatch])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="line-clamp-2 text-lg font-bold">{course.title}</CardTitle>
          <Badge variant={progress === 100 ? 'default' : 'secondary'} className={progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
            {progress === 100 ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">by {course.mentor?.email}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-gray-600 text-sm line-clamp-3">
          {course.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{courseProgress?.totalChapters || 0} chapters</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{courseProgress?.completedChapters || 0} completed</span>
          </div>
        </div>

        <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-medium text-white">
          <Link to={`/course/${course.id}`}>
            {progress === 0 ? 'Start Learning' : 'Continue Learning'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
})

export default function StudentDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { courses, loading, error } = useSelector((state: RootState) => state.courses)

  const memoizedDispatch = useCallback(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  useEffect(() => {
    memoizedDispatch()
  }, [memoizedDispatch])

  const activeCourses = useMemo(() => 
    courses.filter(() => true), // Placeholder for actual filtering logic
    [courses]
  )

  const completedCourses = useMemo(() => 
    courses.filter(() => false), // Placeholder for actual filtering logic
    [courses]
  )

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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">My Learning Dashboard</h1>
          <p className="text-blue-100 text-lg">Continue your learning journey and unlock your potential</p>
        </div>

      {loading ? (
        <LoadingSkeleton />
      ) : activeCourses.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">No courses assigned</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Contact your mentor to get enrolled in courses and start your learning journey
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-gray-100 border-none">
            <TabsTrigger value="active" className="border-none text-gray-700 data-[state=active]:text-white data-[state=active]:bg-blue-600">Active Courses</TabsTrigger>
            <TabsTrigger value="completed" className="border-none text-gray-700 data-[state=active]:text-white data-[state=active]:bg-blue-600">Completed Courses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            {activeCourses.length > 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed courses yet</h3>
                  <p className="text-gray-600">
                    Complete your active courses to see them here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
      </div>
    </div>
  )
}