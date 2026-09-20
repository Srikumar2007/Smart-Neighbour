# Smart Neighbour Backend (Java 21 + Spring Boot 3)

Production-grade Spring Boot 3 backend for **Smart Neighbour** — a community trust, resource sharing, and hazard reporting platform for housing societies and residential townships.

---

## 1. Complete Backend Folder Structure

```
backend/
├── pom.xml
├── .env.example
├── README.md
└── src/
    └── main/
        ├── resources/
        │   └── application.properties
        └── java/
            └── com/
                └── smartneighbour/
                    ├── SmartNeighbourApplication.java
                    ├── config/
                    │   ├── SecurityConfig.java
                    │   └── DataInitializer.java
                    ├── controller/
                    │   ├── AdminController.java
                    │   ├── AnnouncementController.java
                    │   ├── AuthController.java
                    │   ├── BorrowRequestController.java
                    │   ├── CommunityEventController.java
                    │   ├── ItemController.java
                    │   ├── NotificationController.java
                    │   ├── SafetyReportController.java
                    │   ├── TrustController.java
                    │   └── UserController.java
                    ├── dto/
                    │   ├── AnnouncementDto.java
                    │   ├── ApiResponse.java
                    │   ├── AuthDto.java
                    │   ├── BorrowRequestDto.java
                    │   ├── EventDto.java
                    │   ├── ItemDto.java
                    │   ├── NotificationDto.java
                    │   ├── SafetyReportDto.java
                    │   └── TrustDto.java
                    ├── entity/
                    │   ├── AvailabilityStatus.java
                    │   ├── BorrowRequest.java
                    │   ├── BorrowRequestStatus.java
                    │   ├── CommunityAnnouncement.java
                    │   ├── CommunityEvent.java
                    │   ├── EventParticipant.java
                    │   ├── Item.java
                    │   ├── ItemCategory.java
                    │   ├── Notification.java
                    │   ├── Role.java
                    │   ├── SafetyCategory.java
                    │   ├── SafetyReport.java
                    │   ├── SafetySeverity.java
                    │   ├── SafetyStatus.java
                    │   ├── TrustTransaction.java
                    │   └── User.java
                    ├── exception/
                    │   ├── AppException.java
                    │   └── GlobalExceptionHandler.java
                    ├── repository/
                    │   ├── BorrowRequestRepository.java
                    │   ├── CommunityAnnouncementRepository.java
                    │   ├── CommunityEventRepository.java
                    │   ├── EventParticipantRepository.java
                    │   ├── ItemRepository.java
                    │   ├── NotificationRepository.java
                    │   ├── SafetyReportRepository.java
                    │   ├── TrustTransactionRepository.java
                    │   └── UserRepository.java
                    ├── security/
                    │   ├── CustomUserDetailsService.java
                    │   ├── JwtAuthenticationFilter.java
                    │   ├── JwtTokenProvider.java
                    │   └── UserPrincipal.java
                    └── service/
                        ├── AnnouncementService.java
                        ├── BorrowRequestService.java
                        ├── CommunityEventService.java
                        ├── ItemService.java
                        ├── NotificationService.java
                        ├── SafetyReportService.java
                        ├── TrustService.java
                        └── UserService.java
```

---

## 2. Entity Relationships

- **User → Items**: `One-to-Many` (`User.items` ↔ `Item.owner`)
- **User → BorrowRequests**: `One-to-Many` (`User.borrowRequests` ↔ `BorrowRequest.borrower` and `BorrowRequest.owner`)
- **User → SafetyReports**: `One-to-Many` (`User.safetyReports` ↔ `SafetyReport.reporter`)
- **User → Events**: `One-to-Many` (`User.events` ↔ `CommunityEvent.organizer`)
- **User → TrustTransactions**: `One-to-Many` (`User.trustTransactions` ↔ `TrustTransaction.user`)
- **User → Notifications**: `One-to-Many` (`User.notifications` ↔ `Notification.user`)
- **Event → EventParticipants**: `One-to-Many` (`CommunityEvent.participants` ↔ `EventParticipant.event`), with unique constraint on `(event_id, user_id)`
- **Item → BorrowRequests**: `One-to-Many` (`Item.borrowRequests` ↔ `BorrowRequest.item`)

---

## 3. API Endpoint Reference

### Authentication
- `POST /api/auth/register` — Register a new resident
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated resident info

### Users
- `GET /api/users/me` — Get personal profile details
- `PUT /api/users/me` — Update resident profile (phone, avatar, flat, block)
- `GET /api/users/{id}` — Get public profile and trust score of another resident

### Marketplace Items (Share & Borrow)
- `GET /api/items` — List items (supports filter `?category=TOOLS&status=AVAILABLE&search=drill`)
- `GET /api/items/{id}` — Get single item details, owner trust score, and availability
- `POST /api/items` — List a new item for lending
- `PUT /api/items/{id}` — Update item details
- `DELETE /api/items/{id}` — Remove item from marketplace

### Borrow Requests
- `POST /api/borrow-requests` — Request to borrow an item
- `GET /api/borrow-requests/my` — Get borrow requests initiated by current user
- `GET /api/borrow-requests/received` — Get requests received for user's lending items
- `PUT /api/borrow-requests/{id}/approve` — Owner approves request
- `PUT /api/borrow-requests/{id}/reject` — Owner declines request
- `PUT /api/borrow-requests/{id}/return` — Mark item returned and award trust points

