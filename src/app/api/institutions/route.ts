
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const externalApiUrl = `http://31.97.169.107:8093/api/institucion/listar`;
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
        console.error('Error fetching from external API:', response.statusText);
        return NextResponse.json({ message: 'Error desde la API externa de instituciones', details: await response.json() }, { status: response.status });
    }

    const responseData = await response.json();

    if (responseData.success === 1 && Array.isArray(responseData.data)) {
        return NextResponse.json(responseData.data);
    }
    
    return NextResponse.json([], { status: 200 });

  } catch (error) {
    console.error('Error en /api/institutions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
