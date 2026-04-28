# AttenX Backend (Java)

This is a fully in-memory REST backend for the AttenX smart attendance UI.

## Tech
- Java 17
- Spring Boot 3
- No database
- CORS enabled
- Seed data included

## Run
```bash
mvn spring-boot:run
```

Server runs on `http://localhost:8081`

## Main endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`

### Dashboard
- `GET /api/dashboard/teacher`
- `GET /api/dashboard/student/{studentId}`

### Students
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`

### Courses
- `GET /api/courses`
- `POST /api/courses`
- `PUT /api/courses/{id}`
- `DELETE /api/courses/{id}`

### Attendance
- `GET /api/attendance?courseId=1&date=2024-06-01`
- `GET /api/attendance/student/1`
- `POST /api/attendance/bulk`

### Reports / analytics
- `GET /api/reports`
- `GET /api/defaulters`
- `GET /api/analytics`

### Notifications
- `GET /api/notifications/teacher`
- `GET /api/notifications/student/{studentId}`

## Front-end mapping
The UI already contains teacher and student portals, attendance management, student/course CRUD, reports, defaulters, analytics, and student profile views, so these endpoints are shaped to match those screens. 
