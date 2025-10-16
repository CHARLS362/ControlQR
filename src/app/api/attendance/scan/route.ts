
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json({ message: 'Faltan el ID del estudiante o el ID del curso' }, { status: 400 });
    }

    const connection = await getConnection();

    // 1. Verificar si el estudiante existe
    const [studentRows] = await connection.execute<RowDataPacket[]>(
      'SELECT name FROM students WHERE id = ?',
      [studentId]
    );

    if (studentRows.length === 0) {
      await connection.end();
      return NextResponse.json({ message: `Estudiante con ID ${studentId} no encontrado` }, { status: 404 });
    }
    const studentName = studentRows[0].name;

    // 2. Verificar si ya hay un registro de asistencia para hoy
    const today = new Date().toISOString().slice(0, 10);
    const [attendanceRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM attendance WHERE student_id = ? AND course_id = ? AND attendance_date = ?',
      [studentId, courseId, today]
    );

    if (attendanceRows.length > 0) {
      await connection.end();
      return NextResponse.json({ message: `El estudiante ${studentName} ya tiene la asistencia registrada para hoy` }, { status: 409 }); // 409 Conflict
    }

    // 3. Insertar el registro de asistencia
    await connection.execute(
      'INSERT INTO attendance (student_id, course_id, attendance_date, status) VALUES (?, ?, ?, ?)',
      [studentId, courseId, today, 'Presente']
    );

    await connection.end();

    return NextResponse.json({ message: `Asistencia registrada para ${studentName}` });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al registrar la asistencia', error: errorMessage }, { status: 500 });
  }
}
