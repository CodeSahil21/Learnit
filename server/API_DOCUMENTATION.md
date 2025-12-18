# LMS API Documentation (Backend)

This document specifies the REST API for the LMS backend implemented in:
- Router: [src/routes/index.ts](src/routes/index.ts)
- Middleware: [src/middlewares/auth.middleware.ts](src/middlewares/auth.middleware.ts), [src/middlewares/rbac.middleware.ts](src/middlewares/rbac.middleware.ts), [src/middlewares/mentorApproval.middleware.ts](src/middlewares/mentorApproval.middleware.ts)
- Controllers: [src/controllers/auth.controller.ts](src/controllers/auth.controller.ts), [src/controllers/admin.controller.ts](src/controllers/admin.controller.ts), [src/controllers/course.controller.ts](src/controllers/course.controller.ts), [src/controllers/progress.controller.ts](src/controllers/progress.controller.ts)
- Services: [src/services/auth.service.ts](src/services/auth.service.ts), [src/services/admin.service.ts](src/services/admin.service.ts), [src/services/course.service.ts](src/services/course.service.ts), [src/services/progress.service.ts](src/services/progress.service.ts), [src/services/certificate.service.ts](src/services/certificate.service.ts)

Common requirements:
- Base URL prefix: /api
- Authentication: Bearer JWT in Authorization header for protected endpoints
- Content-Type: application/json for requests with body
- Error response shape: { "message": string }

Tokens:
- Issued by [src/utils/jwt.ts](src/utils/jwt.ts) with payload: { id: string, role: 'STUDENT'|'MENTOR'|'ADMIN' }

Notes:
- Mentor actions require is_verified = true (enforced by requireApprovedMentor).
- Students can only access courses they’re enrolled in and must progress chapters sequentially.
- Admin endpoints are restricted to role ADMIN.

---

## Authentication

### POST /api/auth/register
1) Endpoint Overview
- Registers a new Student account. Only role STUDENT is permitted via API (mentors/admins must be created/approved by Admin).
- Business rules: unique email; password hashed; role forced to STUDENT.

2) HTTP Specification
- Method: POST
- URL: /api/auth/register
- Auth: No
- Headers:
  - Content-Type: application/json

3) Request Body (JSON Schema)
```json
{
  "email": {
    "type": "string",
    "required": true,
    "description": "User email",
    "validation": { "format": "email", "maxLength": 255 }
  },
  "password": {
    "type": "string",
    "required": true,
    "description": "User password",
    "validation": { "minLength": 6, "maxLength": 200 }
  }
}
```

4) Response Body
- 201 Created
```json
{
  "user": { "id": "string", "email": "string", "role": "STUDENT" },
  "token": "jwt-string"
}
```

5) Error Responses
- 409 Conflict: { "message": "Email already in use" }
- 500 Internal Server Error: { "message": "Something went wrong" }
  - Occurs on unhandled validation errors.

6) Validation Rules Summary
- email: must be a valid email; required; unique
- password: min length 6; required

7) Example cURL
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"secret123"}'
```

8) Example Fetch
```js
const res = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@example.com', password: 'secret123' })
});
```

9) Notes & Edge Cases
- Role in request body is ignored; user is always created as STUDENT.
- For mentor registration: Mentors must be created by Admin via POST /api/users with role=MENTOR and require approval.

---

### POST /api/auth/login
1) Overview
- Authenticates a user (Student/Mentor/Admin) and returns JWT.

2) HTTP Specification
- Method: POST
- URL: /api/auth/login
- Auth: No
- Headers: Content-Type: application/json

3) Request Body
```json
{
  "email": { "type": "string", "required": true, "description": "User email", "validation": { "format": "email" } },
  "password": { "type": "string", "required": true, "description": "Password", "validation": { "minLength": 1 } }
}
```

4) Response
- 200 OK
```json
{
  "user": { "id": "string", "email": "string", "role": "STUDENT|MENTOR|ADMIN" },
  "token": "jwt-string"
}
```

5) Errors
- 401 Unauthorized: { "message": "Invalid credentials" }
- 500 Internal Server Error: { "message": "Something went wrong" }

6) Validation Summary
- email: required email
- password: required

7) cURL
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"secret123"}'
```

8) Fetch
```js
const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
```

9) Notes
- JWT includes id, role. Use in Authorization header.

---

