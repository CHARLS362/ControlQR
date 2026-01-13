
import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/asistencia/registrar';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // The frontend should send exactly what the external API expects:
    // { estudiante_id: number, fecha: string(YYYY-MM-DD), hora_ingreso: string(HH:mm:ss), asistencia_estado_id: number }
    
    // Basic validation
    if (!body.estudiante_id || !body.fecha || !body.hora_ingreso || !body.asistencia_estado_id) {
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

    // The API might return { success: 1, message: "..." } or error
    if (!response.ok) {
        return NextResponse.json(
            { message: responseData.message || 'Error al registrar la asistencia.' }, 
            { status: response.status || 400 }
        );
    }
    
    // Check logical success from API body
    if (responseData.success !== 1) {
         return NextResponse.json(
            { message: responseData.message || 'La API externa rechazó el registro.' }, 
            { status: 400 }
        );
    }
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error en /api/attendance/register:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
