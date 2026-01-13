
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('id');
    const docNumber = searchParams.get('doc');

    if (!studentId && !docNumber) {
      return NextResponse.json({ message: 'El parámetro de búsqueda "id" o "doc" es requerido' }, { status: 400 });
    }
    
    // La API externa de consulta parece aceptar diferentes tipos de identificadores en la misma ruta
    const searchTerm = studentId || docNumber;

    const externalApiUrl = `http://31.97.169.107:8093/api/estudiante/consultar/${searchTerm}`;
    const response = await fetch(externalApiUrl);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido en la API externa."}));
        return NextResponse.json({ message: 'Error desde la API externa', details: errorData }, { status: response.status });
    }

    const responseData = await response.json();
    
    // Si la API tiene éxito pero no encuentra datos, puede devolver `data: null`
    if (responseData.success === 1 && responseData.data) {
        return NextResponse.json(responseData.data);
    } else {
        return NextResponse.json({ message: responseData.message || 'Estudiante no encontrado.' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error en /api/students/search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}

    