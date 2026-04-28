package com.attenx.service;

import com.attenx.dto.*;
import com.attenx.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AttendanceService — all business logic.
 * Now uses MySQLStore (real DB) instead of InMemoryStore.
 * All method signatures stay the same — controllers don't change at all.
 */
@Service
public class AttendanceService {

    private final MySQLStore db;

    public AttendanceService(MySQLStore db) {
        this.db = db;
    }

    // ── AUTH ──────────────────────────────────────────
public Optional<Teacher> authenticateTeacher(String email, String password) {
    return db.findTeacherByEmail(email.trim().toLowerCase())
            .filter(t -> t.getPassword().trim().equals(password.trim()));
}
    // public Optional<Teacher> authenticateTeacher(String email, String password) {
    //     return db.findTeacherByEmail(email)
    //             .filter(t -> t.getPassword().equals(password));
    // }

    public Optional<Student> authenticateStudent(String email, String password) {
    return db.findStudentByEmail(email.trim().toLowerCase())
            .filter(s -> s.getPassword().trim().equals(password.trim()));
}
    // public Optional<Student> authenticateStudent(String email, String password) {
    //     return db.findStudentByEmail(email)
    //             .filter(s -> s.getPassword().equals(password));
    // }

    public Teacher registerTeacher(RegisterRequest req) {
        if (db.teacherEmailExists(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Teacher teacher = new Teacher(
            req.getName(), req.getEmail(), req.getPassword(),
            req.getSubject()  == null ? "" : req.getSubject(),
            req.getEmpId()    == null ? "" : req.getEmpId()
        );
        db.saveTeacher(teacher);
        return teacher;
    }

    public Student registerStudent(RegisterRequest req) {
        if (req.getCourseId() == null) throw new IllegalArgumentException("Course ID is required");
        ensureCourseExists(req.getCourseId());
        if (db.studentEmailExists(req.getEmail())) throw new IllegalArgumentException("Email already registered");
        if (req.getRoll() == null || req.getRoll().isBlank()) throw new IllegalArgumentException("Roll number is required");
        if (db.studentRollExists(req.getRoll())) throw new IllegalArgumentException("Roll number already exists");

        Student student = new Student(0, req.getName(), req.getEmail(),
                req.getPassword(), req.getCourseId(), req.getRoll());
        return db.saveStudent(student); // id set by DB
    }

    // ── STUDENTS ──────────────────────────────────────

    public List<Student> getStudents() {
        return db.findAllStudents();
    }

    public Student addStudent(StudentRequest req) {
        ensureCourseExists(req.getCourseId());
        if (db.studentEmailExists(req.getEmail())) throw new IllegalArgumentException("Email already registered");
        if (req.getRoll() != null && db.studentRollExists(req.getRoll())) throw new IllegalArgumentException("Roll number already exists");

        String pass = (req.getPassword() == null || req.getPassword().isBlank()) ? "stu123" : req.getPassword();
        Student student = new Student(0, req.getName(), req.getEmail(), pass, req.getCourseId(), req.getRoll());
        return db.saveStudent(student);
    }

    public Student updateStudent(int id, StudentRequest req) {
        Student s = db.findStudentById(id)
                .orElseThrow(() -> new NoSuchElementException("Student not found: " + id));
        ensureCourseExists(req.getCourseId());
        if (db.studentEmailExistsExcluding(req.getEmail(), id)) throw new IllegalArgumentException("Email already in use");

        s.setName(req.getName());
        s.setEmail(req.getEmail());
        s.setCourseId(req.getCourseId());
        s.setRoll(req.getRoll());
        if (req.getPassword() != null && !req.getPassword().isBlank()) s.setPassword(req.getPassword());
        db.updateStudent(s);
        return s;
    }

    public void deleteStudent(int id) {
        if (db.findStudentById(id).isEmpty()) throw new NoSuchElementException("Student not found: " + id);
        db.deleteStudent(id); // CASCADE deletes attendance too
    }

    // ── COURSES ───────────────────────────────────────

    public List<Course> getCourses() {
        return db.findAllCourses();
    }

    public Course addCourse(CourseRequest req) {
        if (db.courseCodeExists(req.getCode())) throw new IllegalArgumentException("Course code already exists");
        Course course = new Course(0, req.getName(), req.getCode(), req.getInstructor());
        return db.saveCourse(course);
    }

    public Course updateCourse(int id, CourseRequest req) {
        Course c = db.findCourseById(id)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + id));
        if (db.courseCodeExistsExcluding(req.getCode(), id)) throw new IllegalArgumentException("Course code already in use");
        c.setName(req.getName());
        c.setCode(req.getCode());
        c.setInstructor(req.getInstructor());
        db.updateCourse(c);
        return c;
    }

