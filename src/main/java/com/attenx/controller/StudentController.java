package com.attenx.controller;

import com.attenx.dto.StudentRequest;
import com.attenx.dto.StudentStatsDto;
import com.attenx.model.Student;
import com.attenx.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {
    private final AttendanceService service;

    public StudentController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Student> getAll() {
        return service.getStudents();
    }

    @GetMapping("/{id}")
    public Student getOne(@PathVariable int id) {
        return service.getStudents().stream().filter(s -> s.getId() == id)
                .findFirst().orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    @GetMapping("/{id}/stats")
    public StudentStatsDto getStats(@PathVariable int id) {
        return service.getStudentStats(id);
    }

    @PostMapping
    public Student add(@Valid @RequestBody StudentRequest request) {
        return service.addStudent(request);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable int id, @Valid @RequestBody StudentRequest request) {
        return service.updateStudent(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable int id) {
        service.deleteStudent(id);
        return Map.of("message", "Student deleted");
    }
}
