
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

// Helper para hacer fetch y parsear JSON, manejando errores de red
async function fetchFromApi(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching ${url}: Status ${response.status}`);
            return { success: 0, data: null, message: `API externa devolvió status ${response.status}`};
        }
        return await response.json();
    } catch (error) {
        console.error(`Network error fetching ${url}:`, error);
        return { success: 0, data: null, message: 'Error de red'};
    }
}


export async function GET() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    // 1. Obtener los registros de asistencia de hoy
    const attendanceData = await fetchFromApi(`${EXTERNAL_API_BASE_URL}/api/asistencia/obtener-reporte-dia?fecha=${today}&index=0&cantidad=1000`);
    const recentAttendance = (attendanceData.success === 1 && Array.isArray(attendanceData.data)) ? attendanceData.data : [];
    
    // 2. Obtener la lista de todos los grados
    const gradesData = await fetchFromApi(`${EXTERNAL_API_BASE_URL}/api/grado/listar`);
    const allGrades = (gradesData.success === 1 && Array.isArray(gradesData.data)) ? gradesData.data : [];

    // 3. Contar personas (simulado, ya que no hay un endpoint de conteo total)
    // Para una aproximación, podríamos contar los estudiantes de todas las secciones, pero sería lento.
    // Usaremos un valor estático por ahora.
    const totalPersons = 150; 
    
    // 4. Calcular el total de estudiantes inscritos y las ausencias
    let totalEnrolledStudents = 0;
    const studentsByGradeSection: { [key: string]: any[] } = {};

    for(const grade of allGrades) {
        const sectionsData = await fetchFromApi(`${EXTERNAL_API_BASE_URL}/api/seccion/listar?grado_id=${grade.id}`);
        if(sectionsData.success === 1 && Array.isArray(sectionsData.data)) {
            for(const section of sectionsData.data) {
                const studentsData = await fetchFromApi(`${EXTERNAL_API_BASE_URL}/api/estudiante/listar-grado-seccion?seccion_id=${section.id}`);
                if (studentsData.success === 1 && Array.isArray(studentsData.data)) {
                    totalEnrolledStudents += studentsData.data.length;
                    const key = `${grade.nombre} - ${section.nombre}`;
                    studentsByGradeSection[key] = studentsData.data;
                }
            }
        }
    }

    const totalPresentToday = recentAttendance.filter(att => att.estado === 'Presente').length;
    const totalAbsentToday = totalEnrolledStudents - totalPresentToday;

    // 5. Calcular asistencia por grado
    const attendanceByGrade = allGrades.map(grade => {
        const gradeStudentsCount = Object.entries(studentsByGradeSection)
            .filter(([key]) => key.startsWith(grade.nombre))
            .reduce((acc, [, students]) => acc + students.length, 0);

        const gradePresentCount = recentAttendance.filter(att => att.grado_descripcion === grade.nombre && att.estado === 'Presente').length;
        
        return {
            gradeName: grade.nombre,
            presentes: gradePresentCount,
            ausentes: Math.max(0, gradeStudentsCount - gradePresentCount)
        };
    });

    const stats = {
      totalPersons: totalPersons,
      totalGrades: allGrades.length,
      totalPresentToday: totalPresentToday,
      totalAbsentToday: Math.max(0, totalAbsentToday),
      recentAttendance: recentAttendance.slice(0, 5),
      todayAttendanceByGrade: attendanceByGrade,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error en GET /api/stats/dashboard:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'Error al obtener las estadísticas del panel', error: errorMessage }, { status: 500 });
  }
}
