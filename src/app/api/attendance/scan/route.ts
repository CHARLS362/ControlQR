
import { NextResponse } from 'next/server';
import { getStudentById, getAttendanceForToday, recordAttendance } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ message: 'Falta el ID del estudiante' }, { status: 400 });
    }

    // 1. Verificar si el estudiante existe y obtener sus datos, incluyendo el curso.
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ message: `Estudiante con ID ${studentId} no encontrado` }, { status: 404 });
    }

    // 2. Verificar si el estudiante tiene un curso asignado.
    if (!student.courseId || !student.courseName) {
        return NextResponse.json({ message: `El estudiante ${student.name} no está inscrito en ningún curso.` }, { status: 400 });
    }
    const courseId = student.courseId;
    const courseName = student.courseName;

    // 3. Verificar si ya hay un registro de asistencia para hoy en ese curso.
    const existingAttendance = await getAttendanceForToday(studentId, courseId);
    if (existingAttendance) {
      return NextResponse.json({ message: `El estudiante ${student.name} ya tiene la asistencia registrada para hoy en el curso ${courseName}` }, { status: 409 }); // 409 Conflict
    }

    // 4. Insertar el registro de asistencia.
    await recordAttendance(studentId, courseId, 'Presente');

    return NextResponse.json({ message: `Asistencia registrada para ${student.name} en ${courseName}` });

  } catch (error) {
    console.error('Error en /api/attendance/scan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al registrar la asistencia', error: errorMessage }, { status: 500 });
  }
}
