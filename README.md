# 🔗 KMS Chain — Blockchain Document Verification System

A production-grade full-stack web application for **tamper-proof document management** using a custom Java blockchain, SHA-256 cryptographic hashing, JWT authentication, and role-based access control.

---

## 🏗 Tech Stack

| Layer       | Technology                                       |
|-------------|--------------------------------------------------|
| Frontend    | React 18, React Router v6, Axios, Recharts, Lucide |
| Backend     | Spring Boot 3.2, Spring Security 6, JPA/Hibernate |
| Auth        | JWT (jjwt 0.11.5), BCrypt password hashing       |
| Database    | MySQL 8 — 4 tables, auto DDL                     |
| Blockchain  | Custom Java SHA-256 Proof-of-Work blockchain     |
| QR Codes    | Google ZXing 3.5.2                               |
| API Docs    | Swagger UI — http://localhost:8080/swagger-ui.html |

---

## ⭐ Unique Features

1. **QR Code per document** — Every document gets a unique QR code. Scan it to instantly verify on the public portal, no account needed.
2. **Document Version Control** — Upload v1, v2, v3 of any document. Full version history linked on the blockchain.
3. **Document Expiry / TTL** — Set expiry dates. Documents auto-expire via a scheduled background job.
4. **Document Categories** — Legal, Academic, Financial, Medical, Contract, Certificate, Identity, Other.
5. **Bulk Upload** — Upload up to 20 files at once. Each gets its own blockchain block.
6. **Verification Certificate** — Branded printable proof-of-authenticity at `/certificate/{id}`.
7. **Trust Score System** — Each user gets a 0–100 credibility score based on uploads, verified docs, tamper history, and account age.
8. **Category Analytics** — Admin dashboard shows horizontal bar chart of documents by category.
9. **Activity Timeline** — Per-document event log: upload, verification, tamper attempt, expiry.
10. **Public Verification Portal** — Anyone can verify at `/verify` — upload file or paste hash, no login.

---

## 📁 Project Structure

```
kms/
├── backend/
│   └── src/main/java/com/kms/
│       ├── blockchain/          Block.java, Blockchain.java, BlockchainManager.java
│       ├── config/              SecurityConfig.java, SwaggerConfig.java
│       ├── controller/          Auth, Document, Verifier, Admin, QRCode, TrustScore, Public, UserProfile
│       ├── dto/                 ApiResponse, AuthDto, DocumentDto, UserDto
│       ├── exception/           GlobalExceptionHandler, BadRequest, NotFound
│       ├── model/               User, Document, VerificationLog, AuditLog
│       ├── repository/          4 Spring Data JPA repos
│       ├── security/            JwtUtil, JwtFilter, UserDetailsServiceImpl
│       └── service/             Auth, Document, Verification, User, Audit, TrustScore, Scheduled
│
├── frontend/src/
│   ├── api/                     axios.js (JWT interceptor), services.js (27 API functions)
│   ├── components/              Sidebar, StatusBadge, FileDropZone, ThemeToggle, Charts
│   ├── context/                 AuthContext, ThemeContext (light/dark)
│   └── pages/                   Landing, Login, AdminLogin, Register, UserDashboard,
│                                VerifierDashboard, AdminDashboard, Certificate,
│                                PublicVerify, ProfilePage, NotFound
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+ (Java 25 works — Lombok removed)
- Maven 3.8+
- MySQL 8 running on localhost:3306
- Node.js 16+ and npm

### 1. Start the Backend
```bash
cd kms/backend

# Edit application.properties — set your MySQL password:
# spring.datasource.password=yourpassword

mvn clean spring-boot:run
# → http://localhost:8080
# → http://localhost:8080/swagger-ui.html
```

### 2. Start the Frontend
```bash
cd kms/frontend
npm install
npm start
# → http://localhost:3000
```

### 3. Create the First Admin Account
Register normally, then run this SQL:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```
Or use Swagger UI: `POST /api/auth/register` with `"role": "ADMIN"`.

Then sign in at `http://localhost:3000/admin-login`.

---

## 🔐 Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (public) |
| `/login` | Standard login with inline errors |
| `/admin-login` | Dedicated admin portal |
| `/register` | User/Verifier registration |
| `/verify` | Public verification portal (no account needed) |
| `/dashboard` | User dashboard |
| `/verifier` | Verifier dashboard |
| `/admin` | Admin dashboard |
| `/certificate/:id` | Printable verification certificate |

---

## 🔗 API Endpoints (21 total)

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/documents/upload | USER+ |
| POST | /api/documents/batch | USER+ |
| POST | /api/documents/{id}/new-version | USER+ |
| GET | /api/documents/my | USER+ |
| GET | /api/documents/{id}/versions | USER+ |
| GET | /api/documents/{id}/certificate | USER+ |
| DELETE | /api/documents/{id} | USER+ |
| POST | /api/verifier/verify/{id} | VERIFIER+ |
| GET | /api/verifier/all-documents | VERIFIER+ |
| GET | /api/verifier/my-logs | VERIFIER+ |
| GET | /api/admin/stats | ADMIN |
| GET+PUT | /api/admin/users | ADMIN |
| GET | /api/admin/documents | ADMIN |
| GET | /api/admin/verification-logs | ADMIN |
| GET | /api/admin/audit-logs | ADMIN |
| GET | /api/admin/blockchain/status | ADMIN |
| GET | /api/qr/{id}/base64 | Public |
| GET | /api/trust/me | USER+ |
| GET | /api/trust/all | ADMIN |
| GET | /api/public/verify/hash | Public |
| POST | /api/public/verify/file | Public |

---

## 👥 Team

| Name | Role |
|------|------|
| **Azhar Khan** | Backend Developer & Team Lead |
| **Arpan Patel** | Database Design |
| **Aviraj Singh Tomar** | Frontend Developer |

---

*KMS Chain © 2025 — Built with Spring Boot, React, MySQL*
