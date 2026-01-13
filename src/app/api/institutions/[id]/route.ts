
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { institutionSchema } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ message: 'El ID de la institución es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/institucion/obtener/${id}`;
    
    const response = await fetch(externalApiUrl);

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al obtener la institución.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData.data, { status: 200 });

  } catch (error) {
    console.error(`Error en GET /api/institutions/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    const validatedData = institutionSchema.parse({ ...body, id: Number(id) });

    const externalApiUrl = 'http://31.97.169.107:8093/api/institucion/actualizar';
    
    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al actualizar la institución.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en PUT /api/institutions/${params.id}:`, error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Datos de formulario inválidos', errors: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
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
        return NextResponse.json({ message: 'El ID de la institución es requerido' }, { status: 400 });
    }

    // Asumiendo que el endpoint de eliminar sigue el mismo patrón que los demás.
    const externalApiUrl = `http://31.97.169.107:8093/api/institucion/eliminar/${id}`;
    
    const response = await fetch(externalApiUrl, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al eliminar la institución.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en DELETE /api/institutions/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
