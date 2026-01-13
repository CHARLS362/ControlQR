
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const index = 0;
    const cantidad = 10;

    const externalApiUrl = `http://31.97.169.107:8093/api/asistencia/obtener-reporte-dia?fecha=${today}&index=${index}&cantidad=${cantidad}`;
    
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido en la API externa."}));
        return NextResponse.json({ message: 'Error desde la API externa de reporte diario', details: errorData }, { status: response.status });
    }

    const responseData = await response.json();
    
    if (responseData.success === 1 && Array.isArray(responseData.data)) {
        return NextResponse.json(responseData.data);
    } else {
        // Si la API tiene éxito pero no devuelve datos o el formato es incorrecto, devolver un array vacío.
        return NextResponse.json([]);
    }

  } catch (error) {
    console.error('Error en /api/attendance/daily-report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
