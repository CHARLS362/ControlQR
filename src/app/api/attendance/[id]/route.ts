
import { NextResponse } from 'next/server';
import { deleteAttendanceRecord } from '@/lib/data-service';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: 'Falta el ID del registro' }, { status: 400 });
    }

    await deleteAttendanceRecord(id);

    return NextResponse.json({ message: `Registro con ID ${id} eliminado correctamente` });

  } catch (error) {
    console.error('Error en DELETE /api/attendance/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al eliminar el registro', error: errorMessage }, { status: 500 });
  }
}