### GET /api/auth/me
1) Overview
- Returns the authenticated user profile.

2) HTTP Specification
- Method: GET
- URL: /api/auth/me
- Auth: Bearer token
- Headers: Authorization: Bearer <token>

3) Request Body
- None

4) Response
- 200 OK
```json
{ "user": { "id": "string", "email": "string", "role": "STUDENT|MENTOR|ADMIN" } }
```

5) Errors
- 401 Unauthorized: { "message": "Unauthorized" } or { "message": "Invalid token" }

6) Validation Summary
- N/A

7) cURL
```bash
curl http://localhost:4000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

8) Fetch
```js
const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
```

9) Notes
- Token must be valid and unexpired.

---

## User Management (Admin Only)

### GET /api/users
1) Overview
- Lists all users with basic fields for admin oversight.

2) HTTP Specification
- Method: GET
- URL: /api/users
- Auth: Bearer (ADMIN)

3) Request Body
- None

4) Response
- 200 OK
```json
{
  "data": [
    { "id": "string", "email": "string", "role": "STUDENT|MENTOR|ADMIN", "is_verified": true, "created_at": "ISO-8601" }
  ]
}
```

5) Errors
- 403 Forbidden if role != ADMIN
- 401 Unauthorized if missing/invalid token

6) Validation
- N/A

7) cURL
```bash
curl http://localhost:4000/api/users -H "Authorization: Bearer $ADMIN_TOKEN"
```

8) Fetch
```js
const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${adminToken}` } });
```

9) Notes
- No pagination; consider adding for large datasets.

---

### POST /api/users
1) Overview
- Admin creates a user in any role. Mentors are created unverified and require approval.

2) HTTP Specification
- Method: POST
- URL: /api/users
- Auth: Bearer (ADMIN)
- Headers: Content-Type: application/json

3) Request Body
```json
{
  "email": { "type": "string", "required": true, "description": "User email", "validation": { "format": "email" } },
  "password": { "type": "string", "required": true, "description": "User password", "validation": { "minLength": 6 } },
  "role": { "type": "string", "required": true, "description": "User role", "validation": { "enum": ["STUDENT","MENTOR","ADMIN"] } }
}
```

4) Response
- 201 Created
```json
{
  "data": {
    "id": "string",
    "email": "string",
    "role": "STUDENT|MENTOR|ADMIN",
    "is_verified": true,
    "created_at": "ISO-8601"
  }
}
```

5) Errors
- 400 Bad Request: { "message": "Email, password, and role are required" } or { "message": "Invalid role" } or { "message": "Password must be at least 6 characters" }
- 409 Conflict: { "message": "Email already in use" }
- 403/401 per auth
- 500 Internal Server Error

6) Validation Summary
- email: required email; unique
- password: min 6
- role: enum STUDENT|MENTOR|ADMIN

7) cURL
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"mentor@example.com","password":"secret123","role":"MENTOR"}'
```

8) Fetch
```js
await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${admin}`},body:JSON.stringify({email,password,role})});
```

9) Notes
- Mentors created with is_verified=false.

---

### PUT /api/users/:id/approve-mentor
1) Overview
- Approves a mentor account to enable mentor-only actions.

2) HTTP Specification
- Method: PUT
- URL: /api/users/:id/approve-mentor
- Auth: Bearer (ADMIN)

3) Request Body
- None

4) Response
- 200 OK
```json
{ "data": { "id": "string", "email": "string", "role": "MENTOR", "is_verified": true, "created_at": "ISO-8601" } }
```

5) Errors
- 404: { "message": "User not found" }
- 400: { "message": "User is not a mentor" }
- 403/401: per auth

6) Validation
- N/A

7) cURL
```bash
curl -X PUT http://localhost:4000/api/users/USER_ID/approve-mentor -H "Authorization: Bearer $ADMIN_TOKEN"
```

8) Fetch
```js
await fetch(`/api/users/${id}/approve-mentor`, { method:'PUT', headers:{ Authorization:`Bearer ${admin}` }});
```

9) Notes
- Returns user data excluding password_hash for security.

---

### PUT /api/users/:id/reject-mentor
1) Overview
- Sets a mentor’s is_verified=false.

2) HTTP Specification
- Method: PUT
- URL: /api/users/:id/reject-mentor
- Auth: Bearer (ADMIN)

3) Request Body
- None

