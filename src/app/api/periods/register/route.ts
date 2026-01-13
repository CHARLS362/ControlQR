
import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/periodo/registrar';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Required fields: anio_academico_id, nombre, fecha_inicio, fecha_fin
    if (!body.anio_academico_id || !body.nombre || !body.fecha_inicio || !body.fecha_fin) {
      return NextResponse.json({ message: 'Todos los campos son requeridos.' }, { status: 400 });
    }

    const response = await fetch(EXTERNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: responseData.message || 'Error al registrar el periodo.' },
        { status: response.status || 400 }
      );
    }

    if (responseData.success !== 1) {
      return NextResponse.json(
        { message: responseData.message || 'La API externa rechazó el registro.' },
        { status: 400 }
      );
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error en /api/periods/register:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
