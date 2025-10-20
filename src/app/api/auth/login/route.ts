
import { NextResponse } from 'next/server';
import { validateUser } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'El correo electrónico y la contraseña son obligatorios' }, { status: 400 });
    }

    const user = await validateUser(email, password);

    if (!user) {
      return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
    }

    // En una aplicación real, aquí se generaría un token (JWT) y se enviaría en una cookie.
    // Por simplicidad, solo devolvemos los datos del usuario.
    return NextResponse.json(user);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error en el servidor', error: errorMessage }, { status: 500 });
  }
}
