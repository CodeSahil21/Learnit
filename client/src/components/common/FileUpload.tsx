import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadFile, clearUpload } from '@/features/upload/uploadSlice'
import type { AppDispatch, RootState } from '@/app/store'

interface FileUploadProps {
  onUploadComplete: (url: string) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
}

export default function FileUpload({ 
  onUploadComplete, 
  accept = "image/*,video/*", 
  maxSize = 10,
  label = "Upload File"
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch<AppDispatch>()
  const { uploading, uploadedUrl, error } = useSelector((state: RootState) => state.upload)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    const result = await dispatch(uploadFile(file))
    if (uploadFile.fulfilled.match(result)) {
      onUploadComplete(result.payload)
    }
  }

  const handleClear = () => {
    dispatch(clearUpload())
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!uploadedUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors flex items-center justify-center"
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : label}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">File uploaded successfully</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-green-600 mt-1 truncate">{uploadedUrl}</p>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}