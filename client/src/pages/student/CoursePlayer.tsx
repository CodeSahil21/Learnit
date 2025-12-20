import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { CheckCircle, Lock, Play, Award, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChapterViewModal } from '@/components/common/ChapterViewModal'
import { fetchCourse } from '@/features/courses/courseSlice'
import { fetchStudentProgress, markChapterComplete, downloadCertificate } from '@/features/progress/progressSlice'
import { getYouTubeEmbedUrl, isYouTubeUrl } from '@/lib/videoUtils'
import type { AppDispatch, RootState } from '@/app/store'

export default function CoursePlayer() {
  const { id: courseId } = useParams<{ id: string }>()
  const [selectedChapter, setSelectedChapter] = useState<any>(null)
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [modalChapterId, setModalChapterId] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const { currentCourse: course, loading: courseLoading } = useSelector((state: RootState) => state.courses)
  const { progressData, loading: progressLoading } = useSelector((state: RootState) => state.progress)
  
  const progress = progressData[courseId!]
  const isCompleted = progress?.progressPercentage === 100

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId))
      dispatch(fetchStudentProgress(courseId))
    }
  }, [courseId, dispatch])

  const getChapterStatus = (chapter: any) => {
    if (!progress) return 'locked'
    
    const chapterProgress = progress.chapters.find(p => p.chapter_id === chapter.id)
    if (chapterProgress?.is_completed) return 'completed'
    
    // Check if previous chapters are completed (sequential access)
    const prevChapters = course?.chapters?.filter(c => c.sequence_number < chapter.sequence_number) || []
    const allPrevCompleted = prevChapters.every(prevChapter => 
      progress.chapters.find(p => p.chapter_id === prevChapter.id)?.is_completed
    )
    
    return allPrevCompleted ? 'available' : 'locked'
  }

  const handleChapterClick = async (chapter: any) => {
    const status = getChapterStatus(chapter)
    if (status === 'locked') {
      toast.error('Complete previous chapters first')
      return
    }
    
    // Fetch individual chapter with sequential check
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/courses/${courseId}/chapters/${chapter.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.status === 403) {
        const error = await res.json()
        toast.error(error.message || 'Complete previous chapters first')
        return
      }
      
      if (res.ok) {
        const data = await res.json()
        setSelectedChapter(data.data)
      }
    } catch (error) {
      toast.error('Failed to load chapter')
    }
  }

  const handleMarkComplete = async () => {
    if (!selectedChapter) return
    
    const result = await dispatch(markChapterComplete(selectedChapter.id))
    if (markChapterComplete.fulfilled.match(result)) {
      toast.success('Chapter marked as complete!')
      // Refresh progress data
      dispatch(fetchStudentProgress(courseId!))
      
      // Auto-select next chapter if available
      const nextChapter = course?.chapters?.find(c => 
        c.sequence_number === selectedChapter.sequence_number + 1
      )
      if (nextChapter && getChapterStatus(nextChapter) === 'available') {
        setSelectedChapter(nextChapter)
      }
    } else {
      toast.error(result.payload as string || 'Failed to mark chapter as complete')
    }
  }

  const handleDownloadCertificate = async () => {
    const result = await dispatch(downloadCertificate(courseId!))
    if (downloadCertificate.fulfilled.match(result)) {
      const blob = result.payload as Blob
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${course?.title}-certificate.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Certificate downloaded!')
    } else {
      toast.error(result.payload as string || 'Failed to download certificate')
    }
  }

  // Auto-select first available chapter
  useEffect(() => {
    if (course?.chapters && !selectedChapter && progress) {
      const firstAvailable = course.chapters.find(chapter => 
        getChapterStatus(chapter) !== 'locked'
      )
      if (firstAvailable) {
        setSelectedChapter(firstAvailable)
      }
    }
  }, [course?.chapters, selectedChapter, progress, getChapterStatus])

  if (courseLoading || progressLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 bg-white border-r p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chapter List */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="font-bold text-xl line-clamp-2 text-gray-900 mb-1">{course?.title}</h2>
          {progress && (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.progressPercentage}%</span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
              <p className="text-xs text-gray-600">
                {progress.completedChapters} of {progress.totalChapters} chapters completed
              </p>
            </div>
          )}
          
          {isCompleted && (
            <Button 
              onClick={handleDownloadCertificate}
              disabled={progressLoading}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
            >
              <Award className="h-4 w-4 mr-2" />
              {progressLoading ? 'Downloading...' : 'Download Certificate'}
            </Button>
          )}
        </div>

        <div className="p-6 space-y-3">
          {course?.chapters?.map((chapter) => {
            const status = getChapterStatus(chapter)
            const isSelected = selectedChapter?.id === chapter.id
            
            return (
              <div
                key={chapter.id}
                onClick={() => handleChapterClick(chapter)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : status === 'locked' 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {status === 'available' && (
                      <Play className="h-5 w-5 text-blue-600" />
                    )}
                    {status === 'locked' && (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm mb-2 ${
                      status === 'locked' ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {chapter.sequence_number}. {chapter.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          status === 'completed' ? 'default' : 
                          status === 'available' ? 'secondary' : 'outline'
                        }
                        className="text-xs font-medium"
                      >
                        {status === 'completed' ? 'Completed' : 
                         status === 'available' ? 'Available' : 'Locked'}
                      </Badge>
                      {status !== 'locked' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-white hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            setModalChapterId(chapter.id)
                            setChapterModalOpen(true)
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {selectedChapter ? (
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-10">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 text-white mb-8 shadow-xl">
                  <h1 className="text-4xl font-bold mb-4">
                    Chapter {selectedChapter.sequence_number}: {selectedChapter.title}
                  </h1>
                  <p className="text-blue-100 text-xl leading-relaxed">{selectedChapter.description}</p>
                </div>
              </div>

              {/* Video Player */}
              {selectedChapter.video_url && (
                <Card className="mb-8 border-0 shadow-lg">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden">
                      {isYouTubeUrl(selectedChapter.video_url) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(selectedChapter.video_url)}
                          className="w-full h-full"
                          allowFullScreen
                          title={selectedChapter.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          frameBorder="0"
                        />
                      ) : (
                        <video
                          src={selectedChapter.video_url}
                          className="w-full h-full"
                          controls
                          title={selectedChapter.title}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chapter Image */}
              {selectedChapter.image_url && (
                <Card className="mb-8 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <img
                      src={selectedChapter.image_url}
                      alt={selectedChapter.title}
                      className="w-full rounded-xl"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Mark Complete Button */}
              {getChapterStatus(selectedChapter) === 'available' && (
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">Ready to continue?</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Mark this chapter as complete to unlock the next one and continue your learning journey
                    </p>
                    <Button 
                      onClick={handleMarkComplete}
                      disabled={progressLoading}
                      className="bg-green-600 hover:bg-green-700 h-12 px-8 text-lg font-medium"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {progressLoading ? 'Marking Complete...' : 'Mark as Complete'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Select a chapter to start learning</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Choose a chapter from the sidebar to begin your learning journey and unlock new knowledge
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Chapter View Modal */}
      <ChapterViewModal
        courseId={courseId!}
        chapterId={modalChapterId}
        isOpen={chapterModalOpen}
        onClose={() => {
          setChapterModalOpen(false)
          setModalChapterId('')
        }}
        userRole="STUDENT"
        onMarkComplete={() => {
          dispatch(fetchStudentProgress(courseId!))
        }}
      />
    </div>
  )
}