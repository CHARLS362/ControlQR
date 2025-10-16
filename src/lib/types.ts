export type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registrationDate: string; // Should be ISO 8601 string date
};

export type Course = {
  id: string;
  name: string;
  description: string;
  studentCount: number;
};

export type Attendance = {
  id: string;
  studentName: string;
  studentId: string;
  courseName: string;
  courseId: string;
  date: string; // Should be ISO 8601 string date
  status: 'Presente' | 'Ausente';
};
