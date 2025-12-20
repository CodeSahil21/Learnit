import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { fetchAdminEnrollments } from '../../features/users/usersSlice';
import type { AppDispatch, RootState } from '../../app/store';

export const EnrollmentManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { adminEnrollments: enrollments, loading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchAdminEnrollments());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Enrollment Management</h1>
          <p className="text-green-100 text-lg">Track all student enrollments and course assignments</p>
        </div>
        
        <div className="grid gap-6">
          {enrollments.map((enrollment) => (
            <Card key={`${enrollment.user_id}-${enrollment.course_id}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white w-full">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{enrollment.user.email}</CardTitle>
                    <p className="text-gray-600 mt-1 text-lg">{enrollment.course.title}</p>
                  </div>
                  <Badge variant="secondary" className="font-medium px-3 py-1">{enrollment.user.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Mentor:</span>
                    <span className="font-semibold text-gray-900">{enrollment.course.mentor.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Enrolled:</span>
                    <span className="font-semibold text-gray-900">{new Date(enrollment.assigned_at).toLocaleDateString()}</span>
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