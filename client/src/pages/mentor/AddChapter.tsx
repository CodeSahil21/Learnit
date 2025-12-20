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
import FileUpload from '@/components/common/FileUpload'
import { addChapter, fetchCourse } from '@/features/courses/courseSlice'
import type { AppDispatch, RootState } from '@/app/store'
import { useEffect } from 'react'

const addChapterSchema = z.object({
  title: z.string().min(1, 'Chapter title is required'),
  description: z.string().min(1, 'Chapter description is required'),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  sequence_number: z.number().min(1, 'Sequence number must be at least 1'),
})

type AddChapterForm = z.infer<typeof addChapterSchema>

export default function AddChapter() {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { currentCourse, loading } = useSelector((state: RootState) => state.courses)

  const form = useForm<AddChapterForm>({
    resolver: zodResolver(addChapterSchema),
    defaultValues: {
      title: '',
      description: '',
      video_url: '',
      image_url: '',
      sequence_number: 1,
    },
  })

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourse(courseId))
    }
  }, [courseId, dispatch])

  useEffect(() => {
    if (currentCourse?.chapters) {
      const nextSequence = currentCourse.chapters.length + 1
      form.setValue('sequence_number', nextSequence)
    }
  }, [currentCourse, form])

  const onSubmit = async (data: AddChapterForm) => {
    if (!courseId) return

    const result = await dispatch(addChapter({
      courseId,
      chapterData: {
        title: data.title,
        description: data.description,
        video_url: data.video_url || undefined,
        image_url: data.image_url || undefined,
        sequence_number: data.sequence_number,
      },
    }))

    if (addChapter.fulfilled.match(result)) {
      toast.success('Chapter added successfully!')
      // Refresh the course data
      dispatch(fetchCourse(courseId))
      navigate(`/mentor/courses/${courseId}`)
    } else {
      toast.error(result.payload as string || 'Failed to add chapter')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Add New Chapter</h1>
        <p className="text-green-100 text-lg">
          Add a new chapter to "{currentCourse?.title}"
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Chapter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="sequence_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Getting Started" {...field} />
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
                    <FormLabel>Chapter Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What students will learn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input placeholder="https://..." {...field} />
                          <FileUpload
                            accept="video/*"
                            maxSize={50}
                            label="Upload Video"
                            onUploadComplete={(url) => field.onChange(url)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input placeholder="https://..." {...field} />
                          <FileUpload
                            accept="image/*"
                            maxSize={5}
                            label="Upload Image"
                            onUploadComplete={(url) => field.onChange(url)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/mentor/courses/${courseId}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700" 
              disabled={loading}
            >
              {loading ? 'Adding Chapter...' : 'Add Chapter'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}