4) Response
- 200 OK
```json
{ "data": { "id": "string", "email": "string", "role": "MENTOR", "is_verified": false, "created_at": "ISO-8601" } }
```

5) Errors
- As above (404/400/403/401/500)

6) Validation
- N/A

7) cURL
```bash
curl -X PUT http://localhost:4000/api/users/USER_ID/reject-mentor -H "Authorization: Bearer $ADMIN_TOKEN"
```

8) Fetch
```js
await fetch(`/api/users/${id}/reject-mentor`, { method:'PUT', headers:{ Authorization:`Bearer ${admin}` }});
```

9) Notes
- Disables mentor-only actions. Returns user data excluding password_hash for security.

---

### DELETE /api/users/:id
1) Overview
- Deletes the specified user.

2) HTTP Specification
- Method: DELETE
- URL: /api/users/:id
- Auth: Bearer (ADMIN)

3) Request Body
- None

4) Response
- 200 OK
```json
{ "message": "User deleted successfully" }
```

5) Errors
- 404: { "message": "User not found" }
- 403/401: per auth

6) Validation
- N/A

7) cURL
```bash
curl -X DELETE http://localhost:4000/api/users/USER_ID -H "Authorization: Bearer $ADMIN_TOKEN"
```

8) Fetch
```js
await fetch(`/api/users/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${admin}` }});
```

9) Notes
- Cascading effects handled by DB constraints.

---

### GET /api/admin/stats
1) Overview
- Returns platform-wide analytics: users, courses, and certificates (count of full-completions).

2) HTTP Specification
- Method: GET
- URL: /api/admin/stats
- Auth: Bearer (ADMIN)

3) Request Body
- None

4) Response
- 200 OK
```json
{ "users": 10, "courses": 5, "certificates": 3 }
```

5) Errors
- 403/401

6) Validation
- N/A

7) cURL
```bash
curl http://localhost:4000/api/admin/stats -H "Authorization: Bearer $ADMIN_TOKEN"
```

8) Fetch
```js
await fetch('/api/admin/stats', { headers:{ Authorization:`Bearer ${admin}` }});
```

9) Notes
- Certificates are computed by matching completed progress for all chapters per enrollment.

---

## File Upload

### POST /api/upload
1) Overview
- Uploads files (images/videos) and returns public URLs for use in course content.

2) HTTP Specification
- Method: POST
- URL: /api/upload
- Auth: Bearer (MENTOR approved or ADMIN)
- Headers: Content-Type: multipart/form-data

3) Request Body
- Form data with file field

4) Response
- 200 OK
```json
{ "url": "https://storage-url/filename.jpg" }
```

5) Errors
- 400: Invalid file type or size
- 403: Unauthorized

6) Notes
- Use returned URL in course/chapter creation requests
- Supports common image and video formats

---

## Course Management

### GET /api/courses
1) Overview
- Lists courses:
  - Students: only courses student is enrolled in.
  - Mentors/Admins: all courses.

2) HTTP Specification
- Method: GET
- URL: /api/courses
- Auth: Bearer (any role)

3) Request Body
- None

4) Response
- 200 OK
```json
{
  "data": [
    { "id":"string","title":"string","description":"string","mentor_id":"string","created_at":"ISO-8601","mentor":{"id":"string","email":"string"} }
  ]
}
```

5) Errors
- 401 Unauthorized

6) Validation
- N/A

7) cURL
```bash
curl http://localhost:4000/api/courses -H "Authorization: Bearer $TOKEN"
```

8) Fetch
```js
await fetch('/api/courses', { headers:{ Authorization:`Bearer ${token}` }});
```

9) Notes
- No pagination or filters.

---

### GET /api/courses/my
1) Overview
- Students: enrolled courses. Mentors: courses they own. Admins: all.

2) HTTP
- Method: GET
- URL: /api/courses/my
- Auth: Bearer

3) Request
- None

4) Response
- 200 OK
```json
{ "data": [ /* course list as above */ ] }
```

5) Errors
- 401

6) Validation
- N/A

7) cURL
```bash
curl http://localhost:4000/api/courses/my -H "Authorization: Bearer $TOKEN"
```

8) Fetch
```js
await fetch('/api/courses/my',{headers:{Authorization:`Bearer ${token}`}})
```

9) Notes
- Same structure as /api/courses.

---

