
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/estudiante/listar-grado-seccion';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sectionId = searchParams.get('sectionId');
    
    if (!sectionId) {
        return NextResponse.json({ message: 'El parámetro sectionId es requerido' }, { status: 400 });
    }

    const externalApiUrl = `${EXTERNAL_API_URL}?seccion_id=${sectionId}`;
    
    const response = await fetch(externalApiUrl, {
        headers: {
            'Accept': 'application/json',
        }
    });

    if (!response.ok) {
      console.error('Error desde la API externa de estudiantes:', await response.text());
      return NextResponse.json([], { status: 200 }); // Devuelve array vacío si hay error
    }
    
    const responseData = await response.json();
    const results = Array.isArray(responseData.data) ? responseData.data : [];

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error en GET /api/students:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
