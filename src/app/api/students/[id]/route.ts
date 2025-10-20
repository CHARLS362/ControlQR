
import { NextResponse } from 'next/server';
import { updateStudent, deleteStudent } from '@/lib/data-service';
import { studentSchema } from '@/lib/types';

// UPDATE a student
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const validatedData = studentSchema.parse(body);

    const updatedStudent = await updateStudent(id, validatedData);

    return NextResponse.json(updatedStudent);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al actualizar el estudiante', error: errorMessage }, { status: 500 });
  }
}

// DELETE a student
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await deleteStudent(id);
    return NextResponse.json({ message: `Estudiante con ID ${id} eliminado correctamente` });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al eliminar el estudiante', error: errorMessage }, { status: 500 });
  }
}
