
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { gradeId: string } }
) {
  try {
    const gradeId = params.gradeId;
    if (!gradeId) {
      return NextResponse.json({ message: 'El parámetro gradeId es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/seccion/listar?grado_id=${gradeId}`;
    const response = await fetch(externalApiUrl);

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      return NextResponse.json({ message: 'Error desde la API externa de secciones', details: responseData }, { status: response.status });
    }
    
    return NextResponse.json(responseData.data || []);

  } catch (error) {
    console.error('Error en /api/sections/[gradeId]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
