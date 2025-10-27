
import { NextResponse } from 'next/server';
import { personaCompletaSchema } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // El frontend ya ha validado los datos con Zod.
    // Este endpoint actúa como un proxy para la actualización.
    // Incluimos el ID en el cuerpo de la solicitud para la API externa.
    const payload = { ...body, id: Number(id) };

    const externalApiUrl = 'http://31.97.169.107:8093/api/persona/actualizar-datos';
    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: 'Error desde la API externa', details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en PUT /api/person/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
