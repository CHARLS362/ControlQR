
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { format } from 'date-fns';

// Este endpoint ahora se mapea a /obtener-reporte-dia por defecto
export async function GET(request: NextRequest) {
  try {
    // Tomamos la fecha actual como default
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Parámetros de paginación por defecto, se pueden extender para que vengan del cliente
    const index = 0; 
    const cantidad = 50; 

    const externalApiUrl = `http://31.97.169.107:8093/api/asistencia/obtener-reporte-dia?fecha=${today}&index=${index}&cantidad=${cantidad}`;
    
    const response = await fetch(externalApiUrl);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido en la API externa."}));
        return NextResponse.json({ message: 'Error desde la API externa de asistencia', details: errorData }, { status: response.status });
    }

    const responseData = await response.json();
    
    if (responseData.success === 1 && Array.isArray(responseData.data)) {
        return NextResponse.json(responseData.data);
    } else {
        return NextResponse.json([]);
    }

  } catch (error) {
    console.error('Error en /api/attendance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en el servidor proxy';
    return NextResponse.json({ message: 'Error interno del servidor', error: errorMessage }, { status: 500 });
  }
}
