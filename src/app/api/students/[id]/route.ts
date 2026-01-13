
import { NextResponse } from 'next/server';
import { studentEnrollmentSchema } from '@/lib/types';
import { z } from 'zod';

const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

// UPDATE (actualizar) un estudiante. El endpoint externo es para la inscripción, lo adaptamos.
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validamos los datos con el esquema de inscripción, que es el más cercano que tenemos
    const validatedData = studentEnrollmentSchema.parse(body);

    const externalApiUrl = `${EXTERNAL_API_BASE_URL}/api/estudiante/actualizar`;
    
    const payload = {
      ...validatedData,
      id: Number(id), // La API de actualización espera el ID del estudiante en el cuerpo
      usuario_modificacion: 1, // Asumimos admin
    };

    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al actualizar el estudiante.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(error);
     if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Datos de formulario inválidos', errors: error.errors }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al actualizar el estudiante', error: errorMessage }, { status: 500 });
  }
}

// DELETE (eliminar) un estudiante
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const externalApiUrl = `${EXTERNAL_API_BASE_URL}/api/estudiante/eliminar/${id}`;

    const response = await fetch(externalApiUrl, { method: 'DELETE' });
    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al eliminar el estudiante.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json({ message: `Estudiante con ID ${id} eliminado correctamente` });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al eliminar el estudiante', error: errorMessage }, { status: 500 });
  }
}
