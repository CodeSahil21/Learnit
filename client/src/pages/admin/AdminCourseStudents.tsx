import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { UserPlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { fetchCourse, assignCourse, fetchCourseStudents } from '@/features/courses/courseSlice'
import { searchStudents, createUser } from '@/features/users/usersSlice'
import type { AppDispatch, RootState } from '@/app/store'

export default function AdminCourseStudents() {
  const { id: courseId } = useParams<{ id: string }>()
  const [selectedStudent, setSelectedStudent] = useState('')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [courseStudents, setCourseStudents] = useState<any[]>([])
  const dispatch = useDispatch<AppDispatch>()
  const { currentCourse, loading } = useSelector((state: RootState) => state.courses)
  const { searchResults } = useSelector((state: RootState) => state.users)

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId))
      fetchStudents()
    }
    
    // Auto-refresh student progress every 30 seconds
    const interval = setInterval(() => {
      if (courseId) fetchStudents()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [courseId, dispatch, fetchStudents])

  const fetchStudents = useCallback(async () => {
    if (!courseId) return
    try {
      const result = await dispatch(fetchCourseStudents(courseId))
      if (fetchCourseStudents.fulfilled.match(result)) {
        setCourseStudents(result.payload)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }, [courseId, dispatch])

  useEffect(() => {
    if (searchQuery.length > 0) {
      dispatch(searchStudents(searchQuery))
    }
  }, [searchQuery, dispatch])

  const handleAssignStudent = async () => {
    if (!courseId || !selectedStudent) return

    const result = await dispatch(assignCourse({ courseId, userId: selectedStudent }))
    if (assignCourse.fulfilled.match(result)) {
      toast.success('Student assigned successfully!')
      setAssignDialogOpen(false)
      setSelectedStudent('')
      setSearchQuery('')
      fetchStudents()
    } else {
      toast.error(result.payload as string || 'Failed to assign student')
    }
  }

  const handleCreateStudent = async () => {
    if (!newStudentEmail) return

    const result = await dispatch(createUser({ 
      email: newStudentEmail, 
      password: 'student123', 
      role: 'STUDENT' 
    }))
    if (createUser.fulfilled.match(result)) {
      toast.success('Student created successfully!')
      setNewStudentEmail('')
      setShowAddStudent(false)
      setSearchQuery(newStudentEmail)
    } else {
      toast.error(result.payload as string || 'Failed to create student')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Course Students</h1>
          <p className="text-green-100 text-lg">{currentCourse?.title}</p>
          <p className="text-green-100">Manage student enrollments and track progress</p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Enrolled Students ({courseStudents.length})</h2>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Student to Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchQuery && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {searchResults.length > 0 ? (
                      searchResults.map((student) => (
                        <div
                          key={student.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            selectedStudent === student.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedStudent(student.id)}
                        >
                          <div className="font-medium">{student.email}</div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(student.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>No students found</p>
                        <Button
                          variant="link"
                          onClick={() => setShowAddStudent(true)}
                          className="mt-2"
                        >
                          Create new student
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {showAddStudent && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Create New Student</h4>
                    <Input
                      placeholder="Student email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="mb-3"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCreateStudent}
                        disabled={!newStudentEmail}
                      >
                        Create Student
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddStudent(false)
                          setNewStudentEmail('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setAssignDialogOpen(false)
                    setSearchQuery('')
                    setSelectedStudent('')
                    setShowAddStudent(false)
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignStudent} disabled={!selectedStudent}>
                    Assign Student
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {courseStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No students enrolled</h3>
                <p className="text-gray-600 mb-4">Start by assigning students to this course</p>
                <Button onClick={() => setAssignDialogOpen(true)}>
                  Assign First Student
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {courseStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">{student.email}</h3>
                      <p className="text-sm text-gray-500">
                        Enrolled {new Date(student.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{student.progress_percentage}%</div>
                      <div className="text-sm text-gray-500">Progress</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}