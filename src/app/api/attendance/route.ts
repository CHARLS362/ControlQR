
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const indexParam = searchParams.get('index') || '0';
    const limitParam = searchParams.get('limit') || '1000';

    const date = dateParam || format(new Date(), 'yyyy-MM-dd');

    // Construct URL with dynamic parameters
    const url = `${EXTERNAL_API_BASE_URL}/api/asistencia/obtener-reporte-dia?fecha=${date}&index=${indexParam}&cantidad=${limitParam}`;

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await response.json();

    if (data.success === 1 && Array.isArray(data.data)) {
      return NextResponse.json(data.data);
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error('Error en /api/attendance:', error);
    return NextResponse.json([], { status: 500 });
  }
}
