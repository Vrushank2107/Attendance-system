package com.attenx.dto;

import com.attenx.model.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AttendanceMarkRequest {
    @NotNull
    private Integer courseId;

    @NotBlank
    private String date; // ISO yyyy-MM-dd

    @NotNull
    private List<Item> records;

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public List<Item> getRecords() { return records; }
    public void setRecords(List<Item> records) { this.records = records; }

    public static class Item {
        @NotNull
        private Integer studentId;
        @NotNull
        private AttendanceStatus status;

        public Integer getStudentId() { return studentId; }
        public void setStudentId(Integer studentId) { this.studentId = studentId; }
        public AttendanceStatus getStatus() { return status; }
        public void setStatus(AttendanceStatus status) { this.status = status; }
    }
}
