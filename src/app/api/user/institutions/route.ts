
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const externalApiUrl = `http://31.97.169.107:8093/api/usuario/listar-instituciones`;
    
    const response = await fetch(externalApiUrl);
    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: 'Error desde la API externa de instituciones', details: responseData }, { status: response.status });
    }
    
    return NextResponse.json(responseData.data || []);

  } catch (error) {
    console.error('Error en /api/user/institutions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
