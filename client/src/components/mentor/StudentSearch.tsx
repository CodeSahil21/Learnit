import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

interface Student {
  id: string;
  email: string;
  created_at: string;
}

interface StudentSearchProps {
  onStudentsSelect: (studentIds: string[]) => void;
  selectedStudents: string[];
}

export const StudentSearch = ({ onStudentsSelect, selectedStudents }: StudentSearchProps) => {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchStudents = async () => {
      if (!query.trim()) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/search-students?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStudents(data.data || []);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleStudentToggle = (studentId: string) => {
    const updated = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];
    onStudentsSelect(updated);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search students by email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {loading && <p className="text-sm text-gray-500">Searching...</p>}
      
      <div className="max-h-60 overflow-y-auto space-y-2">
        {students.map((student) => (
          <Card key={student.id} className="p-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleStudentToggle(student.id)}
                className="rounded"
              />
              <div>
                <p className="font-medium">{student.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedStudents.length > 0 && (
        <p className="text-sm text-blue-600">
          {selectedStudents.length} student(s) selected
        </p>
      )}
    </div>
  );
};