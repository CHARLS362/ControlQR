
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Aquí podrías obtener el ID del usuario de la sesión o de un parámetro si fuera necesario
    const externalApiUrl = `http://31.97.169.107:8093/api/usuario/generar-token`;
    
    const response = await fetch(externalApiUrl);
    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: 'Error desde la API externa para generar token', details: responseData }, { status: response.status });
    }
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error en /api/user/generate-token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
