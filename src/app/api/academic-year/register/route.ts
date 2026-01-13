
import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/anio-academico/registrar';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Mapping frontend snake_case to API payload (already snake_case based on requirement)
        // The user requirement says the structure IS the payload, so we pass it directly.
        const apiRequestBody = {
            institucion_id: body.institucion_id,
            anio: body.anio,
            fec_mat_inicio: body.fec_mat_inicio,
            fec_mat_fin: body.fec_mat_fin,
            fec_mat_extemporaneo: body.fec_mat_extemporaneo,
            fecha_inicio: body.fecha_inicio
        };

        const response = await fetch(EXTERNAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequestBody),
        });

        const responseData = await response.json();

        if (!response.ok || responseData.success !== 1) {
            return NextResponse.json(
                { message: responseData.message || 'Error al registrar el año académico.' },
                { status: response.status || 400 }
            );
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error en /api/academic-year/register:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}
