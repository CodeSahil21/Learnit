import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Users, BookOpen, Award, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchUsers, fetchAdminStats } from '@/features/users/usersSlice'
import type { AppDispatch, RootState } from '@/app/store'

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { users, stats } = useSelector((state: RootState) => state.users)

  useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchAdminStats())
  }, [dispatch])

  const dashboardStats = {
    users: stats?.users || users.length,
    courses: stats?.courses || 0,
    certificates: stats?.certificates || 0,
    mentors: users.filter(u => u.role === 'MENTOR').length,
    students: users.filter(u => u.role === 'STUDENT').length,
    approvedMentors: users.filter(u => u.role === 'MENTOR' && u.is_verified).length
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100 text-lg">Platform overview and key metrics</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{dashboardStats.users}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{dashboardStats.courses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl font-bold">{dashboardStats.certificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Mentors</p>
                <p className="text-2xl font-bold">{dashboardStats.approvedMentors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Students</span>
                <span className="font-semibold">{dashboardStats.students}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mentors</span>
                <span className="font-semibold">{dashboardStats.mentors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approved Mentors</span>
                <span className="font-semibold">{dashboardStats.approvedMentors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold">{users.filter(u => u.role === 'ADMIN').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/admin/courses">
                <Button variant="outline" className="w-full justify-between">
                  <span>Manage Courses</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/admin/enrollments">
                <Button variant="outline" className="w-full justify-between">
                  <span>View Enrollments</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-between">
                  <span>User Management</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}