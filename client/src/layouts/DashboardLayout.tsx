import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm">
          <nav className="p-4">
            {/* Navigation items */}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1">
          {/* Navbar */}
          <header className="bg-white shadow-sm p-4">
            {/* Header content */}
          </header>
          
          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}