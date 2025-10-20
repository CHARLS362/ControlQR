
import { NextResponse } from 'next/server';
import { getStudents } from '@/lib/data-service';

export async function GET() {
  try {
    const students = await getStudents();
    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener los estudiantes', error: errorMessage }, { status: 500 });
  }
}