### GET /api/courses/:id
1) Overview
- Returns course details:
  - Student: must be enrolled; chapters are gated by sequential access (locked chapters hide content and include a hint message).
  - Mentor: only if owns the course; full details.
  - Admin: full details.

2) HTTP
- Method: GET
- URL: /api/courses/:id
- Auth: Bearer

3) Request
- None

4) Response
- 200 OK
```json
{
  "data": {
    "id":"string","title":"string","description":"string","mentor_id":"string","created_at":"ISO-8601",
    "mentor": { "id":"string","email":"string" },
    "chapters": [
      {
        "id":"string","title":"string","description":"string|\"Complete previous chapters to unlock\"",
        "image_url":"string|null","video_url":"string|null","sequence_number":1,"course_id":"string"
      }
    ]
  }
}
```

5) Errors
- 403: { "message": "Not enrolled in this course" } or { "message": "Can only view your own courses" }
- 404: { "message": "Not found" }
- 401: Unauthorized

6) Validation
- N/A

7) cURL
```bash
curl http://localhost:4000/api/courses/COURSE_ID -H "Authorization: Bearer $TOKEN"
```

8) Fetch
```js
await fetch(`/api/courses/${courseId}`, { headers:{ Authorization:`Bearer ${token}` }});
```

9) Notes
- Student response has gated content; mentor/admin receive full chapter content.

---

### POST /api/courses
1) Overview
- Creates a course. Only approved mentors can create.

2) HTTP
- Method: POST
- URL: /api/courses
- Auth: Bearer (MENTOR approved)
- Headers: Content-Type: application/json

3) Request Body
```json
{
  "title": { "type": "string", "required": true, "description": "Course title", "validation": { "minLength": 1 } },
  "description": { "type": "string", "required": true, "description": "Course description", "validation": { "minLength": 1 } }
}
```

4) Response
- 201 Created
```json
{ "data": { "id":"string","title":"string","description":"string","mentor_id":"string","created_at":"ISO-8601" } }
```

5) Errors
- 403: { "message": "Mentor account not approved" } or { "message": "Can only modify your own courses" }
- 401

6) Validation
- title: required
- description: required

7) cURL
```bash
curl -X POST http://localhost:4000/api/courses \
  -H "Authorization: Bearer $MENTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Node Bootcamp","description":"Learn Node"}'
```

8) Fetch
```js
await fetch('/api/courses',{method:'POST',headers:{Authorization:`Bearer ${mentor}`, 'Content-Type':'application/json'},body:JSON.stringify({title,description})});
```

9) Notes
- mentor_id is set from JWT user id.

---

### PUT /api/courses/:id
1) Overview
- Updates a course. Mentor must own the course or Admin.

2) HTTP
- Method: PUT
- URL: /api/courses/:id
- Auth: Bearer (MENTOR approved) or ADMIN
- Headers: Content-Type: application/json

3) Request Body
```json
{
  "title": { "type": "string", "required": false, "description": "Course title", "validation": { "minLength": 1 } },
  "description": { "type": "string", "required": false, "description": "Course description", "validation": { "minLength": 1 } }
}
```

4) Response
- 200 OK
```json
{ "data": { "id":"string","title":"string","description":"string","mentor_id":"string","created_at":"ISO-8601" } }
```

5) Errors
- 403: { "message": "Can only modify your own courses" } or { "message": "Mentor account not approved" }
- 404: { "message": "Not found" }
- 401

6) Validation
- Fields optional; if present must be non-empty

7) cURL
```bash
curl -X PUT http://localhost:4000/api/courses/COURSE_ID \
  -H "Authorization: Bearer $MENTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Updated"}'
```

8) Fetch
```js
await fetch(`/api/courses/${id}`,{method:'PUT',headers:{Authorization:`Bearer ${mentor}`,'Content-Type':'application/json'},body:JSON.stringify({ title })});
```

9) Notes
- Admin can update any course.

---

### DELETE /api/courses/:id
1) Overview
- Deletes a course. Mentor can delete only own course; Admin can delete any.

2) HTTP
- Method: DELETE
- URL: /api/courses/:id
- Auth: Bearer (MENTOR approved or ADMIN)

3) Request Body
- None

4) Response
- 200 OK
```json
{ "data": { "id":"string","title":"string","description":"string","mentor_id":"string","created_at":"ISO-8601" } }
```

