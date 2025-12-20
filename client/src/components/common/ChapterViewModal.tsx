import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lock, Play, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { markChapterComplete } from '@/features/progress/progressSlice';
import type { AppDispatch } from '@/app/store';

interface Chapter {
  id: string;
  title: string;
  description: string;
  video_url?: string | null;
  image_url?: string | null;
  sequence_number: number;
  course_id: string;
  is_accessible?: boolean;
}

interface ChapterViewModalProps {
  courseId: string;
  chapterId: string;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'STUDENT' | 'MENTOR' | 'ADMIN';
  onMarkComplete?: () => void;
}

export const ChapterViewModal = ({ 
  courseId, 
  chapterId, 
  isOpen, 
  onClose, 
  userRole,
  onMarkComplete 
}: ChapterViewModalProps) => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isOpen && chapterId) {
      fetchChapter();
    }
  }, [isOpen, chapterId, courseId]);

  const fetchChapter = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/courses/${courseId}/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 403) {
        const error = await res.json();
        toast.error(error.message || 'Access denied');
        onClose();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setChapter(data.data);
      } else {
        toast.error('Failed to load chapter');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to load chapter');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!chapter || userRole !== 'STUDENT') return;

    setMarkingComplete(true);
    try {
      const result = await dispatch(markChapterComplete({ 
        chapterId: chapter.id, 
        courseId 
      }));
      
      if (markChapterComplete.fulfilled.match(result)) {
        toast.success('Chapter marked as complete!');
        onMarkComplete?.();
        onClose();
      } else {
        toast.error(result.payload as string || 'Failed to mark complete');
      }
    } catch (error) {
      toast.error('Failed to mark complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  const getAccessibilityStatus = () => {
    if (userRole !== 'STUDENT') return 'full-access';
    if (chapter?.is_accessible === false) return 'locked';
    return 'accessible';
  };

  const status = getAccessibilityStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl" showCloseButton={false}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 text-lg">Loading chapter...</p>
          </div>
        ) : chapter ? (
          <>
            <DialogHeader className="pb-6">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Chapter {chapter.sequence_number}: {chapter.title}
                </DialogTitle>
                <div className="flex items-center space-x-2">
                  {status === 'locked' && (
                    <Badge variant="outline" className="text-gray-500">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                  {status === 'accessible' && userRole === 'STUDENT' && (
                    <Badge variant="secondary" className="text-blue-600">
                      <Play className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  )}
                  {userRole !== 'STUDENT' && (
                    <Badge variant="default">
                      <Eye className="h-3 w-3 mr-1" />
                      {userRole === 'MENTOR' ? 'Mentor View' : 'Admin View'}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-3 text-gray-900">Description</h3>
                <p className="text-gray-700 leading-relaxed text-lg">{chapter.description}</p>
              </div>

              {/* Video Content */}
              {chapter.video_url && status !== 'locked' && (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Video Content</h3>
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    {(() => {
                      let embedUrl = chapter.video_url;
                      
                      if (chapter.video_url.includes('youtu.be/')) {
                        const videoId = chapter.video_url.split('youtu.be/')[1].split('?')[0];
                        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                      } else if (chapter.video_url.includes('youtube.com/watch?v=')) {
                        const videoId = chapter.video_url.split('v=')[1].split('&')[0];
                        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
                      }
                      
                      return chapter.video_url.includes('youtube') || chapter.video_url.includes('youtu.be') ? (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          title={chapter.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          frameBorder="0"
                        />
                      ) : (
                        <video
                          src={chapter.video_url}
                          className="w-full h-full"
                          controls
                          title={chapter.title}
                        >
                          Your browser does not support the video tag.
                        </video>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Image Content */}
              {chapter.image_url && status !== 'locked' && (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-gray-900">Visual Content</h3>
                  <img
                    src={chapter.image_url}
                    alt={chapter.title}
                    className="w-full rounded-xl border-2 border-gray-200 shadow-lg"
                  />
                </div>
              )}

              {/* Locked Content Message */}
              {status === 'locked' && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-10 text-center">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-bold text-xl text-gray-700 mb-3">Chapter Locked</h3>
                  <p className="text-gray-500 text-lg">
                    Complete previous chapters to unlock this content
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                <Button variant="outline" onClick={onClose} className="px-6 py-3 font-medium text-white bg-gray-600 hover:bg-gray-700">
                  Close
                </Button>
                
                {userRole === 'STUDENT' && status === 'accessible' && (
                  <Button 
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 font-medium shadow-lg !text-white"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {markingComplete ? 'Marking Complete...' : 'Mark as Complete'}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Chapter not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};