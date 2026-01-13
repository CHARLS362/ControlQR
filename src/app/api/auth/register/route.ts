
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'El nombre de usuario y la contraseña son obligatorios' }, { status: 400 });
    }

    const externalApiUrl = 'http://31.97.169.107:8093/api/usuario/registrar-usuario';
    
    const apiRequestBody = {
      persona_id: 0,
      usuario: username,
      password: password,
    };

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      // Si la API externa devuelve un error, lo reenviamos al cliente
      const errorMessage = responseData.message || 'Error al registrar el usuario en el sistema externo.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    // Si todo fue bien, reenviamos la respuesta exitosa de la API externa
    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
