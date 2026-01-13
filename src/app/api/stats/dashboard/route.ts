
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data-service';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener las estadísticas del panel', error: errorMessage }, { status: 500 });
  }
}
