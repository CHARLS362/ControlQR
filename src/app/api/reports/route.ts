
import { NextResponse } from 'next/server';

// Este endpoint debería listar los reportes generados.
// Como la API externa no parece tener un concepto de "reportes guardados",
// este endpoint no tiene una fuente de datos clara.
// Lo mantenemos devolviendo un array vacío para no romper el frontend.
export async function GET() {
  try {
    // Simular una respuesta vacía ya que no hay un endpoint equivalente en la API externa.
    const reports: any[] = [];
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error al obtener los reportes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener los reportes', error: errorMessage }, { status: 500 });
  }
}
