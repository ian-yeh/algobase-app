# Algobase API Documentation

Base URL: `http://localhost:8000` (development)

## Authentication

All endpoints except `/` require a **Supabase JWT token** in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The JWT payload must contain:
- `sub` (string) — User ID from Supabase
- `email` (string) — User email

**Example Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0.signature
```

---

## Endpoints

### Health Check

**GET** `/`

Check API availability.

**Response:**
```json
{
  "status": "200"
}
```

---

## User Management

### Create or Update User

**POST** `/user`

Creates a new user if they don't exist, or updates `lastActivityDate` if they do. Returns user profile.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "speedcuber123",
  "imageUrl": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "user-id-from-jwt",
  "username": "speedcuber123",
  "email": "user@example.com",
  "emailVerified": false,
  "imageUrl": "https://example.com/avatar.jpg",
  "lastActivityDate": "2026-05-18T10:30:00"
}
```

**Status Codes:**
- `200` — User created or updated successfully
- `401` — Missing or invalid authorization

**Example:**
```bash
curl -X POST http://localhost:8000/user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "speedcuber123",
    "imageUrl": "https://example.com/avatar.jpg"
  }'
```

---

### Update User Profile

**PUT** `/user`

Updates user information (username, email, image). Updates `lastActivityDate`.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "imageUrl": "https://example.com/new-avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user-id-from-jwt",
    "username": "newusername",
    "email": "newemail@example.com",
    "emailVerified": false,
    "imageUrl": "https://example.com/new-avatar.jpg",
    "lastActivityDate": "2026-05-18T11:00:00"
  }
}
```

**Status Codes:**
- `200` — User updated successfully
- `401` — Missing or invalid authorization
- `500` — User not found (should not happen if user exists in database)

**Example:**
```bash
curl -X PUT http://localhost:8000/user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com",
    "username": "newusername",
    "imageUrl": "https://example.com/new-avatar.jpg"
  }'
```

---

## Solve Management

### Get All Solves

**GET** `/solve`

Retrieves all cube solves for the authenticated user, ordered by creation date (oldest first).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- None

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "cube_type": "3x3",
    "time": 45.32,
    "scramble": "R U R' U' R U R' U'",
    "dnf": false,
    "createdAt": "2026-05-18T08:00:00"
  },
  {
    "id": 2,
    "cube_type": "3x3",
    "time": 42.15,
    "scramble": "M' U M U2 M' U M",
    "dnf": false,
    "createdAt": "2026-05-18T09:30:00"
  }
]
```

**Status Codes:**
- `200` — Solves retrieved successfully (empty array if no solves)
- `401` — Missing or invalid authorization

**Example:**
```bash
curl -X GET http://localhost:8000/solve \
  -H "Authorization: Bearer <token>"
```

---

### Record a New Solve

**POST** `/solve`

Creates and records a new cube solve for the authenticated user.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "cube_type": "3x3",
  "time": 45.32,
  "scramble": "R U R' U' R U R' U'",
  "dnf": false
}
```

**Field Descriptions:**
- `cube_type` (string) — Type of cube solved. Valid values:
  - `2x2`, `3x3`, `4x4`, `5x5`, `6x6`, `7x7`
  - `Megaminx`, `Pyraminx`, `Skewb`, `Square-1`
- `time` (float) — Solve time in seconds (e.g., `45.32`)
- `scramble` (string) — The scramble sequence used
- `dnf` (boolean) — Did Not Finish flag

**Response (200 OK):**
```json
{
  "id": 3,
  "cube_type": "3x3",
  "time": 45.32,
  "scramble": "R U R' U' R U R' U'",
  "dnf": false,
  "createdAt": "2026-05-18T10:15:00"
}
```

**Status Codes:**
- `200` — Solve recorded successfully
- `401` — Missing or invalid authorization
- `422` — Validation error (invalid cube type, missing fields, etc.)

**Example:**
```bash
curl -X POST http://localhost:8000/solve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cube_type": "3x3",
    "time": 45.32,
    "scramble": "R U R'\''U'\'' R U R'\''U'\''",
    "dnf": false
  }'
```

---

### Delete a Solve

**DELETE** `/solve/{solve_id}`

Deletes a specific solve. Only the user who created the solve can delete it.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `solve_id` (integer) — The ID of the solve to delete

**Response (200 OK):**
```json
{
  "status": "success"
}
```

**Status Codes:**
- `200` — Solve deleted successfully
- `401` — Missing or invalid authorization
- `404` — Solve not found or does not belong to the authenticated user

**Example:**
```bash
curl -X DELETE http://localhost:8000/solve/3 \
  -H "Authorization: Bearer <token>"
```

---

## Statistics

### Get Performance Statistics

**GET** `/stats`

Calculates and returns performance statistics for the authenticated user based on all their solves.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200 OK):**
```json
{
  "best_ao5": 45.21,
  "best_ao12": 46.53,
  "best_ao100": 48.12,
  "best_time": 40.22,
  "total_solves": 156
}
```

**Field Descriptions:**
- `best_ao5` (float) — Best average of 5 consecutive solves (seconds)
- `best_ao12` (float) — Best average of 12 consecutive solves (seconds)
- `best_ao100` (float) — Best average of 100 consecutive solves (seconds)
- `best_time` (float) — Fastest single solve (seconds)
- `total_solves` (integer) — Total number of recorded solves

**Status Codes:**
- `200` — Statistics calculated successfully
- `401` — Missing or invalid authorization

**Example:**
```bash
curl -X GET http://localhost:8000/stats \
  -H "Authorization: Bearer <token>"
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios

**Missing Authorization Header (401):**
```json
{
  "detail": "Authorization header missing or invalid"
}
```

**Invalid JWT Token (401):**
```json
{
  "detail": "Invalid token: [error details]"
}
```

**Solve Not Found (404):**
```json
{
  "detail": "Solve not found"
}
```

**Validation Error (422):**
```json
{
  "detail": "1 validation error for Request\ncube_type\n  string should be one of: 2x2, 3x3, etc. (type=enum)"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Times are recorded in seconds with decimal precision
- DNF (Did Not Finish) solves are included in the solves list but may be excluded from certain stat calculations
- The API currently allows all origins (CORS enabled globally) — this should be restricted in production
- Database timestamps (`lastActivityDate`, `createdAt`) are automatically set by the backend
