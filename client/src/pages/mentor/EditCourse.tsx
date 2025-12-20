import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchCourse, updateCourse, deleteCourse } from '@/features/courses/courseSlice'
import type { AppDispatch, RootState } from '@/app/store'

const editCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

type EditCourseForm = z.infer<typeof editCourseSchema>

export default function EditCourse() {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { currentCourse, loading } = useSelector((state: RootState) => state.courses)

  const form = useForm<EditCourseForm>({
    resolver: zodResolver(editCourseSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId))
    }
  }, [courseId, dispatch])

  useEffect(() => {
    if (currentCourse) {
      form.reset({
        title: currentCourse.title,
        description: currentCourse.description,
      })
    }
  }, [currentCourse, form])

  const onSubmit = async (data: EditCourseForm) => {
    if (!courseId) return

    const result = await dispatch(updateCourse({ courseId, courseData: data }))
    if (updateCourse.fulfilled.match(result)) {
      toast.success('Course updated successfully!')
      navigate('/mentor/courses')
    } else {
      toast.error(result.payload as string || 'Failed to update course')
    }
  }

  const handleDelete = async () => {
    if (!courseId || !confirm('Are you sure you want to delete this course? This action cannot be undone.')) return

    const result = await dispatch(deleteCourse(courseId))
    if (deleteCourse.fulfilled.match(result)) {
      toast.success('Course deleted successfully!')
      navigate('/mentor/courses')
    } else {
      toast.error('Failed to delete course')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Edit Course</h1>
        <p className="text-orange-100 text-lg">Update your course details and manage content</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Introduction to React" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the course" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Course
            </Button>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/mentor/courses')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? 'Updating...' : 'Update Course'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}