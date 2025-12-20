import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Trash2, CheckCircle, XCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchUsers, createUser, approveMentor, rejectMentor, deleteUser } from '@/features/users/usersSlice'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User } from '@/types'
import type { AppDispatch, RootState } from '@/app/store'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']),
})

type CreateUserForm = z.infer<typeof createUserSchema>

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
    ))}
  </div>
)

export default function UserManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading, error } = useSelector((state: RootState) => state.users)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [])

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'STUDENT',
    },
  })

  const handleApproveMentor = async (userId: string) => {
    const result = await dispatch(approveMentor(userId))
    if (approveMentor.fulfilled.match(result)) {
      toast.success('Mentor approved successfully')
    } else {
      toast.error(result.payload as string || 'Failed to approve mentor')
    }
  }

  const handleRejectMentor = async (userId: string) => {
    const result = await dispatch(rejectMentor(userId))
    if (rejectMentor.fulfilled.match(result)) {
      toast.success('Mentor rejected successfully')
    } else {
      toast.error(result.payload as string || 'Failed to reject mentor')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    const result = await dispatch(deleteUser(userId))
    if (deleteUser.fulfilled.match(result)) {
      toast.success('User deleted successfully')
    } else {
      toast.error(result.payload as string || 'Failed to delete user')
    }
  }

  const onCreateUser = async (data: CreateUserForm) => {
    const result = await dispatch(createUser(data))
    if (createUser.fulfilled.match(result)) {
      toast.success('User created successfully')
      setCreateDialogOpen(false)
      form.reset()
    } else {
      toast.error(result.payload as string || 'Failed to create user')
    }
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'MENTOR': return 'default'
      case 'STUDENT': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.role === 'MENTOR') {
      return user.is_verified ? (
        <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      ) : (
        <Badge variant="destructive">Pending</Badge>
      )
    }
    return <Badge variant="secondary">Active</Badge>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Failed to load users</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-purple-100 text-lg">Manage users, approve mentors, and oversee platform access</p>
        </div>
      
      <div className="flex justify-between items-center">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="MENTOR">Mentor</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900 px-6 py-4">Email</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Role</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Created</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium px-6 py-4">{user.email}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">{getStatusBadge(user)}</TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex space-x-2">
                        {user.role === 'MENTOR' && !user.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleApproveMentor(user.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {user.role === 'MENTOR' && user.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            onClick={() => handleRejectMentor(user.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}