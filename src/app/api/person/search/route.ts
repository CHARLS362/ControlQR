import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Construir los parámetros de consulta para la API externa
    const query = new URLSearchParams();
    
    const name = searchParams.get('nombres');
    const docType = searchParams.get('documento_tipo_id');
    const docNumber = searchParams.get('documento_numero');

    if (name) {
      query.append('nombres', name);
    }
    if (docType) {
      query.append('documento_tipo_id', docType);
    }
    if (docNumber) {
      query.append('documento_numero', docNumber);
    }
    
    if (query.toString() === '') {
        return NextResponse.json({ message: 'Se requiere al menos un parámetro de búsqueda.' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/persona/buscar-persona?${query.toString()}`;
    const response = await fetch(externalApiUrl);

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: 'Error desde la API externa', details: responseData }, { status: response.status });
    }
    
    // La API externa envuelve los datos en un objeto "data", lo extraemos.
    return NextResponse.json(responseData.data || []);

  } catch (error) {
    console.error('Error en /api/person/search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
