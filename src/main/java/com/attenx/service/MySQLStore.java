package com.attenx.service;

import com.attenx.model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * MySQLStore — replaces InMemoryStore.
 * Uses JdbcTemplate (plain SQL) — simplest possible database access.
 * No JPA, no Hibernate, no annotations on models needed.
 *
 * JdbcTemplate: Spring class that runs SQL and maps results to Java objects.
 * Every method = one or a few SQL queries.
 */
@Component
public class MySQLStore {

    // JdbcTemplate is injected by Spring automatically
    // (Spring Boot configures it from application.properties)
    private final JdbcTemplate jdbc;

    public MySQLStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ══════════════════════════════════════════════════
    //  TEACHERS
    // ══════════════════════════════════════════════════

    public Optional<Teacher> findTeacherByEmail(String email) {
        List<Teacher> result = jdbc.query(
            "SELECT * FROM teachers WHERE email = ?",
            (rs, rn) -> {
                Teacher t = new Teacher(
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("password"),
                    rs.getString("subject"),
                    rs.getString("emp_id")
                );
                t.setDbId(rs.getString("id"));
                return t;
            },
            email
        );
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    public boolean teacherEmailExists(String email) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM teachers WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    public void saveTeacher(Teacher t) {
        jdbc.update(
            "INSERT INTO teachers (id, name, email, password, subject, emp_id) VALUES (?,?,?,?,?,?)",
            t.getId(), t.getName(), t.getEmail(), t.getPassword(), t.getSubject(), t.getEmpId()
        );
    }

    // ══════════════════════════════════════════════════
    //  COURSES
    // ══════════════════════════════════════════════════

    public List<Course> findAllCourses() {
        return jdbc.query(
            "SELECT * FROM courses ORDER BY id",
            (rs, rn) -> new Course(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("code"),
                rs.getString("instructor")
            )
        );
    }

    public Optional<Course> findCourseById(int id) {
        List<Course> result = jdbc.query(
            "SELECT * FROM courses WHERE id = ?",
            (rs, rn) -> new Course(
                rs.getInt("id"), rs.getString("name"),
                rs.getString("code"), rs.getString("instructor")
            ),
            id
        );
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    public boolean courseCodeExists(String code) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM courses WHERE code = ?", Integer.class, code);
        return count != null && count > 0;
    }

    public boolean courseCodeExistsExcluding(String code, int excludeId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM courses WHERE code = ? AND id != ?",
            Integer.class, code, excludeId);
        return count != null && count > 0;
    }

