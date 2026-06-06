# Authentication Module Documentation

Complete authentication module for VendorBridge ERP with JWT, password management, and email verification.

## File Structure

```
modules/auth/
├── auth.controller.js      # Request handlers
├── auth.service.js         # Business logic & database queries
├── auth.routes.js          # Route definitions
├── auth.validation.js      # Input validation rules
└── README.md              # This file
```

## Features Implemented

✅ **User Registration** - Create new user accounts with validation  
✅ **User Login** - Authenticate users with JWT tokens  
✅ **Forgot Password** - Send password reset email  
✅ **Reset Password** - Reset password with secure token  
✅ **Email Verification** - Verify user email addresses  
✅ **Get Profile** - Retrieve current user profile  
✅ **Update Profile** - Update user information  
✅ **Change Password** - Change password (requires authentication)  
✅ **Refresh Token** - Get new access token  
✅ **Activity Logging** - Track all user actions  

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0100",
  "role": "VENDOR"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify.",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "VENDOR"
  }
}
```

**Validation Rules:**
- ✓ Email: Valid email format, must be unique
- ✓ Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- ✓ FirstName: 2-100 chars, letters only
- ✓ LastName: 2-100 chars, letters only
- ✓ Phone: Valid format (optional)
- ✓ Role: VENDOR, PROCUREMENT_OFFICER, MANAGER (optional, defaults to VENDOR)

---

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "VENDOR",
      "profileImage": null
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If email exists, password reset link will be sent",
  "data": {
    "email": "user@example.com"
  }
}
```

Note: Response is the same whether email exists or not (security measure)

---

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewP@ss123",
  "confirmPassword": "NewP@ss123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password"
}
```

**Validation Rules:**
- ✓ Token: Must be valid and not expired (1 hour expiry)
- ✓ NewPassword: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- ✓ Passwords must match

---

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_from_login"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### Protected Endpoints (Requires Authentication)

Add to all requests:
```http
Authorization: Bearer <accessToken>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-0100",
      "department": "Procurement",
      "role": "VENDOR",
      "profileImage": null,
      "bio": null,
      "isEmailVerified": true,
      "status": "ACTIVE",
      "lastLogin": "2026-06-06T12:00:00Z",
      "createdAt": "2026-06-06T10:00:00Z"
    },
    "vendor": {
      "id": "vendor_uuid",
      "companyName": "ABC Supplies",
      "companyLogo": null,
      "ratingScore": 4.5
    }
  }
}
```

---

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0101",
  "department": "Procurement",
  "bio": "Senior Procurement Manager",
  "profileImage": "https://example.com/image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0101",
    "department": "Procurement",
    "profileImage": "https://example.com/image.jpg",
    "bio": "Senior Procurement Manager"
  }
}
```

**Validation Rules:**
- ✓ FirstName: 2-100 chars (optional)
- ✓ LastName: 2-100 chars (optional)
- ✓ Phone: Valid format (optional)
- ✓ Department: Max 100 chars (optional)
- ✓ Bio: Max 500 chars (optional)
- ✓ ProfileImage: Valid URL (optional)

---

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "currentPassword": "SecureP@ss123",
  "newPassword": "NewP@ss123",
  "confirmPassword": "NewP@ss123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Validation Rules:**
- ✓ CurrentPassword: Must match existing password
- ✓ NewPassword: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- ✓ NewPassword: Must be different from current password
- ✓ Passwords must match

---

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Password Requirements

Passwords must meet these criteria:
- ✓ Minimum 8 characters
- ✓ At least 1 uppercase letter
- ✓ At least 1 lowercase letter
- ✓ At least 1 number

**Examples:**
- ✓ Valid: `SecureP@ss123`, `MyPass1Word`, `Test1234`
- ✗ Invalid: `password123`, `PASSWORD123`, `123456789`, `Pass`

---

## Token Expiry

- **Access Token**: 7 days
- **Refresh Token**: 30 days
- **Password Reset Token**: 1 hour
- **Email Verification Token**: 24 hours

---

## Database Models Used

### User Model
- id (UUID)
- email
- password (hashed)
- firstName
- lastName
- phone
- department
- role
- status
- profileImage
- bio
- isEmailVerified
- emailVerificationToken
- emailVerificationExpiresAt
- passwordResetToken
- passwordResetExpiresAt
- lastLogin
- createdAt
- updatedAt
- deletedAt (soft delete)

---

## Security Measures

✅ **Password Hashing**: Bcrypt with 10 salt rounds  
✅ **JWT Tokens**: Secure token-based authentication  
✅ **Email Verification**: Token-based email verification  
✅ **Password Reset**: Secure token with expiry  
✅ **Activity Logging**: Track all user actions  
✅ **Input Validation**: Express-validator with custom rules  
✅ **Error Messages**: Don't reveal sensitive information  
✅ **Last Login**: Track user login history  

---

## Usage Example

### JavaScript/Fetch
```javascript
// Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecureP@ss123',
    firstName: 'John',
    lastName: 'Doe',
  }),
});

// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecureP@ss123',
  }),
});

const { data } = await loginResponse.json();
const { accessToken } = data.tokens;

// Get Profile with token
const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` },
});
```

### cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ss123"
  }'

# Get Profile
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:5000/api/auth/profile
```

---

## Testing

### Test Users Created on Database Seed

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vendorbridge.com | Admin@123456 |
| Officer | officer@vendorbridge.com | Officer@123456 |
| Finance Manager | finance@vendorbridge.com | Finance@123456 |
| Vendor | vendor@example.com | Vendor@123456 |

---

## Integration with App

The auth module is already integrated in `src/routes/index.js`:

```javascript
import authRoutes from '../modules/auth/auth.routes.js';
router.use('/auth', authRoutes);
```

All routes are automatically available under `/api/auth/`

---

## Architecture

### Service Layer Pattern
- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic
- **Routes**: Defines endpoints
- **Validation**: Input validation rules

### Database Interactions
- Uses Prisma ORM
- Async/await pattern
- Transaction support
- Soft delete support

### Error Handling
- Global error handler middleware
- Validation error messages
- Try-catch blocks
- Proper HTTP status codes

---

## Future Enhancements

- [ ] Token blacklist/logout feature
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Biometric authentication
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] SMS-based verification
- [ ] OAuth2 support
- [ ] SAML support

---

**Created**: June 6, 2026  
**Module**: Authentication  
**Version**: 1.0.0
