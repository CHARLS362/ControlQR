// This file is no longer in use, as data is now fetched from the database.
// It is kept for reference purposes.
import type { Student, Course, Attendance } from './types';

export const students: Student[] = [
  { id: 'STU-001', name: 'Liam Johnson', email: 'liam.j@example.com', avatar: 'student-1', registrationDate: '2023-09-01' },
  { id: 'STU-002', name: 'Olivia Smith', email: 'olivia.s@example.com', avatar: 'student-2', registrationDate: '2023-09-01' },
  { id: 'STU-003', name: 'Noah Williams', email: 'noah.w@example.com', avatar: 'student-3', registrationDate: '2023-09-02' },
  { id: 'STU-004', name: 'Emma Brown', email: 'emma.b@example.com', avatar: 'student-4', registrationDate: '2023-09-02' },
  { id: 'STU-005', name: 'Ava Jones', email: 'ava.j@example.com', avatar: 'student-5', registrationDate: '2023-09-03' },
  { id: 'STU-006', name: 'Lucas Garcia', email: 'lucas.g@example.com', avatar: 'student-6', registrationDate: '2023-09-04' },
  { id: 'STU-007', name: 'Mia Miller', email: 'mia.m@example.com', avatar: 'student-7', registrationDate: '2023-09-05' },
  { id: 'STU-008', name: 'Ethan Davis', email: 'ethan.d@example.com', avatar: 'student-8', registrationDate: '2023-09-05' },
];

export const courses: Course[] = [
  { id: 'CRS-101', name: 'Introducción a la Programación', description: 'Aprende los fundamentos de la programación usando Python.', studentCount: 8 },
  { id: 'CRS-102', name: 'Desarrollo Web Básico', description: 'Construye tu primer sitio web con HTML, CSS y JavaScript.', studentCount: 6 },
  { id: 'CRS-201', name: 'Estructuras de Datos y Algoritmos', description: 'Una mirada profunda a las estructuras de datos.', studentCount: 5 },
  { id: 'CRS-202', name: 'Gestión de Bases de Datos', description: 'Aprende a gestionar datos con bases de datos SQL y NoSQL.', studentCount: 7 },
];

export const attendance: Attendance[] = [
  { id: 'ATT-001', studentName: 'Liam Johnson', studentId: 'STU-001', courseName: 'Introducción a la Programación', courseId: 'CRS-101', date: '2024-05-20', status: 'Presente' },
  { id: 'ATT-002', studentName: 'Olivia Smith', studentId: 'STU-002', courseName: 'Introducción a la Programación', courseId: 'CRS-101', date: '2024-05-20', status: 'Presente' },
  { id: 'ATT-003', studentName: 'Noah Williams', studentId: 'STU-003', courseName: 'Introducción a la Programación', courseId: 'CRS-101', date: '2024-05-20', status: 'Ausente' },
  { id: 'ATT-004', studentName: 'Emma Brown', studentId: 'STU-004', courseName: 'Desarrollo Web Básico', courseId: 'CRS-102', date: '2024-05-21', status: 'Presente' },
  { id: 'ATT-005', studentName: 'Ava Jones', studentId: 'STU-005', courseName: 'Desarrollo Web Básico', courseId: 'CRS-102', date: '2024-05-21', status: 'Presente' },
  { id: 'ATT-006', studentName: 'Lucas Garcia', studentId: 'STU-006', courseName: 'Estructuras de Datos y Algoritmos', courseId: 'CRS-201', date: '2024-05-22', status: 'Presente' },
  { id: 'ATT-007', studentName: 'Mia Miller', studentId: 'STU-007', courseName: 'Estructuras de Datos y Algoritmos', courseId: 'CRS-201', date: '2024-05-22', status: 'Presente' },
  { id: 'ATT-008', studentName: 'Ethan Davis', studentId: 'STU-008', courseName: 'Gestión de Bases de Datos', courseId: 'CRS-202', date: '2024-05-23', status: 'Ausente' },
  { id: 'ATT-009', studentName: 'Liam Johnson', studentId: 'STU-001', courseName: 'Introducción a la Programación', courseId: 'CRS-101', date: '2024-05-27', status: 'Presente' },
  { id: 'ATT-010', studentName: 'Olivia Smith', studentId: 'STU-002', courseName: 'Introducción a la Programación', courseId: 'CRS-101', date: '2024-05-27', status: 'Presente' },
];
