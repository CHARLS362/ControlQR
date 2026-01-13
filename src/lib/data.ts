// This file is no longer in use, as data is now fetched from the database.
// It is kept for reference purposes.
import type { Student, Attendance } from './types';

export const students: Student[] = [
  { id: 1, persona_id: 1, documento_numero: '12345678', nombres: 'Liam Johnson', genero: 'Masculino', celular_primario: '999888777', correo_primario: 'liam.j@example.com' },
  { id: 2, persona_id: 2, documento_numero: '87654321', nombres: 'Olivia Smith', genero: 'Femenino', celular_primario: '999888666', correo_primario: 'olivia.s@example.com' },
];

export const attendance: Attendance[] = [
  { id: 1, estudiante_id: 1, nombres: 'Liam Johnson', grado_descripcion: 'Primero', seccion_descripcion: 'A', fecha_hora: '2024-05-20T10:00:00Z', estado: 'Presente' },
  { id: 2, estudiante_id: 2, nombres: 'Olivia Smith', grado_descripcion: 'Primero', seccion_descripcion: 'A', fecha_hora: '2024-05-20T10:01:00Z', estado: 'Presente' },
];
