package com.attenx.controller;

import com.attenx.dto.*;
import com.attenx.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {
    private final AttendanceService service;

    public DashboardController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "AttenX backend");
    }

    @GetMapping("/dashboard/teacher")
    public DashboardDto teacherDashboard() {
        return service.getTeacherDashboard();
    }

    @GetMapping("/dashboard/student/{studentId}")
    public StudentStatsDto studentDashboard(@PathVariable("studentId") int studentId) {
        return service.getStudentStats(studentId);
    }

    @GetMapping("/reports")
    public List<StudentStatsDto> reports(@RequestParam(name = "courseId", required = false) Integer courseId) {
        if (courseId == null) {
            return service.getAllStats();
        }
        return service.getAllStats().stream().filter(s -> s.getCourseId() == courseId).toList();
    }

    @GetMapping("/defaulters")
    public List<StudentStatsDto> defaulters() {
        return service.getDefaulters();
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        return service.getAnalytics();
    }

    @GetMapping("/notifications/teacher")
    public List<NotificationDto> teacherNotifs() {
        return service.getTeacherNotifications();
    }

    @GetMapping("/notifications/student/{studentId}")
    public List<NotificationDto> studentNotifs(@PathVariable("studentId") int studentId) {
        return service.getStudentNotifications(studentId);
    }
}
