
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

export async function POST(request: Request) {
  try {
    const { studentId, codigo } = await request.json();
    const id = studentId || codigo; // Aceptar ambos para compatibilidad

    if (!id) {
      return NextResponse.json({ message: 'Falta el ID del estudiante (studentId o codigo)' }, { status: 400 });
    }

    // 1. Verificar si el estudiante existe y obtener sus datos.
    const studentResponse = await fetch(`${EXTERNAL_API_BASE_URL}/api/estudiante/consultar/${id}`);
    if (!studentResponse.ok) {
      // Si la respuesta no es 200, podría ser un 404 u otro error del servidor externo
      const errorData = await studentResponse.json().catch(() => null);
      const message = errorData?.message || `Estudiante con ID ${id} no encontrado`;
      return NextResponse.json({ message }, { status: studentResponse.status });
    }
    const studentData = await studentResponse.json();
    if (studentData.success !== 1 || !studentData.data) {
       return NextResponse.json({ message: `Estudiante con ID ${id} no encontrado` }, { status: 404 });
    }
    const student = studentData.data;

    // 2. Verificar si el estudiante tiene una sección asignada.
    if (!student.seccion_id || !student.grado) {
        return NextResponse.json({ message: `El estudiante ${student.nombres} no está inscrito en ninguna sección.` }, { status: 400 });
    }

    // 3. Verificar si ya hay un registro de asistencia para hoy.
    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');
    const attendanceCheckUrl = `${EXTERNAL_API_BASE_URL}/api/asistencia/obtener-reporte-dia?fecha=${todayFormatted}&index=0&cantidad=1000`;
    const attendanceResponse = await fetch(attendanceCheckUrl);
    const attendanceData = await attendanceResponse.json();

    if (attendanceData.success === 1 && Array.isArray(attendanceData.data)) {
        const existingAttendance = attendanceData.data.find((att: any) => att.estudiante_id === student.id);
        if (existingAttendance) {
            return NextResponse.json({ message: `El estudiante ${student.nombres} ya tiene la asistencia registrada para hoy.` }, { status: 409 });
        }
    }

    // 4. Registrar la asistencia.
    const recordAttendanceUrl = `${EXTERNAL_API_BASE_URL}/api/asistencia/registrar`;
    const registrationPayload = {
        estudiante_id: student.id,
        fecha: todayFormatted,
        hora_ingreso: format(today, 'HH:mm:ss'),
        asistencia_estado_id: 1, // 1 para 'Presente' (asumiendo)
    };

    const recordResponse = await fetch(recordAttendanceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
    });
    
    if (!recordResponse.ok) {
        const errorData = await recordResponse.json().catch(() => null);
        throw new Error(errorData?.message || "Error al registrar la asistencia en el sistema externo.");
    }
   
    const recordData = await recordResponse.json();
    
    return NextResponse.json({ message: recordData.message || `Asistencia registrada para ${student.nombres} en ${student.grado} "${student.seccion}"` });

  } catch (error) {
    console.error('Error en /api/attendance/scan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al registrar la asistencia', error: errorMessage }, { status: 500 });
  }
}
