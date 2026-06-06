# VendorBridge Backend API

Production-ready Procurement & Vendor Management ERP backend built with Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**
   ```bash
   # Create database and tables
   npm run prisma:migrate

   # Generate Prisma client
   npm run prisma:generate

   # Seed initial data
   npm run prisma:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Express.js** | Web framework |
| **PostgreSQL** | Database |
| **Prisma** | ORM |
| **JWT** | Authentication |
| **Bcrypt** | Password hashing |
| **Nodemailer** | Email service |
| **Cloudinary** | Image storage |
| **Multer** | File uploads |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma configuration
│   │   ├── cloudinary.js     # Cloudinary setup
│   │   └── nodemailer.js     # Email setup
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT authentication
│   │   ├── roleMiddleware.js      # Role-based access control
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── corsMiddleware.js      # CORS configuration
│   │   └── loggerMiddleware.js    # Request logging
│   ├── modules/              # Business logic modules (add here)
│   ├── routes/
│   │   └── index.js          # API routes
│   ├── utils/
│   │   ├── jwt.js            # JWT utilities
│   │   ├── bcrypt.js         # Password utilities
│   │   ├── cloudinary.js     # Cloudinary utilities
│   │   ├── nodemailer.js     # Email utilities
│   │   ├── response.js       # Response formatting
│   │   ├── validators.js     # Input validation
│   │   └── asyncHandler.js   # Async error wrapper
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.js               # Database seeding
│   └── .env.example          # Prisma env example
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
└── README.md                 # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
SERVER_PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vendorbridge

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=noreply@vendorbridge.com
SMTP_FROM_NAME=VendorBridge

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb vendorbridge
   ```

2. **Run migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Seed initial data**
   ```bash
   npm run prisma:seed
   ```

4. **View database in Prisma Studio**
   ```bash
   npm run prisma:studio
   ```

## 🔐 Authentication

### JWT Token Flow

```
1. User logs in -> Get JWT token
2. Include token in Authorization header: Bearer <token>
3. Middleware verifies token and extracts user info
4. Route handler processes authenticated request
```

### Available Roles

- **ADMIN** - Full system access
- **VENDOR** - Vendor profile management
- **PROCUREMENT_OFFICER** - Purchase order management
- **FINANCE_MANAGER** - Payment and invoice management
- **VIEWER** - Read-only access

### Protected Routes

Use `authenticate` middleware:
```javascript
import { authenticate } from './middleware/authMiddleware.js';

router.get('/protected-endpoint', authenticate, (req, res) => {
  // req.user contains decoded JWT data
});
```

### Role-Based Access

```javascript
import { authenticate } from './middleware/authMiddleware.js';
import { authorize, isAdmin } from './middleware/roleMiddleware.js';

// Specific roles
router.post('/endpoint', authenticate, authorize('ADMIN', 'PROCUREMENT_OFFICER'), handler);

// Admin only
router.delete('/endpoint', authenticate, isAdmin, handler);

// Vendor only
router.get('/endpoint', authenticate, isVendor, handler);
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm start                # Start server

# Database
npm run prisma:migrate  # Run migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open Prisma Studio
npm run prisma:seed     # Seed database
```

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Health Checks

```
GET  /health            # Server health status
GET  /status            # API status
GET  /info              # API information
```

## ❌ Error Handling

All errors are handled globally and return standardized format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error code (development only)",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Codes

| Status | Message |
|--------|---------|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "details": { },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🗂️ Database Schema

### Core Models

- **User** - System users with roles
- **Vendor** - Vendor company profiles
- **Product** - Products offered by vendors
- **PurchaseOrder** - Procurement orders
- **OrderItem** - Items in purchase orders
- **Invoice** - Vendor invoices
- **Payment** - Payment records
- **VendorReview** - Vendor ratings and reviews
- **AuditLog** - System activity logs

## 🔄 Data Flow

```
User Login
    ↓
JWT Token Generated
    ↓
Include in Authorization Header
    ↓
Middleware Validates Token
    ↓
Route Handler Processes Request
    ↓
Response Sent
```

## 📦 Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vendorbridge.com | Admin@123456 |
| Procurement Officer | officer@vendorbridge.com | Officer@123456 |
| Finance Manager | finance@vendorbridge.com | Finance@123456 |
| Vendor | vendor@example.com | Vendor@123456 |

⚠️ **Change these credentials in production!**

## 🚀 Production Deployment

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<secure_random_string>
   DATABASE_URL=<production_database_url>
   ```

2. **Run migrations**
   ```bash
   npm run prisma:migrate -- --skip-generate
   ```

3. **Start server**
   ```bash
   npm start
   ```

4. **Setup reverse proxy** (Nginx/Apache)

5. **Enable SSL/TLS** (Let's Encrypt)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License - feel free to use this project

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for VendorBridge**