5) Errors
- 403: { "message": "Can only delete your own courses" } or { "message": "Mentor account not approved" }
- 404: { "message": "Not found" }
- 401: { "message": "Unauthorized" }

6) Validation
- N/A

7) cURL
```bash
curl -X DELETE http://localhost:4000/api/courses/COURSE_ID -H "Authorization: Bearer $MENTOR_TOKEN"
```

8) Fetch
```js
await fetch(`/api/courses/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${mentor}`}})
```

9) Notes
- Deleting a course fails if FK constraints prevent it.

---

### GET /api/courses/:id/chapters
1) Overview
- Lists chapters for a course:
  - Student: must be enrolled; gated sequential access (locked chapters hide content).
  - Mentor: only own course; full content.
  - Admin: full content.

2) HTTP
- Method: GET
- URL: /api/courses/:id/chapters
- Auth: Bearer

3) Request
- None

4) Response
- 200 OK
```json
{
  "data": [
    { "id":"string","course_id":"string","title":"string","description":"string|locked-msg","image_url":"string|null","video_url":"string|null","sequence_number":1 }
  ]
}
```

5) Errors
- 403: { "message": "Not enrolled in this course" } or { "message": "Can only view chapters of your own courses" }
- 404: { "message": "Course not found" }
- 401

6) Validation
- N/A

7) cURL
```bash
curl http://localhost:4000/api/courses/COURSE_ID/chapters -H "Authorization: Bearer $TOKEN"
```

8) Fetch
```js
await fetch(`/api/courses/${courseId}/chapters`,{headers:{Authorization:`Bearer ${token}`}})
```

9) Notes
- Locked chapters set description to "Complete previous chapters to unlock" and null image/video.

---

### POST /api/courses/:id/chapters
1) Overview
- Adds a chapter to a course. Mentor must own course and be approved.

2) HTTP
- Method: POST
- URL: /api/courses/:id/chapters
- Auth: Bearer (MENTOR approved)
- Headers: Content-Type: application/json

3) Request Body
```json
{
  "title": { "type": "string", "required": true, "description": "Chapter title", "validation": { "minLength": 1 } },
  "description": { "type": "string", "required": true, "description": "Chapter description", "validation": { "minLength": 1 } },
  "video_url": { "type": "string", "required": false, "description": "Video URL", "validation": { "format": "url" } },
  "image_url": { "type": "string", "required": false, "description": "Image URL", "validation": { "format": "url" } },
  "sequence_number": { "type": "number", "required": true, "description": "Sequence number", "validation": { "integer": true, "minimum": 1 } }
}
```

4) Response
- 201 Created
```json
{ "data": { "id":"string","course_id":"string","title":"string","description":"string","image_url":"string|null","video_url":"string|null","sequence_number":1 } }
```

5) Errors
- 409 Conflict: { "message": "Chapter with this sequence number already exists" }
- 403: { "message": "Can only modify your own courses" } or { "message": "Mentor account not approved" }
- 401: { "message": "Unauthorized" }

6) Validation
- title, description required; sequence_number > 0; unique per course

7) cURL
```bash
curl -X POST http://localhost:4000/api/courses/COURSE_ID/chapters \
  -H "Authorization: Bearer $MENTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Intro","description":"Start","sequence_number":1}'
```

8) Fetch
```js
await fetch(`/api/courses/${courseId}/chapters`,{method:'POST',headers:{Authorization:`Bearer ${mentor}`,'Content-Type':'application/json'},body:JSON.stringify({title,description,sequence_number})});
```

9) Notes
- Sequence must be unique within course.
- For file uploads: Use a two-step process. First upload files to a separate `/api/upload` endpoint to get URLs, then include those URLs in the JSON request body.

---

### POST /api/courses/:id/assign
1) Overview
- Assigns a course to a student (creates enrollment). Mentor must own course and be approved.

2) HTTP
- Method: POST
- URL: /api/courses/:id/assign
- Auth: Bearer (MENTOR approved)
- Headers: Content-Type: application/json

3) Request Body
```json
{
  "user_id": { "type": "string", "required": true, "description": "Student user id" }
}
```

4) Response
- 201 Created
```json
{ "data": { "user_id":"string","course_id":"string","assigned_at":"ISO-8601" } }
```

5) Errors
- 409 Conflict: { "message": "Student already assigned to this course" }
- 403: { "message": "Can only assign your own courses" } or { "message": "Mentor account not approved" }
- 401: { "message": "Unauthorized" }

