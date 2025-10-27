
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

    if (!documento_tipo_id && !documento_numero && !nombres) {
        // No se proporcionan parámetros, devolvemos un array vacío para no sobrecargar la API externa
        return NextResponse.json([]);
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
    
    // Devolver siempre un array. Si la API devuelve { data: [...] }, usamos data.
    // Si la API devuelve [...] directamente, lo usamos.
    // En cualquier otro caso, devolvemos un array vacío para evitar errores en el frontend.
    const results = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error en /api/students/search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
