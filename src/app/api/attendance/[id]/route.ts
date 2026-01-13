
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: 'Falta el ID del registro de asistencia' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/asistencia/eliminar/${id}`;
    
    const response = await fetch(externalApiUrl, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al eliminar el registro de asistencia.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error en DELETE /api/attendance/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
