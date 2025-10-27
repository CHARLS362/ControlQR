
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const externalApiUrl = `http://31.97.169.107:8093/api/grado/listar`;
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
        console.error('Error fetching from external API:', response.statusText);
        return NextResponse.json([], { status: 200 }); // Return empty array on external error
    }

    const responseData = await response.json();

    if (responseData.success === 1 && Array.isArray(responseData.data)) {
        return NextResponse.json(responseData.data);
    }
    
    console.warn('External API did not return a successful array:', responseData);
    return NextResponse.json([], { status: 200 });

  } catch (error) {
    console.error('Error en /api/grades:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
