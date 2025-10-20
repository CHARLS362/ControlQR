
import { NextResponse } from 'next/server';
import { getStudentById, getAttendanceForToday, recordAttendance, getCourses } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ message: 'Falta el ID del estudiante' }, { status: 400 });
    }

    // 1. Verificar si el estudiante existe
    const student = await getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ message: `Estudiante con ID ${studentId} no encontrado` }, { status: 404 });
    }

    // 2. Obtener cursos y asumir el primero.
    // Esta es una solución temporal. Lo ideal sería que el QR contuviera el ID del curso
    // o que hubiera una lógica más compleja para determinar el curso (ej: el curso actual por horario).
    const courses = await getCourses();
    if (!courses || courses.length === 0) {
        return NextResponse.json({ message: 'No hay cursos configurados en el sistema.' }, { status: 500 });
    }
    const courseId = courses[0].id;
    const courseName = courses[0].name;

    // 3. Verificar si ya hay un registro de asistencia para hoy en ese curso
    const existingAttendance = await getAttendanceForToday(studentId, String(courseId));
    if (existingAttendance) {
      return NextResponse.json({ message: `El estudiante ${student.name} ya tiene la asistencia registrada para hoy en el curso ${courseName}` }, { status: 409 }); // 409 Conflict
    }

    // 4. Insertar el registro de asistencia
    await recordAttendance(studentId, String(courseId), 'Presente');

    return NextResponse.json({ message: `Asistencia registrada para ${student.name} en ${courseName}` });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al registrar la asistencia', error: errorMessage }, { status: 500 });
  }
}
