package com.attenx.controller;

import com.attenx.dto.*;
import com.attenx.model.*;
import com.attenx.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AttendanceService service;

    public AuthController(AttendanceService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        if (request.isTeacher()) {
            Teacher t = service.authenticateTeacher(request.getEmail(), request.getPassword())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid teacher credentials"));
            return Map.of(
                "role",    "teacher",
                "id",      t.getId(),
                "name",    t.getName(),
                "email",   t.getEmail(),
                "subject", t.getSubject() != null ? t.getSubject() : "",
                "empId",   t.getEmpId()   != null ? t.getEmpId()   : ""
            );
        } else {
            Student s = service.authenticateStudent(request.getEmail(), request.getPassword())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid student credentials"));
            return Map.of(
                "role",     "student",
                "id",       s.getId(),
                "name",     s.getName(),
                "email",    s.getEmail(),
                "roll",     s.getRoll()     != null ? s.getRoll() : "",
                "courseId", s.getCourseId()
            );
        }
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        if (request.isTeacher()) {
            service.registerTeacher(request);
            return Map.of("message", "Teacher account created successfully");
        } else {
            service.registerStudent(request);
            return Map.of("message", "Student account created successfully");
        }
    }
}