6) Validation
- user_id required

7) cURL
```bash
curl -X POST http://localhost:4000/api/courses/COURSE_ID/assign \
  -H "Authorization: Bearer $MENTOR_TOKEN" -H "Content-Type: application/json" \
  -d '{"user_id":"STUDENT_ID"}'
```

8) Fetch
```js
await fetch(`/api/courses/${courseId}/assign`,{method:'POST',headers:{Authorization:`Bearer ${mentor}`,'Content-Type':'application/json'},body:JSON.stringify({ user_id })});
```

9) Notes
- Duplicate assignment returns 409.

---

### POST /api/courses/:id/enroll
1) Overview
- Enrolls a student into a course (same model as assign). Mentor must own course and be approved; Admin may enroll any.

2) HTTP
- Method: POST
- URL: /api/courses/:id/enroll
- Auth: Bearer (MENTOR approved or ADMIN)
- Headers: Content-Type: application/json

3) Request Body
```json
{ "user_id": { "type": "string", "required": true, "description": "Student user id" } }
```

4) Response
- 201 Created
```json
{ "data": { "user_id":"string","course_id":"string","assigned_at":"ISO-8601" } }
```

5) Errors
- 409: { "message": "Student already enrolled in this course" }
- 403: { "message": "Can only enroll students in your own courses" } or { "message": "Mentor account not approved" }
- 401: { "message": "Unauthorized" }

6) Validation
- user_id required

7) cURL
```bash
curl -X POST http://localhost:4000/api/courses/COURSE_ID/enroll \
  -H "Authorization: Bearer $MENTOR_OR_ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"user_id":"STUDENT_ID"}'
```

8) Fetch
```js
await fetch(`/api/courses/${courseId}/enroll`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({ user_id })});
```

9) Notes
- Returns 409 on duplicates.

---

### GET /api/courses/:id/progress?userId=<student-id>
1) Overview
- Mentor retrieves a specific student’s progress in a course they own.

2) HTTP
- Method: GET
- URL: /api/courses/:id/progress?userId=STUDENT_ID
- Auth: Bearer (MENTOR approved; must own course)

3) Request Body
- None

4) Response
- 200 OK
```json
{
  "data": {
    "courseId":"string","studentId":"string",
    "totalChapters": 5, "completedChapters": 3, "progressPercentage": 60,
    "chapters":[
      { "id":"string","title":"string","sequence_number":1,"is_completed":true,"completed_at":"ISO-8601|null" }
    ]
  }
}
```

5) Errors
- 400: { "message": "Student userId is required" }
- 403: { "message": "Course not found or not owned by mentor" }
- 401

6) Validation
- userId query required

7) cURL
```bash
curl "http://localhost:4000/api/courses/COURSE_ID/progress?userId=STUDENT_ID" \
  -H "Authorization: Bearer $MENTOR_TOKEN"
```

8) Fetch
```js
await fetch(`/api/courses/${courseId}/progress?userId=${studentId}`,{headers:{Authorization:`Bearer ${mentor}`}})
```

9) Notes
- Only mentors who own the course can access.

---

## Progress Tracking (Students)

### GET /api/progress/my?courseId=<course-id>
1) Overview
- Returns the student’s progress for a specific course.

2) HTTP
- Method: GET
- URL: /api/progress/my?courseId=COURSE_ID
- Auth: Bearer (STUDENT)

3) Request Body
- None

4) Response
- 200 OK
```json
{
  "data": {
    "courseId":"string","totalChapters":5,"completedChapters":3,"progressPercentage":60,
    "chapters":[
      { "chapter_id":"string","sequence_number":1,"is_completed":true,"completed_at":"ISO-8601|null" }
    ]
  }
}
```

5) Errors
- 400: { "message": "Course ID is required" }
- 403/401 depending on enrollment or token

6) Validation
- courseId query required

7) cURL
```bash
curl "http://localhost:4000/api/progress/my?courseId=COURSE_ID" -H "Authorization: Bearer $STUDENT_TOKEN"
```

8) Fetch
```js
await fetch(`/api/progress/my?courseId=${courseId}`,{headers:{Authorization:`Bearer ${student}`}})
```

9) Notes
- Progress is computed over ordered chapters.

---

### POST /api/progress/:chapterId/complete
1) Overview
- Marks a chapter as completed, enforcing sequential order and enrollment.

