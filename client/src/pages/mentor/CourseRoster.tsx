import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { BulkAssignModal } from '../../components/mentor/BulkAssignModal';
import { Users } from 'lucide-react';
import { fetchCourseStudents } from '../../features/courses/courseSlice';
import type { AppDispatch, RootState } from '../../app/store';

interface CourseStudent {
  id: string;
  email: string;
  enrolled_at: string;
  progress_percentage: number;
}

export const CourseRoster = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.courses);
  const [students, setStudents] = useState<CourseStudent[]>([]);

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;
    try {
      const result = await dispatch(fetchCourseStudents(courseId));
      if (fetchCourseStudents.fulfilled.match(result)) {
        setStudents(result.payload);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    fetchStudents();
    
    // Auto-refresh every 30 seconds to catch progress updates
    const interval = setInterval(fetchStudents, 30000);
    return () => clearInterval(interval);
  }, [fetchStudents]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Course Roster</h1>
              <p className="text-indigo-100 text-lg">Manage enrolled students and track their progress</p>
            </div>
            <BulkAssignModal courseId={courseId!} onSuccess={fetchStudents} />
          </div>
        </div>

        <div className="grid gap-6">
          {students.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No students enrolled yet</p>
                <p className="text-gray-400 text-sm mt-2">Use the bulk assign feature to add students to this course</p>
              </CardContent>
            </Card>
          ) : (
            students.map((student) => (
              <Card key={student.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{student.email}</CardTitle>
                      <p className="text-gray-500 mt-1">
                        Enrolled: {new Date(student.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {student.progress_percentage}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-700">Progress</span>
                      <span className="text-gray-900">{student.progress_percentage}%</span>
                    </div>
                    <Progress value={student.progress_percentage} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};