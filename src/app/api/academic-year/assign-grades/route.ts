
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { academicYearGradeAssignmentSchema } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar los datos con Zod antes de enviarlos
    const validatedData = academicYearGradeAssignmentSchema.parse(body);

    const externalApiUrl = 'http://31.97.169.107:8093/api/grado/registrar-grado-academico';
    
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      // Si la API externa devuelve un error, lo reenviamos al cliente
      const errorMessage = responseData.message || 'Error al asignar grados al año académico.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    // Si todo fue bien, reenviamos la respuesta exitosa de la API externa
    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error en /api/academic-year/assign-grades:', error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Datos de formulario inválidos', errors: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
