-- Esquema de Base de Datos para QRAttendance
-- Motor: MySQL

-- Tabla para los usuarios administradores del sistema
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los estudiantes
CREATE TABLE `students` (
  `id` VARCHAR(50) PRIMARY KEY, -- ej: 'STU-001'
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `avatar_url` VARCHAR(255),
  `registration_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para los cursos
CREATE TABLE `courses` (
  `id` VARCHAR(50) PRIMARY KEY, -- ej: 'CRS-101'
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones (relación N:M entre estudiantes y cursos)
CREATE TABLE `enrollments` (
  `student_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `enrollment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`, `course_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

-- Tabla para los registros de asistencia
CREATE TABLE `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Presente', 'Ausente') NOT NULL,
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_attendance` (`student_id`, `course_id`, `date`)
);

-- Insertar un usuario administrador de ejemplo
INSERT INTO `users` (`name`, `email`, `password_hash`) VALUES ('Admin', 'admin@example.com', 'hash_de_contraseña_segura'); -- Reemplazar con un hash real

