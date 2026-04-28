package com.attenx.model;

import java.time.LocalDate;

public class AttendanceRecord {
    private int id;
    private int studentId;
    private int courseId;
    private LocalDate date;
    private AttendanceStatus status;

    public AttendanceRecord() {}

    public AttendanceRecord(int id, int studentId, int courseId, LocalDate date, AttendanceStatus status) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.date = date;
        this.status = status;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }
    public int getCourseId() { return courseId; }
    public void setCourseId(int courseId) { this.courseId = courseId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
}
