
import pool from './db';
import type { Student, Course, Attendance, User, StudentFormValues, CourseFormValues, AttendanceReport, DashboardStats, TodayAttendanceByCourse } from './types';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';


// === Funciones de Autenticación ===

export async function validateUser(email: string, password_provided: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, name, email, password FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
        return null;
    }

    const user = rows[0] as User;
    const password_hash = crypto.createHash('sha256').update(password_provided).digest('hex');

    if (password_hash === user.password) {
        // No devolver el hash de la contraseña
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    return null;
}

// === Funciones para Estudiantes ===

export async function getStudents(): Promise<Student[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.avatar, 
        s.registration_date as registrationDate,
        c.id as courseId,
        c.name as courseName
    FROM students s
    LEFT JOIN student_courses sc ON s.id = sc.student_id
    LEFT JOIN courses c ON sc.course_id = c.id
    ORDER BY s.name ASC
  `);
  return rows as Student[];
}

export async function getStudentById(id: string): Promise<Student | null> {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
            s.id, 
            s.name, 
            s.email, 
            s.avatar, 
            s.registration_date as registrationDate,
            c.id as courseId,
            c.name as courseName
        FROM students s
        LEFT JOIN student_courses sc ON s.id = sc.student_id
        LEFT JOIN courses c ON sc.course_id = c.id
        WHERE s.id = ?
    `, [id]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0] as Student;
}

function generateStudentId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `STU-${timestamp}-${randomPart}`.toUpperCase();
}

export async function createStudent(studentData: StudentFormValues): Promise<Student> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const id = generateStudentId();
        const registrationDate = new Date().toISOString().slice(0, 10);
        const avatar = studentData.avatar || `student-${Math.ceil(Math.random() * 8)}`;
        
        await connection.query(
            "INSERT INTO students (id, name, email, avatar, registration_date) VALUES (?, ?, ?, ?, ?)",
            [id, studentData.name, studentData.email, avatar, registrationDate]
        );

        await connection.query(
            "INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)",
            [id, studentData.courseId]
        );

        await connection.commit();

        const newStudent = await getStudentById(id);
        if (!newStudent) {
            throw new Error("Failed to fetch newly created student");
        }
        return newStudent;

    } catch (error) {
        await connection.rollback();
        throw error; // Re-throw the error to be handled by the API route
    } finally {
        connection.release();
    }
}

export async function updateStudent(id: string, studentData: StudentFormValues): Promise<Student | null> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        await connection.query(
            "UPDATE students SET name = ?, email = ? WHERE id = ?",
            [studentData.name, studentData.email, id]
        );

        // Remove existing course assignment and add the new one
        await connection.query("DELETE FROM student_courses WHERE student_id = ?", [id]);
        await connection.query(
            "INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)",
            [id, studentData.courseId]
        );

        await connection.commit();
        
        return getStudentById(id);

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function deleteStudent(id: string): Promise<void> {
    await pool.query("DELETE FROM students WHERE id = ?", [id]);
}


// === Funciones para Cursos ===

export async function getCourses(): Promise<Course[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT c.id, c.name, c.description, COUNT(sc.student_id) as studentCount
    FROM courses c
    LEFT JOIN student_courses sc ON c.id = sc.course_id
    GROUP BY c.id, c.name, c.description
    ORDER BY c.name ASC
  `);
  return rows.map(row => ({
    ...row,
    studentCount: Number(row.studentCount)
  })) as Course[];
}


function generateCourseId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 5);
  return `CRS-${timestamp}-${randomPart}`.toUpperCase();
}


export async function createCourse(courseData: CourseFormValues): Promise<Course> {
    const id = generateCourseId();
    await pool.query(
        "INSERT INTO courses (id, name, description) VALUES (?, ?, ?)",
        [id, courseData.name, courseData.description || null]
    );
    return { ...courseData, id, studentCount: 0, description: courseData.description || '' };
}

export async function updateCourse(id: string, courseData: CourseFormValues): Promise<void> {
    await pool.query(
        "UPDATE courses SET name = ?, description = ? WHERE id = ?",
        [courseData.name, courseData.description || null, id]
    );
}

export async function deleteCourse(id: string): Promise<void> {
    await pool.query("DELETE FROM courses WHERE id = ?", [id]);
}


// === Funciones para Asistencia ===

export async function getAttendance(): Promise<Attendance[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT 
            a.id,
            s.name as studentName,
            s.id as studentId,
            c.name as courseName,
            c.id as courseId,
            a.date,
            a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN courses c ON a.course_id = c.id
        ORDER BY a.date DESC, s.name ASC
    `);
    // Asegurarse de que el ID sea un string
    return rows.map(row => ({...row, id: String(row.id)})) as Attendance[];
}

export async function getAttendanceForToday(studentId: string, courseId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM attendance WHERE student_id = ? AND course_id = ? AND DATE(date) = ?",
        [studentId, courseId, today]
    );
    if (rows.length === 0) {
        return null;
    }
    const record = rows[0];
    return { ...record, id: String(record.id) } as Attendance;
}


export async function recordAttendance(studentId: string, courseId: string, status: 'Presente' | 'Ausente'): Promise<void> {
    const now = new Date();
    await pool.query(
        "INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)",
        [studentId, courseId, now, status]
    );
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("ID de asistencia inválido.");
    }
    await pool.query("DELETE FROM attendance WHERE id = ?", [numericId]);
}


// === Funciones para Reportes de Asistencia ===

