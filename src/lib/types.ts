

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

export type User = {
    id: number;
    name: string;
    email: string;
    password?: string; // El hash de la contraseña, opcional para no exponerlo siempre
    role?: string;
    created_at?: string;
}

// Tipos para validación de formularios
import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  avatar: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;


export const courseSchema = z.object({
  name: z.string().min(3, { message: "El nombre del curso debe tener al menos 3 caracteres." }),
  description: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
