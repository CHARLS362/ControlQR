
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT id, name, description, (SELECT COUNT(*) FROM inscriptions WHERE course_id = courses.id) as studentCount FROM courses');
    await connection.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al obtener los cursos' }, { status: 500 });
  }
}
