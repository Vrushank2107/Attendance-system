package com.attenx.dto;

import java.util.List;

public class DashboardDto {
    private int totalStudents;
    private int activeCourses;
    private int defaulters;
    private int totalAttendanceEntries;
    private int presentCount;
    private int absentCount;
    private int overallAttendancePercent;
    private List<RecentAttendanceDto> recentAttendance;

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public int getActiveCourses() { return activeCourses; }
    public void setActiveCourses(int activeCourses) { this.activeCourses = activeCourses; }
    public int getDefaulters() { return defaulters; }
    public void setDefaulters(int defaulters) { this.defaulters = defaulters; }
    public int getTotalAttendanceEntries() { return totalAttendanceEntries; }
    public void setTotalAttendanceEntries(int totalAttendanceEntries) { this.totalAttendanceEntries = totalAttendanceEntries; }
    public int getPresentCount() { return presentCount; }
    public void setPresentCount(int presentCount) { this.presentCount = presentCount; }
    public int getAbsentCount() { return absentCount; }
    public void setAbsentCount(int absentCount) { this.absentCount = absentCount; }
    public int getOverallAttendancePercent() { return overallAttendancePercent; }
    public void setOverallAttendancePercent(int overallAttendancePercent) { this.overallAttendancePercent = overallAttendancePercent; }
    public List<RecentAttendanceDto> getRecentAttendance() { return recentAttendance; }
    public void setRecentAttendance(List<RecentAttendanceDto> recentAttendance) { this.recentAttendance = recentAttendance; }
}
