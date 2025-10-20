
import { NextResponse } from 'next/server';
import { getAttendance } from '@/lib/data-service';

export async function GET() {
  try {
    const attendance = await getAttendance();
    return NextResponse.json(attendance);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener la asistencia', error: errorMessage }, { status: 500 });
  }
}
