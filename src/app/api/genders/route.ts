import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const externalApiUrl = `http://31.97.169.107:8093/api/genero/listar-generos`;
    const response = await fetch(externalApiUrl);

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      return NextResponse.json({ message: 'Error desde la API externa de géneros', details: responseData }, { status: response.status });
    }
    
    // La API externa envuelve los datos en un objeto "data", lo extraemos.
    return NextResponse.json(responseData.data || []);

  } catch (error) {
    console.error('Error en /api/genders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
