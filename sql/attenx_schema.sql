-- ═══════════════════════════════════════════════════════
--  ATTENX — MySQL Database Schema
--  Run this file ONCE before starting the backend.
--
USE attenx_db;
SELECT * FROM students;
SELECT @@port, DATABASE();
--  HOW TO RUN:
--    1. Open MySQL Workbench or terminal
--    2. Run:  mysql -u root -p < attenx_schema.sql
--    OR paste this entire file in MySQL Workbench and Execute
-- ═══════════════════════════════════════════════════════
-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS attenx_db;
USE attenx_db;
-- Step 2: Drop old tables if they exist (clean slate)
-- DROP TABLE IF EXISTS attendance_records;
-- DROP TABLE IF EXISTS students;
-- DROP TABLE IF EXISTS courses;
-- DROP TABLE IF EXISTS teachers;

-- ── TABLE: teachers ───────────────────────────────────
CREATE TABLE if not exists teachers (
    id       VARCHAR(50)  PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    subject  VARCHAR(100),
    emp_id   VARCHAR(20)  UNIQUE
);

-- ── TABLE: courses ────────────────────────────────────
CREATE TABLE if not exists courses (
    id         INT          PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(150) NOT NULL,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    instructor VARCHAR(100)
);

-- ── TABLE: students ───────────────────────────────────
CREATE TABLE if not exists students (
    id         INT          PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(100) NOT NULL,
    roll       VARCHAR(20)  UNIQUE,
    course_id  INT          NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- ── TABLE: attendance_records ──────────────────────────
CREATE TABLE if not exists attendance_records (
    id         INT     PRIMARY KEY AUTO_INCREMENT,
    student_id INT     NOT NULL,
    course_id  INT     NOT NULL,
    date       DATE    NOT NULL,
    status     ENUM('PRESENT','ABSENT') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE,
    UNIQUE KEY uq_student_course_date (student_id, course_id, date)
);

-- ═══════════════════════════════════════════════════════
--  SEED DATA — same as the in-memory data
-- ═══════════════════════════════════════════════════════

-- Teachers
INSERT INTO teachers VALUES
('t1', 'Dr. Priya Sharma',   'priya.sharma@attenx.edu', 'teach123', 'Computer Science', 'EMP001'),
('t2', 'Prof. Rajesh Mehta', 'rajesh.mehta@attenx.edu', 'teach456', 'Mathematics',       'EMP002');

-- Courses
INSERT INTO courses (id, name, code, instructor) VALUES
(1, 'Data Structures & Algorithms', 'CS301', 'Dr. Patel'),
(2, 'Object Oriented Programming',  'CS302', 'Prof. Shah'),
(3, 'Database Management Systems',  'CS303', 'Dr. Mehta'),
(4, 'Computer Networks',            'CS304', 'Prof. Joshi');

-- Students
INSERT INTO students (id, name, email, password, roll, course_id) VALUES
(1,  'Aryan Sharma',  'aryan@student.edu',  'stu123', 'CS2024001', 1),
(2,  'Priya Patel',   'priya@student.edu',  'stu123', 'CS2024002', 1),
(3,  'Rahul Verma',   'rahul@student.edu',  'stu123', 'CS2024003', 2),
(4,  'Sneha Gupta',   'sneha@student.edu',  'stu123', 'CS2024004', 2),
(5,  'Amit Kumar',    'amit@student.edu',   'stu123', 'CS2024005', 3),
(6,  'Neha Singh',    'neha@student.edu',   'stu123', 'CS2024006', 3),
(7,  'Rohan Das',     'rohan@student.edu',  'stu123', 'CS2024007', 4),
(8,  'Kavya Reddy',   'kavya@student.edu',  'stu123', 'CS2024008', 1),
(9,  'Vikas Nair',    'vikas@student.edu',  'stu123', 'CS2024009', 2),
(10, 'Divya Jain',    'divya@student.edu',  'stu123', 'CS2024010', 4);

-- Auto-increment counters start after seed data
ALTER TABLE students          AUTO_INCREMENT = 11;
ALTER TABLE courses           AUTO_INCREMENT = 5;
ALTER TABLE attendance_records AUTO_INCREMENT = 1;

-- Attendance (Rohan Das = student 7, only 4 out of 10 present = defaulter)
INSERT INTO attendance_records (student_id, course_id, date, status) VALUES
-- Aryan Sharma (id=1, course=1)
(1,1,'2024-06-01','PRESENT'),(1,1,'2024-06-03','PRESENT'),(1,1,'2024-06-05','PRESENT'),
(1,1,'2024-06-07','ABSENT'), (1,1,'2024-06-10','PRESENT'),(1,1,'2024-06-12','PRESENT'),
(1,1,'2024-06-14','PRESENT'),(1,1,'2024-06-17','PRESENT'),(1,1,'2024-06-19','ABSENT'),
(1,1,'2024-06-21','PRESENT'),
-- Priya Patel (id=2, course=1)
(2,1,'2024-06-01','PRESENT'),(2,1,'2024-06-03','ABSENT'), (2,1,'2024-06-05','PRESENT'),
(2,1,'2024-06-07','PRESENT'),(2,1,'2024-06-10','PRESENT'),(2,1,'2024-06-12','ABSENT'),
(2,1,'2024-06-14','PRESENT'),(2,1,'2024-06-17','PRESENT'),(2,1,'2024-06-19','PRESENT'),
(2,1,'2024-06-21','PRESENT'),
-- Rahul Verma (id=3, course=2)
(3,2,'2024-06-01','PRESENT'),(3,2,'2024-06-03','PRESENT'),(3,2,'2024-06-05','ABSENT'),
(3,2,'2024-06-07','PRESENT'),(3,2,'2024-06-10','PRESENT'),(3,2,'2024-06-12','PRESENT'),
(3,2,'2024-06-14','ABSENT'), (3,2,'2024-06-17','PRESENT'),(3,2,'2024-06-19','PRESENT'),
(3,2,'2024-06-21','PRESENT'),
-- Sneha Gupta (id=4, course=2)
(4,2,'2024-06-01','PRESENT'),(4,2,'2024-06-03','PRESENT'),(4,2,'2024-06-05','PRESENT'),
(4,2,'2024-06-07','PRESENT'),(4,2,'2024-06-10','ABSENT'), (4,2,'2024-06-12','PRESENT'),
(4,2,'2024-06-14','PRESENT'),(4,2,'2024-06-17','ABSENT'), (4,2,'2024-06-19','PRESENT'),
(4,2,'2024-06-21','PRESENT'),
-- Amit Kumar (id=5, course=3)
(5,3,'2024-06-01','PRESENT'),(5,3,'2024-06-03','ABSENT'), (5,3,'2024-06-05','PRESENT'),
(5,3,'2024-06-07','PRESENT'),(5,3,'2024-06-10','PRESENT'),(5,3,'2024-06-12','PRESENT'),
(5,3,'2024-06-14','PRESENT'),(5,3,'2024-06-17','PRESENT'),(5,3,'2024-06-19','ABSENT'),
(5,3,'2024-06-21','PRESENT'),
-- Neha Singh (id=6, course=3)
(6,3,'2024-06-01','ABSENT'), (6,3,'2024-06-03','PRESENT'),(6,3,'2024-06-05','PRESENT'),
(6,3,'2024-06-07','PRESENT'),(6,3,'2024-06-10','PRESENT'),(6,3,'2024-06-12','PRESENT'),
(6,3,'2024-06-14','ABSENT'), (6,3,'2024-06-17','PRESENT'),(6,3,'2024-06-19','PRESENT'),
(6,3,'2024-06-21','PRESENT'),
-- Rohan Das (id=7, course=4) — DEFAULTER: only 4 present
(7,4,'2024-06-01','PRESENT'),(7,4,'2024-06-03','PRESENT'),(7,4,'2024-06-05','PRESENT'),
(7,4,'2024-06-07','PRESENT'),(7,4,'2024-06-10','ABSENT'), (7,4,'2024-06-12','ABSENT'),
(7,4,'2024-06-14','ABSENT'),(7,4,'2024-06-17','ABSENT'), (7,4,'2024-06-19','ABSENT'),
(7,4,'2024-06-21','ABSENT'),
-- Kavya Reddy (id=8, course=1)
(8,1,'2024-06-01','PRESENT'),(8,1,'2024-06-03','PRESENT'),(8,1,'2024-06-05','PRESENT'),
(8,1,'2024-06-07','ABSENT'), (8,1,'2024-06-10','PRESENT'),(8,1,'2024-06-12','PRESENT'),
(8,1,'2024-06-14','PRESENT'),(8,1,'2024-06-17','PRESENT'),(8,1,'2024-06-19','PRESENT'),
(8,1,'2024-06-21','PRESENT'),
-- Vikas Nair (id=9, course=2)
(9,2,'2024-06-01','PRESENT'),(9,2,'2024-06-03','PRESENT'),(9,2,'2024-06-05','ABSENT'),
(9,2,'2024-06-07','PRESENT'),(9,2,'2024-06-10','PRESENT'),(9,2,'2024-06-12','PRESENT'),
(9,2,'2024-06-14','PRESENT'),(9,2,'2024-06-17','ABSENT'), (9,2,'2024-06-19','PRESENT'),
(9,2,'2024-06-21','PRESENT'),
-- Divya Jain (id=10, course=4)
(10,4,'2024-06-01','ABSENT'), (10,4,'2024-06-03','PRESENT'),(10,4,'2024-06-05','PRESENT'),
(10,4,'2024-06-07','PRESENT'),(10,4,'2024-06-10','PRESENT'),(10,4,'2024-06-12','ABSENT'),
(10,4,'2024-06-14','PRESENT'),(10,4,'2024-06-17','PRESENT'),(10,4,'2024-06-19','PRESENT'),
(10,4,'2024-06-21','PRESENT');

-- Verify
USE attenx_db;

SELECT 'Teachers'  AS tbl, COUNT(*) AS total FROM teachers
UNION ALL
SELECT 'Courses',  COUNT(*) FROM courses
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance_records;