
// Tipos para validación de formularios
import { z } from 'zod';

// --- Tipos de Entidades Principales (basados en API externa) ---

export type Student = {
  id: number;
  persona_id: number;
  documento_numero: string;
  nombres: string;
  genero: string;
  celular_primario: string;
  correo_primario: string;
};

export type StudentDetails = {
  id: number;
  persona_id: number;
  anio_academico_id: number;
  periodo_id: number;
  grado_id: number;
  seccion_id: number;
  padre_id: number;
  madre_id: number;
  apoderado_id: number;
  seguro_id: number;
  celular_emergencia: string;
  codigo: string;
  observacion: string;
  nombres: string;
  anio_academico: number;
  periodo: string;
  grado: string;
  seccion: string;
  seguro: string;
  codigo_hash: string;
};

export type Section = {
  id: number;
  grado_id: number;
  turno_id: number;
  tutor_personal_id: number;
  seccion_tipo_id: number;
  nombre: string;
  vacantes_total: number;
  vacantes_faltantes: number;
  aula: string;
  grado: string;
  turno: string;
  tutor_nombre: string;
};

export type Grado = {
  id: number;
  nombre: string;
  descripcion: string;
  asignado: number; // 0 o 1
};

export type Gender = {
  id: number;
  nombre: string;
  descripcion: string;
  vigente: boolean;
};

export type Period = {
    id: number;
    anio_academico_id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    anio_academico: number;
    vigente: boolean;
};

export type FoundPerson = {
  id: number;
  documento_tipo_id: number;
  genero_id: number;
  ubigeo_nacimiento_id: number;
  domicilio_ubigeo_id: number;
  documento_numero: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  genero: string;
  celular_primario: string;
  celular_secundario: string | null;
  correo_primario: string;
  correo_secundario: string | null;
  domicilio: string;
  fecha_nacimiento: string; // ISO String
  persona_estado_id: number;
  grado_id: number;
  grado: string | null;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role?: string;
};


// --- Tipos para Asistencia y Reportes ---

export type Attendance = {
  id: number;
  estudiante_id: number;
  nombres: string;
  grado_descripcion: string;
  seccion_descripcion: string;
  fecha_hora: string; // ISO 8601 string
  estado: 'Presente' | 'Ausente' | 'Tardanza';
};

export type AttendanceReport = {
  id: number;
  studentName: string;
  gradeName: string;
  report_date: string;
  total_classes: number;
  attended_classes: number;
  absent_classes: number;
  attendance_percentage: number;
};


// --- Tipos para Estadísticas del Dashboard ---

export type TodayAttendanceByGrade = {
  gradeName: string;
  presentes: number;
  ausentes: number;
};

export type DashboardStats = {
  totalPersons: number;
  totalGrades: number;
  totalPresentToday: number;
  totalAbsentToday: number;
  recentAttendance: Attendance[];
  todayAttendanceByGrade: TodayAttendanceByGrade[];
};


// --- Esquemas de Validación con Zod ---

export const personaCompletaSchema = z.object({
  id: z.number().optional(),
  documento_tipo_id: z.coerce.number({invalid_type_error: 'Seleccione un tipo de documento'}).min(1, 'Seleccione un tipo de documento'),
  genero_id: z.coerce.number({invalid_type_error: 'Seleccione un género'}).min(1, 'Seleccione un género'),
  grado_id: z.coerce.number({invalid_type_error: 'Seleccione un grado'}).min(1, 'Seleccione un grado'),
  ubigeo_nacimiento_id: z.coerce.number({invalid_type_error: 'Seleccione un ubigeo de nacimiento'}).min(1, 'Seleccione un ubigeo de nacimiento'),
  domicilio_ubigeo_id: z.coerce.number({invalid_type_error: 'Seleccione un ubigeo de domicilio'}).min(1, 'Seleccione un ubigeo de domicilio'),
  documento_numero: z.string().min(8, 'El número de documento es requerido'),
  apellido_paterno: z.string().min(2, 'El apellido paterno es requerido'),
  apellido_materno: z.string().min(2, 'El apellido materno es requerido'),
  nombres: z.string().min(2, 'El nombre es requerido'),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'El formato debe ser YYYY-MM-DD'),
  celular_primario: z.string().min(9, 'El celular es requerido'),
  celular_secundario: z.string().optional().or(z.literal('')),
  correo_primario: z.string().email('El correo es inválido'),
  correo_secundario: z.string().email('El correo secundario es inválido').optional().or(z.literal('')),
  domicilio: z.string().min(5, 'El domicilio es requerido'),
  persona_estado_id: z.coerce.number({invalid_type_error: 'Seleccione un estado'}).min(0, { message: 'Seleccione un estado' }),
});

export type PersonaCompletaFormValues = z.infer<typeof personaCompletaSchema>;


export const studentEnrollmentSchema = z.object({
  persona_id: z.number(),
  anio_academico_id: z.coerce.number().min(1, 'El año académico es requerido.'),
  grado_id: z.coerce.number({invalid_type_error: 'Seleccione un grado'}).min(1, 'El grado es requerido.'),
  seccion_id: z.coerce.number({invalid_type_error: 'Seleccione una sección'}).min(1, 'La sección es requerida.'),
  seguro_id: z.coerce.number().min(1, 'El seguro es requerido.'),
  celular_emergencia: z.string().min(9, 'El celular de emergencia es requerido.'),
  codigo: z.string().min(1, 'El código de estudiante es requerido.'),
  observacion: z.string().optional().or(z.literal('')),
});

export type StudentEnrollmentFormValues = z.infer<typeof studentEnrollmentSchema>;


export const sectionSchema = z.object({
  id: z.number().optional(),
  grado_id: z.coerce.number({ invalid_type_error: 'ID de grado es requerido.' }).min(1, 'ID de grado es requerido.'),
  turno_id: z.coerce.number({ invalid_type_error: 'ID de turno es requerido.' }).min(1, 'ID de turno es requerido.'),
  tutor_personal_id: z.coerce.number({ invalid_type_error: 'ID de tutor es requerido.' }).min(1, 'ID de tutor es requerido.'),
  seccion_tipo_id: z.coerce.number({ invalid_type_error: 'ID de tipo de sección es requerido.' }).min(1, 'ID de tipo de sección es requerido.'),
  nombre: z.string().min(1, { message: 'El nombre de la sección es requerido.' }),
  vacantes_total: z.coerce.number({ invalid_type_error: 'El total de vacantes es requerido.' }).min(1, 'Debe haber al menos una vacante.'),
  aula: z.string().min(1, { message: 'El nombre del aula es requerido.' }),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;


export const gradeSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, { message: "El nombre del grado es requerido y debe tener al menos 3 caracteres." }),
  descripcion: z.string().optional().or(z.literal('')),
});

export type GradeFormValues = z.infer<typeof gradeSchema>;


export const academicYearGradeAssignmentSchema = z.object({
  anio_academico_id: z.coerce.number().min(1, 'Debes seleccionar un año académico.'),
  grado_ids: z.array(z.number()).min(1, 'Debes seleccionar al menos un grado.'),
});

export type AcademicYearGradeAssignmentFormValues = z.infer<typeof academicYearGradeAssignmentSchema>;


export const periodSchema = z.object({
    id: z.number().optional(),
    anio_academico_id: z.coerce.number({ invalid_type_error: 'Selecciona un año académico.'}).min(1, 'Selecciona un año académico.'),
    nombre: z.string().min(3, 'El nombre es requerido.'),
    fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD).'),
    fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD).'),
});

export type PeriodFormValues = z.infer<typeof periodSchema>;


// Re-export Zod for use in other files
export { z };
