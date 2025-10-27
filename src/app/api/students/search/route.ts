
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Asumimos que la URL base de la API externa es esta
const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documento_tipo_id = searchParams.get('documento_tipo_id');
    const documento_numero = searchParams.get('documento_numero');
    const nombres = searchParams.get('nombres');

    // Construir la URL para la API externa
    const externalApiUrl = new URL(`${EXTERNAL_API_BASE_URL}/api/estudiante/buscar`);
    
    // Añadir solo los parámetros que tienen valor
    if (documento_tipo_id) {
      externalApiUrl.searchParams.append('documento_tipo_id', documento_tipo_id);
    }
    if (documento_numero) {
      externalApiUrl.searchParams.append('documento_numero', documento_numero);
    }
    if (nombres) {
      externalApiUrl.searchParams.append('nombres', nombres);
    }

    // Si no se proporciona ningún parámetro, quizás queramos devolver un error o una lista vacía
    if (!documento_tipo_id && !documento_numero && !nombres) {
        // Por ahora, simplemente llamamos al endpoint sin parámetros,
        // asumiendo que podría devolver todos los estudiantes o una lista vacía.
        // O podríamos devolver un error:
        // return NextResponse.json({ message: 'Se requiere al menos un parámetro de búsqueda' }, { status: 400 });
    }

    const response = await fetch(externalApiUrl.toString(), {
        headers: {
            'Accept': 'application/json',
        }
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: 'Error desde la API externa de estudiantes', details: responseData }, { status: response.status });
    }
    
    // La API externa podría envolver los datos en un objeto "data"
    return NextResponse.json(responseData.data || responseData || []);

  } catch (error) {
    console.error('Error en /api/students/search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
