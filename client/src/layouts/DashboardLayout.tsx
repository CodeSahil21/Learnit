import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { Menu, BookOpen, Users, PlusCircle, Home, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { logout } from '@/features/auth/authSlice'
import type { RootState } from '@/app/store'

export default function DashboardLayout() {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getNavLinks = () => {
    switch (user?.role) {
      case 'STUDENT':
        return [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/courses', icon: BookOpen, label: 'Browse Courses' },
        ]
      case 'MENTOR':
        return [
          { to: '/mentor/courses', icon: BookOpen, label: 'My Courses' },
          { to: '/mentor/create-course', icon: PlusCircle, label: 'Create Course' },
        ]
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/admin/users', icon: Users, label: 'User Management' },
          { to: '/admin/courses', icon: BookOpen, label: 'Course Management' },
          { to: '/admin/enrollments', icon: PlusCircle, label: 'Enrollment Management' },
        ]
      default:
        return []
    }
  }

  const navLinks = getNavLinks()

  const Sidebar = ({ mobile = false }) => (
    <nav className="p-6 space-y-2">
      {navLinks.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => mobile && setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 text-gray-700 font-medium group border border-transparent hover:border-blue-200"
          >
            <Icon className="h-5 w-5 group-hover:text-blue-600" />
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex w-full min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h2 className="font-bold text-xl text-gray-900">LMS</h2>
            </div>
          </div>
          <Sidebar />
        </aside>
        
        {/* Main content */}
        <main className="w-[calc(100vw-16rem)] min-w-0">
          {/* Top Navigation */}
          <header className="bg-white shadow-sm border-b border-gray-100 py-5">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Mobile menu button */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden border-gray-300">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="font-bold text-xl text-gray-900">LMS</h2>
                      </div>
                    </div>
                    <Sidebar mobile />
                  </SheetContent>
                </Sheet>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-gray-900 truncate">{user?.role} Dashboard</h1>
                  <p className="text-sm text-gray-500 mt-1 truncate">Welcome back, {user?.email}</p>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 hover:bg-slate-100 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden lg:block font-medium text-blue-600 max-w-32 truncate">{user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-xl border border-gray-200 bg-white">
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Page content */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}