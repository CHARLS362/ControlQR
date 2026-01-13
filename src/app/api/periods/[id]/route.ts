
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { periodSchema } from '@/lib/types';

// GET para listar periodos por anio_academico_id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const anioAcademicoId = params.id;
    if (!anioAcademicoId) {
      return NextResponse.json({ message: 'El parámetro anio_academico_id es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/periodo/listar/${anioAcademicoId}`;
    const response = await fetch(externalApiUrl);

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      return NextResponse.json({ message: 'Error desde la API externa de periodos', details: responseData }, { status: response.status });
    }
    
    return NextResponse.json(responseData.data || []);

  } catch (error) {
    console.error('Error en /api/periods/[id] (GET):', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}


// PUT para actualizar un periodo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    const validatedData = periodSchema.parse({ ...body, id: Number(id) });

    const externalApiUrl = 'http://31.97.169.107:8093/api/periodo/actualizar';
    
    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al actualizar el periodo.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en PUT /api/periods/${params.id}:`, error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Datos de formulario inválidos', errors: error.errors }, { status: 400 });
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}

// DELETE para eliminar un periodo
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ message: 'El ID del periodo es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/periodo/eliminar/${id}`;
    
    const response = await fetch(externalApiUrl, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al eliminar el periodo.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en DELETE /api/periods/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
