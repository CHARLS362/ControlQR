
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data-service';
import type { NextRequest } from 'next/server'
import { z } from 'zod';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') as 'monthly' | 'weekly' | null;

    const stats = await getDashboardStats(range || 'monthly');
    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener las estadísticas del panel', error: errorMessage }, { status: 500 });
  }
}
