package com.attenx.model;

public class Course {
    private int id;
    private String name;
    private String code;
    private String instructor;

    public Course() {}

    public Course(int id, String name, String code, String instructor) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.instructor = instructor;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }
}