    public void deleteCourse(int id) {
        if (db.findCourseById(id).isEmpty()) throw new NoSuchElementException("Course not found: " + id);
        db.deleteCourse(id); // CASCADE deletes students + attendance
    }

    // ── ATTENDANCE ────────────────────────────────────

    public List<AttendanceRecord> getAttendanceByCourseAndDate(Integer courseId, String date) {
        if (courseId == null && date == null) {
            return db.findAllAttendance();
        }
        if (courseId != null && date != null) {
            return db.findAttendanceByCourseAndDate(courseId, date);
        }
        // filter by one only
        return db.findAllAttendance().stream()
                .filter(a -> courseId == null || a.getCourseId() == courseId)
                .filter(a -> date == null || a.getDate().toString().equals(date))
                .collect(Collectors.toList());
    }

    public List<AttendanceRecord> getAttendanceForStudent(int studentId) {
        return db.findAttendanceByStudent(studentId);
    }

    public List<AttendanceRecord> markAttendance(AttendanceMarkRequest req) {
        ensureCourseExists(req.getCourseId());
        LocalDate date = LocalDate.parse(req.getDate());
        List<AttendanceRecord> saved = new ArrayList<>();

        for (AttendanceMarkRequest.Item item : req.getRecords()) {
            Student s = db.findStudentById(item.getStudentId())
                    .orElseThrow(() -> new NoSuchElementException("Student not found: " + item.getStudentId()));
            if (s.getCourseId() != req.getCourseId()) {
                throw new IllegalArgumentException("Student " + s.getId() + " is not in selected course");
            }
            // Upsert: insert if new, update if exists
            db.upsertAttendance(s.getId(), req.getCourseId(), date, item.getStatus());
            // Fetch the saved record to return it
            db.findAttendance(s.getId(), req.getCourseId(), date).ifPresent(saved::add);
        }
        return saved;
    }

    // ── DASHBOARD ─────────────────────────────────────

    public DashboardDto getTeacherDashboard() {
        DashboardDto dto = new DashboardDto();
        dto.setTotalStudents(db.findAllStudents().size());
        dto.setActiveCourses(db.findAllCourses().size());

        int present = db.countAttendanceByStatus(AttendanceStatus.PRESENT);
        int absent  = db.countAttendanceByStatus(AttendanceStatus.ABSENT);
        int total   = present + absent;
        dto.setTotalAttendanceEntries(total);
        dto.setPresentCount(present);
        dto.setAbsentCount(absent);
        dto.setOverallAttendancePercent(total == 0 ? 0 : (int) Math.round(present * 100.0 / total));
        dto.setDefaulters(getDefaulters().size());
        dto.setRecentAttendance(buildRecentAttendance(10));
        return dto;
    }

    public StudentStatsDto getStudentStats(int studentId) {
        Student s = db.findStudentById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found: " + studentId));
        return buildStats(s);
    }

    public List<StudentStatsDto> getAllStats() {
        return db.findAllStudents().stream().map(this::buildStats).collect(Collectors.toList());
    }

    public List<StudentStatsDto> getDefaulters() {
        return getAllStats().stream()
                .filter(s -> s.getTotal() > 0 && s.getPercentage() < 75)
                .collect(Collectors.toList());
    }

    // ── ANALYTICS ─────────────────────────────────────

