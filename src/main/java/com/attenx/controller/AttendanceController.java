package com.attenx.controller;

import com.attenx.dto.AttendanceMarkRequest;
import com.attenx.model.AttendanceRecord;
import com.attenx.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping
    public List<AttendanceRecord> getByCourseAndDate(
            @RequestParam(name = "courseId", required = false) Integer courseId,
            @RequestParam(name = "date", required = false) String date) {
        return service.getAttendanceByCourseAndDate(courseId, date);
    }

    @GetMapping("/student/{studentId}")
    public List<AttendanceRecord> getForStudent(@PathVariable("studentId") int studentId) {
        return service.getAttendanceForStudent(studentId);
    }

    @PostMapping("/bulk")
    public Map<String, Object> saveBulk(@Valid @RequestBody AttendanceMarkRequest request) {
        List<AttendanceRecord> saved = service.markAttendance(request);
        return Map.of("message", "Attendance saved", "records", saved);
    }
}
