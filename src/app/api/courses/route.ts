
import { NextResponse } from 'next/server';
import { getCourses, createCourse } from '@/lib/data-service';
import { courseSchema } from '@/lib/types';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = courseSchema.parse(body);
    const newCourse = await createCourse(validatedData);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al crear el curso', error: errorMessage }, { status: 500 });
  }
}
