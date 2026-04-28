package com.attenx.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RegisterRequest {

    // Changed from PortalRole enum to String
    // JS sends "TEACHER" or "STUDENT" as plain string
    @NotBlank
    private String portal;

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String  empId;
    private String  subject;
    private Integer courseId;
    private String  roll;

    public String  getPortal()                   { return portal; }
    public void    setPortal(String portal)      { this.portal = portal; }
    public String  getName()                     { return name; }
    public void    setName(String name)          { this.name = name; }
    public String  getEmail()                    { return email; }
    public void    setEmail(String email)        { this.email = email; }
    public String  getPassword()                 { return password; }
    public void    setPassword(String password)  { this.password = password; }
    public String  getEmpId()                    { return empId; }
    public void    setEmpId(String empId)        { this.empId = empId; }
    public String  getSubject()                  { return subject; }
    public void    setSubject(String subject)    { this.subject = subject; }
    public Integer getCourseId()                 { return courseId; }
    public void    setCourseId(Integer courseId) { this.courseId = courseId; }
    public String  getRoll()                     { return roll; }
    public void    setRoll(String roll)          { this.roll = roll; }

    // Helper: true if portal is "TEACHER" (case-insensitive)
    public boolean isTeacher() {
        return "TEACHER".equalsIgnoreCase(portal);
    }
}