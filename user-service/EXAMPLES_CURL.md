# Exemples de requêtes cURL pour Learnivo API

## Configuration
Base URL: `http://localhost:8080`

## 1. Authentification

### Register (Student)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'
```

### Register (Society Agent)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123",
    "role": "SOCIETY_AGENT",
    "societyName": "Tech Corp",
    "societyEmail": "contact@techcorp.com",
    "societyPhone": "+1234567890",
    "societyAddress": "123 Tech Street"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

Réponse:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "student@example.com",
  "role": "STUDENT"
}
```

### Get Current User (Me)
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 2. User Management (Admin seulement)

### Get All Users
```bash
curl -X GET "http://localhost:8080/api/users?page=0&size=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Get User by ID
```bash
curl -X GET http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Create User (Admin)
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "professor@example.com",
    "password": "password123",
    "role": "PROFESSOR",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "address": "456 University Ave"
  }'
```

### Update User
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "status": "ACTIVE",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Delete User (Soft Delete)
```bash
curl -X DELETE http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## 3. Support Tickets

### Create Ticket (Student)
```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Problem with course access",
    "description": "I cannot access the course materials",
    "priority": "HIGH"
  }'
```

### Get All Tickets
```bash
# Pour Student: retourne seulement ses tickets
# Pour Admin/Professor: retourne tous les tickets
curl -X GET "http://localhost:8080/api/tickets?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Ticket by ID
```bash
curl -X GET http://localhost:8080/api/tickets/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Ticket (Admin/Professor)
```bash
curl -X PUT http://localhost:8080/api/tickets/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "URGENT"
  }'
```

### Add Message to Ticket
```bash
curl -X POST http://localhost:8080/api/tickets/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I have reviewed your issue and will investigate."
  }'
```

### Get Ticket Messages
```bash
curl -X GET http://localhost:8080/api/tickets/1/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes importantes

1. Remplacez `YOUR_TOKEN_HERE` par le token JWT obtenu lors du login
2. Pour créer un Admin, vous devez d'abord vous connecter en tant qu'Admin existant ou modifier directement la base de données
3. Les endpoints `/api/users/**` sont accessibles uniquement aux utilisateurs avec le rôle ADMIN
4. Les étudiants ne peuvent créer des tickets que pour eux-mêmes
5. Les étudiants ne peuvent voir que leurs propres tickets
