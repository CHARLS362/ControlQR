export type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registrationDate: string;
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
  date: string;
  status: 'Presente' | 'Ausente';
};