export async function getAttendanceReports(): Promise<AttendanceReport[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
        ar.id,
        s.id AS student_id,
        s.name AS studentName,
        c.id AS course_id,
        c.name AS courseName,
        ar.report_date,
        ar.total_classes,
        ar.attended_classes,
        ar.absent_classes,
        ar.attendance_percentage,
        ar.generated_at,
        ar.generated_by
    FROM attendance_reports ar
    JOIN students s ON ar.student_id = s.id
    JOIN courses c ON ar.course_id = c.id
    ORDER BY ar.generated_at DESC
  `);
  return rows.map(row => ({ ...row, id: String(row.id) })) as AttendanceReport[];
}


export async function generateReportForCourse(courseId: string, reportDate: string, generatedBy: string): Promise<any> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Obtener todos los estudiantes del curso
        const [students] = await connection.query<RowDataPacket[]>(
            "SELECT student_id FROM student_courses WHERE course_id = ?",
            [courseId]
        );

        if (students.length === 0) {
            throw new Error("No hay estudiantes en este curso para generar un reporte.");
        }

        const reportDateObj = new Date(reportDate);

        // 2. Para cada estudiante, calcular estadísticas y crear el reporte
        for (const student of students) {
            const studentId = student.student_id;

            // Calcular total_classes hasta la fecha del reporte
            const [[totalClassesResult]]: any = await connection.query(
                `SELECT COUNT(DISTINCT DATE(date)) as count FROM attendance WHERE course_id = ? AND DATE(date) <= ?`,
                [courseId, reportDateObj]
            );
            const total_classes = totalClassesResult.count;

            // Calcular attended_classes
            const [[attendedClassesResult]]: any = await connection.query(
                `SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND course_id = ? AND status = 'Presente' AND DATE(date) <= ?`,
                [studentId, courseId, reportDateObj]
            );
            const attended_classes = attendedClassesResult.count;

            // Calcular absent_classes
            const absent_classes = total_classes - attended_classes;

            // 3. Insertar en la tabla de reportes
            await connection.query(
                `INSERT INTO attendance_reports (student_id, course_id, report_date, total_classes, attended_classes, absent_classes, generated_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [studentId, courseId, reportDateObj, total_classes, attended_classes, absent_classes, generatedBy]
            );
        }

        await connection.commit();
        return { message: `${students.length} reportes de estudiante generados para el curso.` };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}



// === Funciones para Estadísticas (Dashboard) ===

async function countTotalPersonsFromApi(): Promise<number> {
    // Esto es un placeholder. Idealmente, la API externa tendría un endpoint
    // para contar el total de personas. Por ahora, simulamos una búsqueda amplia
    // y contamos los resultados. Esto puede ser lento y no es ideal para producción.
    try {
        const response = await fetch(`http://31.97.169.107:8093/api/persona/buscar-persona?nombres=a`);
        if (!response.ok) return 0;
        const data = await response.json();
        return Array.isArray(data.data) ? data.data.length : 0;
    } catch (e) {
        console.error("Could not fetch total persons from external API", e);
        return 0; // Devolver 0 si la API externa falla
    }
}


export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);

  const [
    // personsCount, // Descomentar cuando la API de conteo esté disponible
    coursesCount,
    presentCount,
    recentAttendance,
    todayAttendanceByCourse,
    totalEnrolledStudentsResult
  ] = await Promise.all([
    // countTotalPersonsFromApi(),
    pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM courses"),
    pool.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM attendance WHERE status = 'Presente' AND DATE(date) = ?", [today]),
    pool.query<RowDataPacket[]>(`
        SELECT a.id, s.name as studentName, c.name as courseName, a.date, a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN courses c ON a.course_id = c.id
        WHERE DATE(a.date) = ?
        ORDER BY a.date DESC
        LIMIT 5
    `, [today]),
    pool.query<RowDataPacket[]>(`
        SELECT 
            c.name as courseName,
            SUM(CASE WHEN a.status = 'Presente' THEN 1 ELSE 0 END) as presentes,
            (COUNT(DISTINCT sc.student_id) - SUM(CASE WHEN a.status = 'Presente' THEN 1 ELSE 0 END)) as ausentes
        FROM courses c
        LEFT JOIN student_courses sc ON c.id = sc.course_id
        LEFT JOIN attendance a ON sc.student_id = a.student_id AND c.id = a.course_id AND DATE(a.date) = ?
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
    `, [today]),
    pool.query<RowDataPacket[]>("SELECT COUNT(DISTINCT student_id) as count FROM student_courses")
  ]);

  const totalPersons = 150; // Valor placeholder hasta tener endpoint de conteo

  const totalCourses = (coursesCount[0] as any)[0].count;
  const totalPresentToday = (presentCount[0] as any)[0].count;
  const totalEnrolledStudents = (totalEnrolledStudentsResult[0] as any)[0].count;
  const totalAbsentToday = totalEnrolledStudents - totalPresentToday;

  return {
    totalPersons: totalPersons,
    totalCourses: totalCourses,
    totalPresentToday: totalPresentToday,
    totalAbsentToday: totalAbsentToday < 0 ? 0 : totalAbsentToday,
    recentAttendance: recentAttendance[0].map(row => ({...row, id: String(row.id)})) as Attendance[],
    todayAttendanceByCourse: todayAttendanceByCourse[0].map(row => ({
      courseName: row.courseName,
      presentes: Number(row.presentes),
      ausentes: Number(row.ausentes < 0 ? 0 : row.ausentes)
    })) as TodayAttendanceByCourse[],
  };
}
