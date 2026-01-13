
import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/anio-academico/actualizar';

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        // Ensure ID is present
        if (!body.id) {
            return NextResponse.json({ message: 'El ID del año académico es requerido para actualizar.' }, { status: 400 });
        }

        const apiRequestBody = {
            id: body.id,
            institucion_id: body.institucion_id,
            anio: body.anio,
            fec_mat_inicio: body.fec_mat_inicio,
            fec_mat_fin: body.fec_mat_fin,
            fec_mat_extemporaneo: body.fec_mat_extemporaneo,
            fecha_inicio: body.fecha_inicio
        };

        const response = await fetch(EXTERNAL_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequestBody),
        });

        const responseData = await response.json();

        if (!response.ok || responseData.success !== 1) {
            return NextResponse.json(
                { message: responseData.message || 'Error al actualizar el año académico.' },
                { status: response.status || 400 }
            );
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error en /api/academic-year/update:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}
