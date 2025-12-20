import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { StudentSearch } from './StudentSearch';
import { bulkAssignCourse } from '../../features/courses/courseSlice';
import { toast } from 'sonner';
import type { AppDispatch } from '../../app/store';

interface BulkAssignModalProps {
  courseId: string;
  onSuccess: () => void;
}

export const BulkAssignModal = ({ courseId, onSuccess }: BulkAssignModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleBulkAssign = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(bulkAssignCourse({ courseId, userIds: selectedStudents }));
      
      if (bulkAssignCourse.fulfilled.match(result)) {
        toast.success(`Successfully assigned ${result.payload.created} out of ${result.payload.total} students`);
        setOpen(false);
        setSelectedStudents([]);
        onSuccess();
      } else {
        toast.error(result.payload as string || 'Assignment failed');
      }
    } catch (error) {
      toast.error('Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Assign Students</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Students to Course</DialogTitle>
        </DialogHeader>
        
        <StudentSearch
          onStudentsSelect={setSelectedStudents}
          selectedStudents={selectedStudents}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkAssign} 
            disabled={loading || selectedStudents.length === 0}
          >
            {loading ? 'Assigning...' : `Assign ${selectedStudents.length} Students`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};