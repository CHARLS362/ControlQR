
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // El frontend ya ha validado los datos con Zod.
    // Este endpoint ahora actúa puramente como un proxy.

    const externalApiUrl = 'http://31.97.169.107:8093/api/persona/registrar-datos-completos';
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Si la API externa devuelve un error, lo reenviamos al cliente
      return NextResponse.json({ message: 'Error desde la API externa', details: responseData }, { status: response.status });
    }

    // Si todo fue bien, reenviamos la respuesta exitosa de la API externa
    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error en /api/person/register:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
