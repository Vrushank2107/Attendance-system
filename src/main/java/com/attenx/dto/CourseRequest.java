package com.attenx.dto;

import jakarta.validation.constraints.NotBlank;

public class CourseRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String code;
    private String instructor;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }
}
