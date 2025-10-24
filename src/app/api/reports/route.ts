
import { NextResponse } from 'next/server';
import { getAttendanceReports } from '@/lib/data-service';

export async function GET() {
  try {
    const reports = await getAttendanceReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error al obtener los reportes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener los reportes', error: errorMessage }, { status: 500 });
  }
}
