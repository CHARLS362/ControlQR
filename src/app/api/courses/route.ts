
import { NextResponse } from 'next/server';
import { getCourses } from '@/lib/data-service';

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener los cursos', error: errorMessage }, { status: 500 });
  }
}
