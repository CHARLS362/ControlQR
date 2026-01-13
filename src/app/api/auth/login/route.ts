
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // El frontend envía `email` como `usuario`.
    const { email: usuario, password } = await request.json();

    if (!usuario || !password) {
      return NextResponse.json({ message: 'El usuario y la contraseña son obligatorios' }, { status: 400 });
    }

    const externalApiUrl = 'http://31.97.169.107:8093/api/usuario/login-user';
    
    const apiRequestBody = {
      usuario: usuario,
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
      const errorMessage = responseData.message || 'Credenciales incorrectas.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    // Si todo fue bien, reenviamos la respuesta exitosa de la API externa
    // que debería contener los datos del usuario.
    return NextResponse.json(responseData.data, { status: 200 });

  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
