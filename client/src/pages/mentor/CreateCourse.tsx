import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import FileUpload from '@/components/common/FileUpload'
import { createCourse, addChapter } from '@/features/courses/courseSlice'
import type { AppDispatch, RootState } from '@/app/store'

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  chapters: z.array(
    z.object({
      title: z.string().min(1, 'Chapter title is required'),
      description: z.string().min(1, 'Chapter description is required'),
      video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    })
  ).min(1, 'At least one chapter is required'),
})

type CreateCourseForm = z.infer<typeof createCourseSchema>

export default function CreateCourse() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.courses)

  const form = useForm<CreateCourseForm>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: '',
      description: '',
      chapters: [{ title: '', description: '', video_url: '', image_url: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'chapters',
  })

  const onSubmit = async (data: CreateCourseForm) => {
    // Step 1: Create the course
    const courseResult = await dispatch(createCourse({
      title: data.title,
      description: data.description,
    }))

    if (createCourse.fulfilled.match(courseResult)) {
      // Step 2: Add chapters sequentially
      let allChaptersAdded = true
      for (let i = 0; i < data.chapters.length; i++) {
        const chapter = data.chapters[i]
        const chapterResult = await dispatch(addChapter({
          courseId: courseResult.payload.id,
          chapterData: {
            title: chapter.title,
            description: chapter.description,

            video_url: chapter.video_url || undefined,
            image_url: chapter.image_url || undefined,
            sequence_number: i + 1,
          },
        }))
        
        if (!addChapter.fulfilled.match(chapterResult)) {
          allChaptersAdded = false
          break
        }
      }

      if (allChaptersAdded) {
        toast.success('Course created successfully!')
        navigate('/mentor/courses')
      } else {
        toast.error('Course created but some chapters failed to add')
      }
    } else {
      toast.error(courseResult.payload as string || 'Failed to create course')
    }
  }



  return (
    <div className="bg-gray-50 p-6">
      <div className="w-full space-y-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
          <p className="text-indigo-100 text-lg">Share your knowledge and create engaging learning experiences</p>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Course Details Section */}
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

          {/* Chapters Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Chapters</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  onClick={() => append({ title: '', description: '', video_url: '', image_url: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-6 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">Chapter {index + 1}</h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`chapters.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 font-medium">Chapter Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Getting Started" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`chapters.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 font-medium">Chapter Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What students will learn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name={`chapters.${index}.video_url`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="mb-2 font-medium">Video URL (Optional)</FormLabel>
                          <FormControl>
                            <Input className="w-full" placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`chapters.${index}.image_url`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="mb-2 font-medium">Image (Optional)</FormLabel>
                          <FormControl>
                            <div className="w-full space-y-3">
                              <Input className="w-full" placeholder="https://..." {...field} />
                              <div className="w-full">
                                <FileUpload
                                  accept="image/*"
                                  maxSize={5}
                                  label="Upload Image"
                                  onUploadComplete={(url) => field.onChange(url)}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {index < fields.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 !text-white"
              onClick={() => navigate('/mentor/courses')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 h-11 px-8" disabled={loading}>
              {loading ? 'Creating Course...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  )
}