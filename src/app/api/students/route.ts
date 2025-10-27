
import { NextResponse } from 'next/server';
import { createStudent } from '@/lib/data-service';
import { studentSchema } from '@/lib/types';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/estudiante/consultar';

export async function GET() {
  try {
    const response = await fetch(EXTERNAL_API_URL, {
        headers: {
            'Accept': 'application/json',
        }
    });

    if (!response.ok) {
      // Si la API externa falla, no propagamos el error al cliente.
      // Simplemente registramos el error en el servidor y devolvemos un array vacío.
      console.error('Error desde la API externa de estudiantes:', await response.text());
      return NextResponse.json([]);
    }
    
    const responseData = await response.json();

    // Devolver siempre un array. Si la API devuelve { data: [...] }, usamos data.
    // Si la API devuelve [...] directamente, lo usamos.
    // En cualquier otro caso, devolvemos un array vacío para evitar errores en el frontend.
    const results = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error en GET /api/students:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = studentSchema.parse(body);
    const newStudent = await createStudent(validatedData);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al crear el estudiante', error: errorMessage }, { status: 500 });
  }
}
