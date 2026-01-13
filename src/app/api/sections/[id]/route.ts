
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sectionSchema } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validamos los datos incluyendo el id del body
    const validatedData = sectionSchema.parse({ ...body, id: Number(id) });

    const externalApiUrl = 'http://31.97.169.107:8093/api/seccion/actualizar';
    
    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al actualizar la sección.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en PUT /api/sections/${params.id}:`, error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Datos de formulario inválidos', errors: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ message: 'El ID de la sección es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/seccion/eliminar/${id}`;
    
    const response = await fetch(externalApiUrl, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al eliminar la sección.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en DELETE /api/sections/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
