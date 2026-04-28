package com.attenx.controller;

import com.attenx.dto.CourseRequest;
import com.attenx.model.Course;
import com.attenx.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {
    private final AttendanceService service;

    public CourseController(AttendanceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Course> getAll() {
        return service.getCourses();
    }

    @PostMapping
    public Course add(@Valid @RequestBody CourseRequest request) {
        return service.addCourse(request);
    }

    @PutMapping("/{id}")
    public Course update(@PathVariable int id, @Valid @RequestBody CourseRequest request) {
        return service.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable int id) {
        service.deleteCourse(id);
        return Map.of("message", "Course deleted");
    }
}
