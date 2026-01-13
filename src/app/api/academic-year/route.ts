
import { NextResponse } from 'next/server';

const EXTERNAL_API_URL = 'http://31.97.169.107:8093/api/anio-academico/listar';


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const institutionId = searchParams.get('institutionId');

        if (!institutionId) {
            // If no institution ID is provided, we cannot fetch from the specific endpoint.
            // We'll return an empty array or error.
            return NextResponse.json({ message: 'Institution ID is required' }, { status: 400 });
        }

        const EXTERNAL_API_URL = `http://31.97.169.107:8093/api/anio-academico/obtener/${institutionId}`;

        console.log(`Fetching Academic Years from: ${EXTERNAL_API_URL}`);
        const response = await fetch(EXTERNAL_API_URL);

        if (!response.ok) {
            console.error(`External API error: ${response.status} ${response.statusText}`);
            return NextResponse.json([], { status: 200 }); // Graceful fallback
        }

        const responseData = await response.json();

        // Check if data exists and is valid
        if (responseData.success === 1 && responseData.data) {
            // The API might return a single object or an array. standardize to array.
            const data = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
            return NextResponse.json(data);
        }

        return NextResponse.json([]);
    } catch (error) {
        console.error('Error en /api/academic-year:', error);
        return NextResponse.json([], { status: 500 });
    }
}
