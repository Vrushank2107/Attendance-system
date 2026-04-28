package com.attenx.dto;

public class StudentStatsDto {
    private int studentId;
    private String studentName;
    private String roll;
    private String email;
    private int courseId;
    private String courseName;
    private String courseCode;
    private int total;
    private int present;
    private int absent;
    private int percentage;
    private boolean defaulter;

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRoll() { return roll; }
    public void setRoll(String roll) { this.roll = roll; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public int getCourseId() { return courseId; }
    public void setCourseId(int courseId) { this.courseId = courseId; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public int getPresent() { return present; }
    public void setPresent(int present) { this.present = present; }
    public int getAbsent() { return absent; }
    public void setAbsent(int absent) { this.absent = absent; }
    public int getPercentage() { return percentage; }
    public void setPercentage(int percentage) { this.percentage = percentage; }
    public boolean isDefaulter() { return defaulter; }
    public void setDefaulter(boolean defaulter) { this.defaulter = defaulter; }
}
