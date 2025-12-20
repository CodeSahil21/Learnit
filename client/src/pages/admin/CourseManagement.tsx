import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Eye, Edit, Users } from 'lucide-react';
import { fetchAdminCourses } from '../../features/users/usersSlice';
import type { AppDispatch, RootState } from '../../app/store';

export const CourseManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminCourses: courses, loading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchAdminCourses());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Course Management</h1>
          <p className="text-blue-100 text-lg">Monitor all courses, enrollments, and content across the platform</p>
        </div>
      
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary">
                    {course._count.enrollments} Students
                  </Badge>
                  <Badge variant="outline">
                    {course._count.chapters} Chapters
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <div>Mentor: {course.mentor.email}</div>
                  <div>Created: {new Date(course.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex space-x-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/courses/${course.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/courses/${course.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/courses/${course.id}/students`}>
                      <Users className="h-4 w-4 mr-1" />
                      Students
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};