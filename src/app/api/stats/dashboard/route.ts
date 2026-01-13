
import { NextResponse } from 'next/server';
import { format } from 'date-fns';

const EXTERNAL_API_BASE_URL = 'http://31.97.169.107:8093';

// Helper para hacer fetch y parsear JSON, manejando errores de red
async function fetchFromApi(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching ${url}: Status ${response.status}`);
            return { success: 0, data: null, message: `API externa devolvió status ${response.status}` };
        }
        return await response.json();
    } catch (error) {
        console.error(`Network error fetching ${url}:`, error);
        return { success: 0, data: null, message: 'Error de red' };
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


        // 3. Contar personas (simulado)
        const totalPersons = 150;

        // 4. Calcular asistencia (Simplificado para evitar sobrecarga de API)
        // El cálculo exacto de ausentes requiere iterar todas las secciones y estudiantes,
        // lo cual es demasiado lento para el dashboard. Por ahora nos enfocamos en los presentes.
        const totalPresentToday = recentAttendance.filter(att => att.estado === 'Presente').length;
        const totalAbsentToday = 0; // Se requiere un endpoint de conteo total optimizado para esto.


        // 5. Calcular asistencia por grado (Solo presentes por ahora)
        const attendanceByGrade = allGrades.map((grade: any) => {
            const gradePresentCount = recentAttendance.filter((att: any) => att.grado_descripcion === grade.nombre && att.estado === 'Presente').length;

            return {
                gradeName: grade.nombre,
                presentes: gradePresentCount,
                ausentes: 0
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
