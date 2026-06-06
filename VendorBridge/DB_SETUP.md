# VendorBridge Database Setup Guide

Follow these steps to initialize the PostgreSQL database for the VendorBridge ERP system.

## 1. Prerequisites
- PostgreSQL 14+ installed and running.
- A database user with permissions to create databases.

## 2. Create the Database
Run the following SQL command in your PostgreSQL terminal (psql) or GUI (pgAdmin):

```sql
CREATE DATABASE vendorbridge;
```

## 3. Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/vendorbridge
```

## 4. Run Migrations & Generate Client
Navigate to the `backend` directory and execute:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

## 5. Seed Initial Data
To populate the database with default users (Admin, Officer, Manager, Vendor) and sample records:

```bash
npm run prisma:seed
```

## 6. Verify Connection
Start the backend server:
```bash
npm run dev
```
If successful, you will see `✓ Database connected successfully` in the console.
