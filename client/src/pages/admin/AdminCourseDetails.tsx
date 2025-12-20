import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Users, Plus, UserPlus, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ChapterViewModal } from '@/components/common/ChapterViewModal'
import { AddChapterModal } from '@/components/AddChapterModal'
import { fetchCourse, assignCourse, fetchCourseStudents } from '@/features/courses/courseSlice'
import { searchStudents, createUser } from '@/features/users/usersSlice'
import type { AppDispatch, RootState } from '@/app/store'

export default function AdminCourseDetails() {
  const { id: courseId } = useParams<{ id: string }>()
  const [selectedStudent, setSelectedStudent] = useState('')
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [courseStudents, setCourseStudents] = useState<any[]>([])
  const [showAddChapterModal, setShowAddChapterModal] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { currentCourse, loading } = useSelector((state: RootState) => state.courses)
  const { searchResults } = useSelector((state: RootState) => state.users)

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId))
      fetchStudents()
    }
  }, [courseId, dispatch])

  const fetchStudents = async () => {
    if (!courseId) return
    try {
      const result = await dispatch(fetchCourseStudents(courseId))
      if (fetchCourseStudents.fulfilled.match(result)) {
        setCourseStudents(result.payload)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      dispatch(searchStudents(debouncedSearchQuery))
    }
  }, [debouncedSearchQuery, dispatch])

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCourse) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">Course not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3">{currentCourse.title}</h1>
              <p className="text-blue-100 text-xl mb-6 leading-relaxed">{currentCourse.description}</p>
              <div className="flex items-center space-x-4">
              <Badge className="bg-white text-blue-600">
                {currentCourse.chapters?.length || 0} chapters
              </Badge>
              <span className="text-blue-100">
                Created {new Date(currentCourse.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-gray-100">
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
            <Button 
              onClick={() => setShowAddChapterModal(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Course Chapters</CardTitle>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowAddChapterModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </CardHeader>
            <CardContent>
              {currentCourse.chapters && currentCourse.chapters.length > 0 ? (
                <div className="space-y-4">
                  {[...currentCourse.chapters]
                    .sort((a, b) => a.sequence_number - b.sequence_number)
                    .map((chapter) => (
                      <div key={chapter.id} className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-gray-50 hover:bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg text-gray-900">
                            {chapter.sequence_number}. {chapter.title}
                          </h3>
                          <Badge variant="outline" className="font-medium">
                            Chapter {chapter.sequence_number}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{chapter.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {chapter.video_url && (
                              <span className="flex items-center">
                                📹 Video included
                              </span>
                            )}
                            {chapter.image_url && (
                              <span className="flex items-center">
                                🖼️ Image included
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-white bg-gray-600 hover:bg-gray-700"
                            onClick={() => {
                              setSelectedChapterId(chapter.id)
                              setChapterModalOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No chapters yet</h3>
                  <p className="text-gray-600 mb-4">Start adding chapters to build course content</p>
                  <Button onClick={() => setShowAddChapterModal(true)}>
                    Add First Chapter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold flex items-center text-gray-900">
                  <Users className="h-6 w-6 mr-3 text-blue-600" />
                  Enrolled Students
                </CardTitle>
              </CardHeader>
            <CardContent>
              {courseStudents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{student.email}</p>
                        <p className="text-xs text-gray-500">
                          Enrolled {new Date(student.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{student.progress_percentage}%</p>
                        <p className="text-xs text-gray-500">Progress</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold text-gray-900">Course Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Total Chapters</span>
                  <span className="font-bold text-lg text-gray-900">{currentCourse.chapters?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Enrolled Students</span>
                  <span className="font-bold text-lg text-gray-900">{courseStudents.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Completion Rate</span>
                  <span className="font-bold text-lg text-gray-900">0%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ChapterViewModal
          courseId={courseId!}
          chapterId={selectedChapterId}
          isOpen={chapterModalOpen}
          onClose={() => {
            setChapterModalOpen(false)
            setSelectedChapterId('')
          }}
          userRole="ADMIN"
        />

        <AddChapterModal
          isOpen={showAddChapterModal}
          onClose={() => setShowAddChapterModal(false)}
          courseId={courseId!}
        />
      </div>
    </div>
  )
}