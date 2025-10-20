
import pool from './db';
import type { Student, Course, Attendance, User, StudentFormValues, CourseFormValues } from './types';
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


// === Funciones para Estadísticas (Dashboard) ===

export async function getDashboardStats() {
  const [[studentsCount]]: any = await pool.query("SELECT COUNT(*) as count FROM students");
  const [[coursesCount]]: any = await pool.query("SELECT COUNT(*) as count FROM courses");
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [[presentCount]]: any = await pool.query(
    "SELECT COUNT(*) as count FROM attendance WHERE status = 'Presente' AND date >= ?",
    [thirtyDaysAgo]
  );
  const [[absentCount]]: any = await pool.query(
    "SELECT COUNT(*) as count FROM attendance WHERE status = 'Ausente' AND date >= ?",
    [thirtyDaysAgo]
  );

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const [chartDataRows]: any = await pool.query(`
    SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN status = 'Presente' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Ausente' THEN 1 ELSE 0 END) as absent
    FROM attendance
    WHERE date >= ?
    GROUP BY month
    ORDER BY month ASC;
  `, [sixMonthsAgo]);

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const chartData = chartDataRows.map((row: any) => ({
    month: monthNames[new Date(row.month + '-02').getMonth()], // Add day to parse date correctly
    present: Number(row.present),
    absent: Number(row.absent)
  }));


  return {
    totalStudents: studentsCount.count,
    totalCourses: coursesCount.count,
    totalPresent: presentCount.count,
    totalAbsent: absentCount.count,
    chartData: chartData
  };
}