### Safety & Hazard Reports
- `GET /api/safety-reports` — List safety hazard reports (filter `?category=LIGHTING&status=VERIFIED`)
- `GET /api/safety-reports/{id}` — Get hazard report details
- `POST /api/safety-reports` — Submit a hazard report (+5 trust points)
- `PUT /api/safety-reports/{id}` — Update hazard details
- `DELETE /api/safety-reports/{id}` — Delete or dismiss hazard

### Community Events
- `GET /api/events` — List upcoming community events
- `GET /api/events/{id}` — Get event details with attendees list
- `POST /api/events` — Organize a new event (+20 trust points)
- `PUT /api/events/{id}` — Update event details
- `DELETE /api/events/{id}` — Cancel event
- `POST /api/events/{id}/join` — RSVP / Join event (+5 trust points)
- `DELETE /api/events/{id}/leave` — Cancel attendance

### Trust & Reputation
- `GET /api/trust/me` — Get trust points, tier (e.g., COMMUNITY_PILLAR), and metrics
- `GET /api/trust/me/history` — Get trust transaction log

### Notifications
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/{id}/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all as read

### Announcements
- `GET /api/announcements` — List active society announcements
- `POST /api/announcements` — Broadcast announcement (*Admin only*)
- `PUT /api/announcements/{id}` — Update announcement (*Admin only*)
- `DELETE /api/announcements/{id}` — Delete announcement (*Admin only*)

### Admin Controls
- `GET /api/admin/users` — List all registered society residents
- `PUT /api/admin/users/{id}/status` — Enable / disable resident access
- `GET /api/admin/safety-reports` — All reports including rejected/pending
- `PUT /api/admin/safety-reports/{id}/verify` — Mark hazard verified (+10 trust points to reporter)
- `PUT /api/admin/safety-reports/{id}/resolve` — Mark hazard resolved
- `DELETE /api/admin/safety-reports/{id}` — Dismiss report

---

## 4. MySQL Setup Instructions

1. Log into your MySQL instance:
```bash
mysql -u root -p
```

2. Create database and dedicated user:
```sql
CREATE DATABASE IF NOT EXISTS smart_neighbour CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'smart_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON smart_neighbour.* TO 'smart_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 5. How to Run Spring Boot

### Prerequisites:
- Java 21 JDK installed (`java -version`)
- Maven 3.9+ installed (`mvn -version`)

### Execution:

1. Navigate to the backend directory:
```bash
cd backend
```

2. Set environment variables (or export them):
```bash
export DB_URL="jdbc:mysql://localhost:3306/smart_neighbour?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="smart_user"
export DB_PASSWORD="StrongPassword123!"
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
```

3. Build and test:
```bash
mvn clean package -DskipTests
```

4. Run the application:
```bash
mvn spring-boot:run
```
Or run the packaged JAR:
```bash
java -jar target/smart-neighbour-backend-1.0.0.jar
```

The server will start on port `8080`. Automatic seeding via `DataInitializer.java` populates Pondicherry coastal community data on first boot.

---

## 6. Example API Requests and Responses

### 1. Register Resident
`POST /api/auth/register`
```json
{
  "fullName": "Ananya Roy",
  "email": "ananya.roy@oakridge.community",
  "password": "securepassword123",
  "phone": "+91 98765 12345",
  "apartmentNumber": "304",
  "block": "La Bourdonnais (Block C)"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Resident account registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzIi...",
    "tokenType": "Bearer",
    "user": {
      "id": 3,
      "fullName": "Ananya Roy",
      "email": "ananya.roy@oakridge.community",
      "apartmentNumber": "304",
      "block": "La Bourdonnais (Block C)",
      "role": "RESIDENT",
      "trustPoints": 50,
      "active": true
    }
  },
  "timestamp": "2026-09-19T10:15:30"
}
```

### 2. Request to Borrow Item
`POST /api/borrow-requests`
*Headers:* `Authorization: Bearer <token>`
```json
{
  "itemId": 1,
  "requestedFrom": "2026-09-20T10:00:00",
  "requestedUntil": "2026-09-22T18:00:00",
  "message": "Hi Marcus, need to fix a curtain bracket in our living room. Will return it cleaned!"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Borrow request sent to owner",
  "data": {
    "id": 1,
    "itemId": 1,
    "itemName": "Bosch Cordless Power Drill Set",
    "borrowerId": 2,
    "borrowerName": "Priya Sharma",
    "ownerId": 3,
    "ownerName": "Marcus Chen",
    "requestedFrom": "2026-09-20T10:00:00",
    "requestedUntil": "2026-09-22T18:00:00",
    "status": "PENDING"
  },
  "timestamp": "2026-09-19T10:16:00"
}
```

### 3. Submit Hazard Report in Pondicherry
`POST /api/safety-reports`
*Headers:* `Authorization: Bearer <token>`
```json
{
  "title": "Loose Paver Tile Near Rue Suffren Gate",
  "description": "Uneven paver blocks on walkway creating tripping hazard for joggers and evening walkers.",
  "category": "INFRASTRUCTURE",
  "severity": "MEDIUM",
  "latitude": 11.9324,
  "longitude": 79.8298,
  "block": "Promenade Gate"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Safety hazard report submitted",
  "data": {
    "id": 1,
    "title": "Loose Paver Tile Near Rue Suffren Gate",
    "category": "INFRASTRUCTURE",
    "severity": "MEDIUM",
    "latitude": 11.9324,
    "longitude": 79.8298,
    "status": "PENDING",
    "reporterName": "Priya Sharma"
  },
  "timestamp": "2026-09-19T10:17:00"
}
```
