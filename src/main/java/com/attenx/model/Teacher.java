package com.attenx.model;

import java.util.UUID;

public class Teacher {
    private String id;
    private String name;
    private String email;
    private String password;
    private String subject;
    private String empId;

    public Teacher(String name, String email, String password, String subject, String empId) {
        this.id      = "t-" + UUID.randomUUID().toString().substring(0, 8);
        this.name    = name;
        this.email   = email;
        this.password= password;
        this.subject = subject;
        this.empId   = empId;
    }

    // Called by MySQLStore when loading from DB to restore the real DB id
    public void setDbId(String id) { this.id = id; }

    public String getId()       { return id; }
    public String getName()     { return name; }
    public void   setName(String name)       { this.name = name; }
    public String getEmail()    { return email; }
    public void   setEmail(String email)     { this.email = email; }
    public String getPassword() { return password; }
    public void   setPassword(String password){ this.password = password; }
    public String getSubject()  { return subject; }
    public void   setSubject(String subject) { this.subject = subject; }
    public String getEmpId()    { return empId; }
    public void   setEmpId(String empId)     { this.empId = empId; }
}