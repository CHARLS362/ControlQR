
import { NextResponse } from 'next/server';
import { getStudents, createStudent } from '@/lib/data-service';
import { studentSchema } from '@/lib/types';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = studentSchema.parse(body);
    const newStudent = await createStudent(validatedData);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al crear el estudiante', error: errorMessage }, { status: 500 });
  }
}
