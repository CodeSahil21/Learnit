import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, Award, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { fetchCourse, fetchStudentProgress } from '@/features/courses/courseSlice'
import { fetchUsers } from '@/features/users/usersSlice'
import type { AppDispatch, RootState } from '@/app/store'

export default function StudentProgress() {
  const { id: courseId } = useParams<{ id: string }>()
  const [selectedStudent, setSelectedStudent] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { currentCourse, studentProgress, loading } = useSelector((state: RootState) => state.courses)
  const { users } = useSelector((state: RootState) => state.users)

  const students = users.filter(user => user.role === 'STUDENT')

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId))
      dispatch(fetchUsers())
    }
  }, [courseId, dispatch])

  useEffect(() => {
    if (courseId && selectedStudent) {
      dispatch(fetchStudentProgress({ courseId, userId: selectedStudent }))
      
      // Auto-refresh progress every 15 seconds when viewing specific student
      const interval = setInterval(() => {
        dispatch(fetchStudentProgress({ courseId, userId: selectedStudent }))
      }, 15000)
      
      return () => clearInterval(interval)
    }
  }, [courseId, selectedStudent, dispatch])

  const chartData = studentProgress?.chapters?.map((chapter: any) => ({
    name: `Ch ${chapter.sequence_number}`,
    completed: chapter.is_completed ? 1 : 0,
  })) || []

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Student Progress Analytics</h1>
        <p className="text-purple-100 text-lg">Track individual student performance in {currentCourse?.title}</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a student to view their progress" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && studentProgress && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-2xl font-bold">{studentProgress.progressPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{studentProgress.completedChapters}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-2xl font-bold">{studentProgress.totalChapters - studentProgress.completedChapters}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Chapters</p>
                    <p className="text-2xl font-bold">{studentProgress.totalChapters}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{studentProgress.progressPercentage}%</span>
                    </div>
                    <Progress value={studentProgress.progressPercentage} className="h-3" />
                  </div>
                  <div className="pt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completed" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Chapter Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studentProgress.chapters?.map((chapter: any) => (
                    <div key={chapter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          chapter.is_completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {chapter.sequence_number}
                        </div>
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          {chapter.completed_at && (
                            <p className="text-xs text-gray-500">
                              Completed {new Date(chapter.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant={chapter.is_completed ? 'default' : 'secondary'}>
                        {chapter.is_completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {selectedStudent && !studentProgress && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
            <p className="text-gray-600">This student hasn't started the course yet or isn't enrolled.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}