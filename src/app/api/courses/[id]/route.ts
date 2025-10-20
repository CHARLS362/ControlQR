
import { NextResponse } from 'next/server';
import { updateCourse, deleteCourse, getCourses } from '@/lib/data-service';
import { courseSchema } from '@/lib/types';

// UPDATE a course
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    await updateCourse(id, validatedData);

    return NextResponse.json({ message: 'Curso actualizado correctamente' });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al actualizar el curso', error: errorMessage }, { status: 500 });
  }
}

// DELETE a course
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await deleteCourse(id);
    return NextResponse.json({ message: `Curso con ID ${id} eliminado correctamente` });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al eliminar el curso', error: errorMessage }, { status: 500 });
  }
}
