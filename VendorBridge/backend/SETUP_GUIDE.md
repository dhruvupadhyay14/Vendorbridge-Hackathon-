# VendorBridge Backend - Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```
   SERVER_PORT=5000
   NODE_ENV=development
   
   # Set your database URL
   DATABASE_URL=postgresql://user:password@localhost:5432/vendorbridge
   
   # JWT Secret (change in production)
   JWT_SECRET=your_random_secret_key
   
   # Add Cloudinary credentials
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Add SMTP credentials for email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

### Step 3: Database Setup

1. **Create PostgreSQL database:**
   ```bash
   createdb vendorbridge
   ```

2. **Copy Prisma env file:**
   ```bash
   cp prisma/.env.example prisma/.env
   
   # Then edit prisma/.env with your database URL
   ```

3. **Run database migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Seed initial data (creates test users and data):**
   ```bash
   npm run prisma:seed
   ```

### Step 4: Start Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:5000`

### Step 5: Test API

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Get API Info:**
```bash
curl http://localhost:5000/api/info
```

## 📝 Default Test Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vendorbridge.com | Admin@123456 |
| Procurement Officer | officer@vendorbridge.com | Officer@123456 |
| Finance Manager | finance@vendorbridge.com | Finance@123456 |
| Vendor | vendor@example.com | Vendor@123456 |

## 🛠 Available Commands

```bash
npm run dev              # Start development server with hot reload
npm start                # Start production server
npm run prisma:migrate  # Run database migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open Prisma Studio (GUI)
npm run prisma:seed     # Seed database with test data
```

## 📁 Project Structure Overview

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── modules/          # Business logic (add here)
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── app.js            # Express setup
│   └── server.js         # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Database seeding
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .env.example          # Environment template
└── README.md             # Full documentation
```

## 🔐 3rd Party Services Setup

### Cloudinary (Image Storage)
1. Sign up at: https://cloudinary.com
2. Get credentials from dashboard
3. Add to `.env` file

### Nodemailer (Email)
1. For Gmail:
   - Enable 2FA
   - Create App Password: https://myaccount.google.com/apppasswords
   - Add credentials to `.env`

### JWT (Authentication)
- Secret is automatically generated in `.env`
- Keep it secure in production

## 🗂️ Database Models Included

- **User** - System users with roles
- **Vendor** - Vendor company profiles
- **Product** - Products offered by vendors
- **PurchaseOrder** - Procurement orders
- **OrderItem** - Order line items
- **Invoice** - Vendor invoices
- **Payment** - Payment records
- **VendorReview** - Vendor reviews and ratings
- **AuditLog** - System audit logs

## 🚨 Important Notes

### Development vs Production

**Development:**
- Hot reload enabled
- Verbose logging
- Development CORS settings

**Production:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Use production database
- Enable SSL/TLS

### Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Change default user passwords
- [ ] Setup proper database backups
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Setup rate limiting
- [ ] Enable request logging
- [ ] Regular security audits

## 🆘 Common Issues

### Port Already in Use
```bash
# Change PORT in .env or kill process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### Database Connection Failed
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check database exists: `psql -l`
- Verify credentials are correct

### Prisma Migration Errors
```bash
# Reset database (careful - deletes all data)
npx prisma migrate reset

# Or check migration status
npx prisma migrate status
```

### Email Not Sending
- Check SMTP credentials in .env
- Verify "Less secure app access" is enabled (Gmail)
- Check firewall/network restrictions
- Review application logs

## 📚 Next Steps

1. **Create Auth Module** - Handle login/registration
2. **Create Vendor Module** - Vendor management
3. **Create Order Module** - Purchase orders
4. **Create Payment Module** - Invoice & payment handling
5. **Add API Documentation** - Swagger/OpenAPI

## 🎯 Module Structure Template

```javascript
// modules/auth/controller.js
export const login = async (req, res, next) => {
  // Handle login
};

// modules/auth/service.js
export const findUserByEmail = async (email) => {
  // Database query
};

// modules/auth/validation.js
export const loginValidator = [
  // validation rules
];

// modules/auth/routes.js
import { login } from './controller.js';
router.post('/login', loginValidator, login);
```

## 📞 Support

- Check README.md for detailed documentation
- Review code comments in each file
- Check Prisma docs: https://www.prisma.io/docs/
- Check Express docs: https://expressjs.com/

---

🎉 **Backend is ready! Start building your modules in `src/modules/`**
