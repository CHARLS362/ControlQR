
import { NextResponse } from 'next/server';
import { getStudentById, getAttendanceForToday, recordAttendance } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json({ message: 'Faltan el ID del estudiante o el ID del curso' }, { status: 400 });
    }

    // 1. Verificar si el estudiante existe
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ message: `Estudiante con ID ${studentId} no encontrado` }, { status: 404 });
    }

    // 2. Verificar si ya hay un registro de asistencia para hoy
    const existingAttendance = await getAttendanceForToday(studentId, courseId);
    if (existingAttendance) {
      return NextResponse.json({ message: `El estudiante ${student.name} ya tiene la asistencia registrada para hoy` }, { status: 409 }); // 409 Conflict
    }

    // 3. Insertar el registro de asistencia
    await recordAttendance(studentId, courseId, 'Presente');

    return NextResponse.json({ message: `Asistencia registrada para ${student.name}` });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al registrar la asistencia', error: errorMessage }, { status: 500 });
  }
}
