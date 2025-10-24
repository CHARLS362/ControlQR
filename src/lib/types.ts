
export type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registrationDate: string; // Should be ISO 8601 string date
  courseId?: string;
  courseName?: string;
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

export type User = {
    id: number;
    name: string;
    email: string;
    password?: string; // El hash de la contraseña, opcional para no exponerlo siempre
    role?: string;
    created_at?: string;
}

export type AttendanceReport = {
  id: number;
  student_id: string;
  studentName: string;
  course_id: string;
  courseName: string;
  report_date: string; // Date
  total_classes: number;
  attended_classes: number;
  absent_classes: number;
  attendance_percentage: number;
  generated_by: string | null;
  generated_at: string; // Timestamp
}

// --- Tipos para el Dashboard ---
export type TopCourse = {
  id: string;
  name: string;
  attendancePercentage: number;
};

export type RecentAttendance = {
  id: string;
  date: string;
  status: 'Presente' | 'Ausente';
  studentName: string;
  studentAvatar: string;
  courseName: string;
};

export type DashboardStats = {
  totalStudents: number;
  totalCourses: number;
  totalPresent: number;
  totalAbsent: number;
  chartData: { month: string; present: number; absent: number }[];
  topCourses: TopCourse[];
  recentAttendance: RecentAttendance[];
};


// Tipos para validación de formularios
import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  avatar: z.string().optional(),
  courseId: z.string().min(1, { message: "Debes seleccionar un curso." }),
});

export type StudentFormValues = z.infer<typeof studentSchema>;


export const courseSchema = z.object({
  name: z.string().min(3, { message: "El nombre del curso debe tener al menos 3 caracteres." }),
  description: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