    public Course saveCourse(Course course) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO courses (name, code, instructor) VALUES (?,?,?)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, course.getName());
            ps.setString(2, course.getCode());
            ps.setString(3, course.getInstructor());
            return ps;
        }, keys);
        course.setId(keys.getKey().intValue());
        return course;
    }

    public void updateCourse(Course course) {
        jdbc.update(
            "UPDATE courses SET name=?, code=?, instructor=? WHERE id=?",
            course.getName(), course.getCode(), course.getInstructor(), course.getId()
        );
    }

    public void deleteCourse(int id) {
        // attendance_records and students deleted automatically via ON DELETE CASCADE
        jdbc.update("DELETE FROM courses WHERE id = ?", id);
    }

    // ══════════════════════════════════════════════════
    //  STUDENTS
    // ══════════════════════════════════════════════════

    public List<Student> findAllStudents() {
        return jdbc.query(
            "SELECT * FROM students ORDER BY id",
            (rs, rn) -> new Student(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password"),
                rs.getInt("course_id"),
                rs.getString("roll")
            )
        );
    }

    public Optional<Student> findStudentById(int id) {
        List<Student> result = jdbc.query(
            "SELECT * FROM students WHERE id = ?",
            (rs, rn) -> new Student(
                rs.getInt("id"), rs.getString("name"), rs.getString("email"),
                rs.getString("password"), rs.getInt("course_id"), rs.getString("roll")
            ),
            id
        );
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    public Optional<Student> findStudentByEmail(String email) {
        List<Student> result = jdbc.query(
            "SELECT * FROM students WHERE email = ?",
            (rs, rn) -> new Student(
                rs.getInt("id"), rs.getString("name"), rs.getString("email"),
                rs.getString("password"), rs.getInt("course_id"), rs.getString("roll")
            ),
            email
        );
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    public boolean studentEmailExists(String email) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM students WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    public boolean studentEmailExistsExcluding(String email, int excludeId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM students WHERE email = ? AND id != ?",
            Integer.class, email, excludeId);
        return count != null && count > 0;
    }

    public boolean studentRollExists(String roll) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM students WHERE roll = ?", Integer.class, roll);
        return count != null && count > 0;
    }

    public Student saveStudent(Student student) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO students (name, email, password, roll, course_id) VALUES (?,?,?,?,?)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, student.getName());
            ps.setString(2, student.getEmail());
            ps.setString(3, student.getPassword());
            ps.setString(4, student.getRoll());
            ps.setInt(5, student.getCourseId());
            return ps;
        }, keys);
        student.setId(keys.getKey().intValue());
        return student;
    }

    public void updateStudent(Student student) {
        jdbc.update(
            "UPDATE students SET name=?, email=?, roll=?, course_id=? WHERE id=?",
            student.getName(), student.getEmail(),
            student.getRoll(), student.getCourseId(), student.getId()
        );
    }

    public void deleteStudent(int id) {
        // attendance_records deleted automatically via ON DELETE CASCADE
        jdbc.update("DELETE FROM students WHERE id = ?", id);
    }

    // ══════════════════════════════════════════════════
    //  ATTENDANCE
    // ══════════════════════════════════════════════════

    public List<AttendanceRecord> findAllAttendance() {
        return jdbc.query(
            "SELECT * FROM attendance_records ORDER BY date DESC",
            (rs, rn) -> new AttendanceRecord(
                rs.getInt("id"), rs.getInt("student_id"), rs.getInt("course_id"),
                rs.getDate("date").toLocalDate(),
                AttendanceStatus.valueOf(rs.getString("status"))
            )
        );
    }

    public List<AttendanceRecord> findAttendanceByCourseAndDate(int courseId, String date) {
        return jdbc.query(
            "SELECT * FROM attendance_records WHERE course_id = ? AND date = ? ORDER BY id",
            (rs, rn) -> new AttendanceRecord(
                rs.getInt("id"), rs.getInt("student_id"), rs.getInt("course_id"),
                rs.getDate("date").toLocalDate(),
                AttendanceStatus.valueOf(rs.getString("status"))
            ),
            courseId, date
        );
    }

    public List<AttendanceRecord> findAttendanceByStudent(int studentId) {
        return jdbc.query(
            "SELECT * FROM attendance_records WHERE student_id = ? ORDER BY date DESC",
            (rs, rn) -> new AttendanceRecord(
                rs.getInt("id"), rs.getInt("student_id"), rs.getInt("course_id"),
                rs.getDate("date").toLocalDate(),
                AttendanceStatus.valueOf(rs.getString("status"))
            ),
            studentId
        );
    }

    public Optional<AttendanceRecord> findAttendance(int studentId, int courseId, LocalDate date) {
        List<AttendanceRecord> result = jdbc.query(
            "SELECT * FROM attendance_records WHERE student_id=? AND course_id=? AND date=?",
            (rs, rn) -> new AttendanceRecord(
                rs.getInt("id"), rs.getInt("student_id"), rs.getInt("course_id"),
                rs.getDate("date").toLocalDate(),
                AttendanceStatus.valueOf(rs.getString("status"))
            ),
            studentId, courseId, date
        );
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    /**
     * Save or update (upsert) a single attendance record.
     * Uses MySQL's INSERT ... ON DUPLICATE KEY UPDATE — simplest upsert.
     */
    public void upsertAttendance(int studentId, int courseId, LocalDate date, AttendanceStatus status) {
        jdbc.update(
            "INSERT INTO attendance_records (student_id, course_id, date, status) VALUES (?,?,?,?) " +
            "ON DUPLICATE KEY UPDATE status = VALUES(status)",
            studentId, courseId, date, status.name()
        );
    }

    public List<AttendanceRecord> findRecentAttendance(int limit) {
        return jdbc.query(
            "SELECT * FROM attendance_records ORDER BY date DESC, id DESC LIMIT ?",
            (rs, rn) -> new AttendanceRecord(
                rs.getInt("id"), rs.getInt("student_id"), rs.getInt("course_id"),
                rs.getDate("date").toLocalDate(),
                AttendanceStatus.valueOf(rs.getString("status"))
            ),
            limit
        );
    }

    public int countAttendanceByStatus(AttendanceStatus status) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM attendance_records WHERE status = ?",
            Integer.class, status.name());
        return count != null ? count : 0;
    }
}