    public Map<String, Object> getAnalytics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("courses", db.findAllCourses().stream().map(c -> Map.of(
                "courseId",          c.getId(),
                "courseCode",        c.getCode(),
                "courseName",        c.getName(),
                "averagePercentage", averageForCourse(c.getId())
        )).toList());
        data.put("presentCount", db.countAttendanceByStatus(AttendanceStatus.PRESENT));
        data.put("absentCount",  db.countAttendanceByStatus(AttendanceStatus.ABSENT));
        data.put("distribution", Map.of(
            "0_49",   rangeCount(0,  49),
            "50_74",  rangeCount(50, 74),
            "75_89",  rangeCount(75, 89),
            "90_100", rangeCount(90, 100)
        ));
        return data;
    }

    // ── NOTIFICATIONS ─────────────────────────────────

    public List<NotificationDto> getTeacherNotifications() {
        List<NotificationDto> out = new ArrayList<>();
        for (StudentStatsDto d : getDefaulters().stream().limit(5).toList()) {
            out.add(new NotificationDto("alert", "Defaulter: " + d.getStudentName(),
                    "Attendance " + d.getPercentage() + "% — below 75%"));
        }
        out.add(new NotificationDto("info", "Attendance Module Ready", "Mark today's attendance from the sidebar"));
        out.add(new NotificationDto("info", "System Online", "AttenX is fully operational"));
        return out;
    }

    public List<NotificationDto> getStudentNotifications(int studentId) {
        StudentStatsDto st = getStudentStats(studentId);
        List<NotificationDto> out = new ArrayList<>();
        if (st.getTotal() > 0 && st.getPercentage() < 75)
            out.add(new NotificationDto("alert", "Attendance Warning",
                    "Your attendance is " + st.getPercentage() + "% — below 75% threshold!"));
        out.add(new NotificationDto("info", "Welcome to AttenX", "View your attendance records from the sidebar"));
        if (st.getPercentage() >= 75)
            out.add(new NotificationDto("info", "Good Standing",
                    "Your attendance is " + st.getPercentage() + "% — keep it up!"));
        return out;
    }

    // ── PRIVATE HELPERS ───────────────────────────────

    private StudentStatsDto buildStats(Student s) {
        List<AttendanceRecord> records = db.findAttendanceByStudent(s.getId());
        int total   = records.size();
        int present = (int) records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        int absent  = total - present;
        int pct     = total == 0 ? 0 : (int) Math.round(present * 100.0 / total);

        Course c = db.findCourseById(s.getCourseId())
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + s.getCourseId()));

        StudentStatsDto dto = new StudentStatsDto();
        dto.setStudentId(s.getId());
        dto.setStudentName(s.getName());
        dto.setRoll(s.getRoll());
        dto.setEmail(s.getEmail());
        dto.setCourseId(s.getCourseId());
        dto.setCourseName(c.getName());
        dto.setCourseCode(c.getCode());
        dto.setTotal(total);
        dto.setPresent(present);
        dto.setAbsent(absent);
        dto.setPercentage(pct);
        dto.setDefaulter(total > 0 && pct < 75);
        return dto;
    }

    private List<RecentAttendanceDto> buildRecentAttendance(int limit) {
        return db.findRecentAttendance(limit).stream().map(a -> {
            Student s = db.findStudentById(a.getStudentId()).orElse(null);
            Course  c = db.findCourseById(a.getCourseId()).orElse(null);
            if (s == null || c == null) return null;
            RecentAttendanceDto dto = new RecentAttendanceDto();
            dto.setAttendanceId(a.getId());
            dto.setStudentId(s.getId());
            dto.setStudentName(s.getName());
            dto.setRoll(s.getRoll());
            dto.setCourseId(c.getId());
            dto.setCourseCode(c.getCode());
            dto.setCourseName(c.getName());
            dto.setDate(a.getDate().toString());
            dto.setStatus(a.getStatus().name());
            return dto;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    private int averageForCourse(int courseId) {
        List<Student> students = db.findAllStudents().stream()
                .filter(s -> s.getCourseId() == courseId).toList();
        if (students.isEmpty()) return 0;
        return (int) Math.round(students.stream().mapToInt(s -> {
            List<AttendanceRecord> rs = db.findAttendanceByStudent(s.getId());
            int total = rs.size();
            int present = (int) rs.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
            return total == 0 ? 0 : (int) Math.round(present * 100.0 / total);
        }).average().orElse(0));
    }

    private int rangeCount(int min, int max) {
        return (int) getAllStats().stream()
                .filter(s -> s.getTotal() > 0)
                .filter(s -> s.getPercentage() >= min && s.getPercentage() <= max)
                .count();
    }

    private void ensureCourseExists(Integer id) {
        if (id == null) throw new IllegalArgumentException("Course ID is required");
        db.findCourseById(id).orElseThrow(() -> new NoSuchElementException("Course not found: " + id));
    }
}