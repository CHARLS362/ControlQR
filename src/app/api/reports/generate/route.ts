
import { NextResponse } from 'next/server';
import { generateReportForCourse } from '@/lib/data-service';

export async function POST(request: Request) {
  try {
    const { courseId, reportDate } = await request.json();

    if (!courseId || !reportDate) {
      return NextResponse.json({ message: 'Faltan el ID del curso y la fecha del reporte' }, { status: 400 });
    }

    // Aquí asumimos que "generated_by" es un valor fijo o vendría de la sesión del usuario
    const generatedBy = 'Admin'; 

    const newReport = await generateReportForCourse(courseId, reportDate, generatedBy);

    return NextResponse.json(newReport, { status: 201 });

  } catch (error) {
    console.error('Error al generar el reporte:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('ER_DUP_ENTRY')) {
        return NextResponse.json({ message: 'Ya existe un reporte para este curso en la fecha seleccionada.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Error al generar el reporte', error: errorMessage }, { status: 500 });
  }
}
