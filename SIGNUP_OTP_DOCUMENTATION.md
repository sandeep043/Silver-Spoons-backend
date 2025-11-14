# Signup with OTP Verification - API Documentation

## Overview
This signup flow uses Redis for temporary storage and MongoDB for permanent user storage, with email OTP verification using Nodemailer.

## API Endpoints

### 1. **Signup (Request OTP)**
- **Route**: `POST /api/users/signup`
- **Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securePassword123",
  "phone": "9876543210"
}
```
- **Response** (Success - 200):
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify within 20 minutes.",
  "email": "user@example.com"
}
```
- **Response** (Error - 400):
```json
{
  "success": false,
  "message": "Error message"
}
```

**What happens**:
1. Validates all fields (name, email, password, phone)
2. Checks if user already exists in MongoDB
3. Checks if signup is already pending in Redis
4. Hashes the password using bcryptjs
5. Generates a 6-digit OTP
6. Stores user data (name, email, hashed password, phone, OTP) in Redis with 20-minute expiry
7. Sends OTP email using Nodemailer
8. Returns success message with email

---

### 2. **Verify OTP**
- **Route**: `POST /api/users/verify-otp`
- **Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- **Response** (Success - 201):
```json
{
  "success": true,
  "message": "Email verified successfully. User created.",
  "user": {
    "id": "mongodb_user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210"
  }
}
```
- **Response** (Error - 400):
```json
{
  "success": false,
  "message": "Error message"
}
```

**What happens**:
1. Validates email and OTP
2. Retrieves user data from Redis using email as key
3. Verifies if OTP matches the stored OTP
4. Creates new user in MongoDB with `isVerified: true`
5. Deletes temporary data from Redis
6. Returns user details

---

### 3. **Resend OTP**
- **Route**: `POST /api/users/resend-otp`
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response** (Success - 200):
```json
{
  "success": true,
  "message": "New OTP sent to your email"
}
```

**What happens**:
1. Validates email
2. Retrieves pending signup data from Redis
3. Generates new OTP (old OTP is cleared)
4. Updates Redis with new OTP and fresh 20-minute expiry
5. Sends new OTP email
6. Returns success message

---

## Data Flow

### Signup Flow:
```
User Request (name, email, password, phone)
    ↓
Validate Input
    ↓
Check MongoDB (user exists?)
    ↓
Check Redis (signup in progress?)
    ↓
Hash Password (bcryptjs)
    ↓
Generate OTP (6 digits)
    ↓
Store in Redis (20 min expiry)
    ↓
Send Email with OTP
    ↓
Response: OTP sent successfully
```

### Verification Flow:
```
User Request (email, OTP)
    ↓
Retrieve from Redis
    ↓
Verify OTP Match
    ↓
Create User in MongoDB (isVerified: true)
    ↓
Delete from Redis
    ↓
Response: User created successfully
```

### Resend OTP Flow:
```
User Request (email)
    ↓
Check Redis for pending signup
    ↓
Generate New OTP (clears old one)
    ↓
Update Redis (fresh 20 min expiry)
    ↓
Send Email with New OTP
    ↓
Response: New OTP sent
```

---

## Key Features

✅ **OTP Expiry**: 20 minutes (1200 seconds)
✅ **OTP Format**: 6-digit number
✅ **Password Security**: bcryptjs hashing (10 rounds)
✅ **Email Service**: Nodemailer with Gmail
✅ **Temporary Storage**: Redis for unverified signups
✅ **Permanent Storage**: MongoDB for verified users
✅ **Validation**: All fields required for signup
✅ **Duplicate Prevention**: Checks both MongoDB and Redis
✅ **Email Verification**: Beautiful HTML formatted OTP email

---

## Environment Variables Required

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
REDIS_HOST=your-redis-host
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
```

---

## User Schema (MongoDB)

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phoneNumber: Number (required),
  isVerified: Boolean (default: false),
  loyaltyPoints: Number (default: 0)
}
```

---

## Error Handling

| Error | HTTP Status | Message |
|-------|------------|---------|
| Missing fields | 400 | All fields required |
| User already exists | 400 | User already exists with this email |
| Signup in progress | 400 | Signup already in progress |
| OTP expired | 400 | OTP expired or invalid email |
| Invalid OTP | 400 | Invalid OTP |
| No pending signup | 400 | No pending signup found |
| Server error | 500 | Error message |

---

## Testing with cURL

### Signup:
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "pass123",
    "phone": "9876543210"
  }'
```

### Verify OTP:
```bash
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

### Resend OTP:
```bash
curl -X POST http://localhost:5000/api/users/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```