2) HTTP
- Method: POST
- URL: /api/progress/:chapterId/complete
- Auth: Bearer (STUDENT)

3) Request Body
- None

4) Response
- 200 OK
```json
{ "data": { "user_id":"string","chapter_id":"string","is_completed":true,"completed_at":"ISO-8601" } }
```

5) Errors
- 404: { "message": "Chapter not found" }
- 403: { "message": "Not enrolled in this course" } or { "message": "Previous chapter not completed" }
- 401

6) Validation
- N/A

7) cURL
```bash
curl -X POST http://localhost:4000/api/progress/CHAPTER_ID/complete -H "Authorization: Bearer $STUDENT_TOKEN"
```

8) Fetch
```js
await fetch(`/api/progress/${chapterId}/complete`,{method:'POST',headers:{Authorization:`Bearer ${student}`}})
```

9) Notes
- Operation is idempotent for already completed progress (will upsert to completed).

---

## Certificates

### GET /api/certificates/:courseId
1) Overview
- Generates and downloads a PDF certificate if the student completed all chapters of the course.

2) HTTP
- Method: GET
- URL: /api/certificates/:courseId
- Auth: Bearer (STUDENT)

3) Request Body
- None

4) Response
- 200 OK
- Headers:
  - Content-Type: application/pdf
  - Content-Disposition: attachment; filename=certificate.pdf
- Body: PDF binary

5) Errors
- 403: { "message": "Not enrolled in course" }
- 404: { "message": "Course or user not found" }
- 400: { "message": "Cannot generate certificate for course with no chapters" } or { "message": "Course not completed" }
- 401

6) Validation
- N/A

7) cURL
```bash
curl -L -o certificate.pdf http://localhost:4000/api/certificates/COURSE_ID -H "Authorization: Bearer $STUDENT_TOKEN"
```

8) Fetch
```js
const res = await fetch(`/api/certificates/${courseId}`,{headers:{Authorization:`Bearer ${student}`}});
const blob = await res.blob();
```

9) Notes
- PDF is generated dynamically; repeatable download after completion.

---

## Common Error Responses

- 400 Bad Request
  - Missing required fields or invalid manual checks
  - Example: { "message": "Course ID is required" }

- 401 Unauthorized
  - Missing/invalid token
  - Example: { "message": "Unauthorized" } or { "message": "Invalid token" }

- 403 Forbidden
  - Insufficient permissions, unapproved mentor, not enrolled, not owner
  - Example: { "message": "Mentor account not approved" }

- 404 Not Found
  - Resource not found
  - Example: { "message": "Not found" }

- 409 Conflict
  - Unique constraint conflicts (email, enrollment, chapter sequence)
  - Example: { "message": "Student already enrolled in this course" }

- 422 Validation Error
  - Not explicitly returned by current code; validation failures may surface as 500.
  - Example: { "message": "Unprocessable entity" }

- 500 Internal Server Error
  - Unhandled errors, including Zod parse errors
  - Example: { "message": "Something went wrong" }

---

## Validation Rules Summary

| Field                | Rule                                | Description                                  |
|----------------------|-------------------------------------|----------------------------------------------|
| email                | required, email, unique             | Used on register/login/create user           |
| password             | required, min 6                     | User password                                |
| role                 | enum(STUDENT,MENTOR,ADMIN)          | Admin create user only                       |
| title                | required (create), non-empty        | Course/Chapter title                         |
| description          | required (create), non-empty        | Course/Chapter description                   |
| sequence_number      | integer, min 1, unique per course   | Chapter ordering                             |
| user_id (enroll)     | required                            | Target student for enroll/assign             |
| courseId (query)     | required                            | Progress endpoint                             |
| userId (query)       | required                            | Mentor progress endpoint                      |

---

## Notes & Edge Cases

- RBAC:
  - All protected routes require Bearer token.
  - Mentor-only actions require is_verified = true.
  - Mentors can only manage/view their own courses.
- Sequential Access:
  - Students can only complete chapters in order; locked chapters hide content on GET endpoints.
- Idempotency:
  - Enroll/Assign return 409 on duplicates.
  - Progress completion upserts to completed state.
- Responses:
  - Admin user endpoints exclude password_hash for security.
- Pagination/Filtering:
  - Not implemented on list endpoints.
- Rate Limits:
  - Not implemented at API layer.

---