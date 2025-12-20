import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import { addChapter, fetchCourseChapters } from '@/features/courses/courseSlice';
import { uploadFile } from '@/features/upload/uploadSlice';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  courseId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, chapters } = useSelector((state: RootState) => state.courses);
  const { uploading: uploadLoading } = useSelector((state: RootState) => state.upload);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    imageFile: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({
        ...formData,
        imageFile: file,
      });
    }
  };

  // Fetch latest chapters when modal opens to compute next sequence
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCourseChapters(courseId));
    }
  }, [isOpen, courseId, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = '';
    if (formData.imageFile) {
      const uploadResult = await dispatch(uploadFile(formData.imageFile));
      if (uploadFile.fulfilled.match(uploadResult)) {
        imageUrl = uploadResult.payload;
      }
    }

    // Auto-calculate next sequence number from existing chapters
    const nextSequence = Array.isArray(chapters) && chapters.length > 0
      ? Math.max(...chapters.map((c: any) => c.sequence_number || 0)) + 1
      : 1;

    const chapterData = {
      title: formData.title,
      description: formData.description,
      // Omit empty URLs so backend optional schema passes
      video_url: formData.videoUrl.trim() ? formData.videoUrl.trim() : undefined,
      image_url: imageUrl ? imageUrl : undefined,
      sequence_number: nextSequence,
    };

    const result = await dispatch(addChapter({ courseId, chapterData }));
    if (addChapter.fulfilled.match(result)) {
      // Refresh chapters list to show the new chapter
      dispatch(fetchCourseChapters(courseId));
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        imageFile: null,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Chapter</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading || uploadLoading ? 'Adding...' : 'Add Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};