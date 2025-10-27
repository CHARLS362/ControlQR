
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: 'Falta el ID del estudiante' }, { status: 400 });
    }

    const externalApiUrl = `${EXTERNAL_API_BASE_URL}/api/estudiante/consultar/${id}`;
    
    const response = await fetch(externalApiUrl, {
        headers: {
            'Accept': 'application/json',
        }
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1 || !responseData.data) {
      return NextResponse.json({ message: 'Error desde la API externa o estudiante no encontrado', details: responseData }, { status: response.status });
    }
    
    // La API externa envuelve los datos en un objeto "data", lo extraemos.
    return NextResponse.json(responseData.data);

  } catch (error) {
    console.error('Error en /api/students/details/[id]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
