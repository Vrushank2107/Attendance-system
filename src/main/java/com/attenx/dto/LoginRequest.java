package com.attenx.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    // Changed from PortalRole enum to String
    // JS sends "TEACHER" or "STUDENT" as plain string
    @NotBlank
    private String portal;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    public String  getPortal()                   { return portal; }
    public void    setPortal(String portal)      { this.portal = portal; }
    public String  getEmail()                    { return email; }
    public void    setEmail(String email)        { this.email = email; }
    public String  getPassword()                 { return password; }
    public void    setPassword(String password)  { this.password = password; }

    // Helper: true if portal is "TEACHER" (case-insensitive)
    public boolean isTeacher() {
        return "TEACHER".equalsIgnoreCase(portal);
    }
}