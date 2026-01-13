
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { gradeSchema } from '@/lib/types';

// GET para listar grados por anio_academico_id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const anioAcademicoId = params.id;
    if (!anioAcademicoId) {
      return NextResponse.json({ message: 'El ID del año académico es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/grado/listar/${anioAcademicoId}`;
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
      console.error(`Error fetching grades for year ${anioAcademicoId}:`, response.statusText);
      return NextResponse.json([], { status: 200 }); // Return empty on error
    }

    const responseData = await response.json();

    // Check strict success
    if (responseData.success === 1 && Array.isArray(responseData.data)) {
      return NextResponse.json(responseData.data);
    }

    // Sometimes API returns success but empty data, or failure if ID not found
    return NextResponse.json(Array.isArray(responseData.data) ? responseData.data : [], { status: 200 });

  } catch (error) {
    console.error(`Error en GET /api/grades/${params.id}:`, error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const validatedData = gradeSchema.parse({ ...body, id: Number(id) });

    const externalApiUrl = 'http://31.97.169.107:8093/api/grado/actualizar';

    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al actualizar el grado.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en PUT /api/grades/${params.id}:`, error);

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
      return NextResponse.json({ message: 'El ID del grado es requerido' }, { status: 400 });
    }

    const externalApiUrl = `http://31.97.169.107:8093/api/grado/eliminar/${id}`;

    const response = await fetch(externalApiUrl, {
      method: 'DELETE',
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== 1) {
      const errorMessage = responseData.message || 'Error al eliminar el grado.';
      return NextResponse.json({ message: errorMessage, details: responseData }, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error(`Error en DELETE /api/grades/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
