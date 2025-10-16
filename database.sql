
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `students` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `avatar` VARCHAR(255),
  `registration_date` DATE NOT NULL
);

CREATE TABLE `courses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT
);

CREATE TABLE `inscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `inscription_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

CREATE TABLE `attendance` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Presente', 'Ausente') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

-- Inserts de ejemplo para que la aplicación no esté vacía

INSERT INTO `students` (`id`, `name`, `email`, `avatar`, `registration_date`) VALUES
('STU-001', 'Liam Johnson', 'liam.j@example.com', 'student-1', '2023-09-01'),
('STU-002', 'Olivia Smith', 'olivia.s@example.com', 'student-2', '2023-09-01'),
('STU-003', 'Noah Williams', 'noah.w@example.com', 'student-3', '2023-09-02'),
('STU-004', 'Emma Brown', 'emma.b@example.com', 'student-4', '2023-09-02');

INSERT INTO `courses` (`id`, `name`, `description`) VALUES
('CRS-101', 'Introducción a la Programación', 'Aprende los fundamentos de la programación usando Python.'),
('CRS-102', 'Desarrollo Web Básico', 'Construye tu primer sitio web con HTML, CSS y JavaScript.'),
('CRS-201', 'Estructuras de Datos y Algoritmos', 'Una mirada profunda a las estructuras de datos.'),
('CRS-202', 'Gestión de Bases de Datos', 'Aprende a gestionar datos con bases de datos SQL y NoSQL.');

INSERT INTO `inscriptions` (`student_id`, `course_id`) VALUES
('STU-001', 'CRS-101'),
('STU-002', 'CRS-101'),
('STU-003', 'CRS-101'),
('STU-001', 'CRS-102'),
('STU-004', 'CRS-102'),
('STU-002', 'CRS-201'),
('STU-003', 'CRS-202');

INSERT INTO `attendance` (`id`, `student_id`, `course_id`, `date`, `status`) VALUES
('ATT-001', 'STU-001', 'CRS-101', '2024-05-20', 'Presente'),
('ATT-002', 'STU-002', 'CRS-101', '2024-05-20', 'Presente'),
('ATT-003', 'STU-003', 'CRS-101', '2024-05-20', 'Ausente');
