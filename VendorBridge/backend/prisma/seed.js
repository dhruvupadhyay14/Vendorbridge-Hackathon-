import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MongoDB database seed...');

  try {
    // Clear existing data (in order of dependency)
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.invoiceItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.quotationItem.deleteMany();
    await prisma.quotation.deleteMany();
    await prisma.rFQVendor.deleteMany();
    await prisma.rFQItem.deleteMany();
    await prisma.rFQ.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();

    console.log('✓ Existing data cleared');

    const commonPassword = await hashPassword('Password@123');

    // 1. Create Admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@vendorbridge.com',
        password: commonPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });
    console.log('✓ Admin user created');

    // 2. Create Procurement Officer
    const officer = await prisma.user.create({
      data: {
        email: 'officer@vendorbridge.com',
        password: commonPassword,
        firstName: 'Alice',
        lastName: 'Procurement',
        role: 'PROCUREMENT_OFFICER',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });
    console.log('✓ Procurement Officer created');

    // 3. Create Manager
    const manager = await prisma.user.create({
      data: {
        email: 'manager@vendorbridge.com',
        password: commonPassword,
        firstName: 'Bob',
        lastName: 'Manager',
        role: 'MANAGER',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });
    console.log('✓ Manager created');

    // 4. Create Vendor User & Profile
    const vendorUser = await prisma.user.create({
      data: {
        email: 'vendor@example.com',
        password: commonPassword,
        firstName: 'John',
        lastName: 'Supplier',
        role: 'VENDOR',
        status: 'ACTIVE',
        isEmailVerified: true,
      },
    });

    const vendor = await prisma.vendor.create({
      data: {
        companyName: 'Global Tech Solutions',
        registrationNumber: 'VEND-001',
        email: 'sales@globaltech.com',
        phone: '+1234567890',
        street: '123 Innovation Way',
        city: 'Tech City',
        state: 'CA',
        country: 'USA',
        postalCode: '90210',
        contactPersonName: 'John Supplier',
        contactPersonEmail: 'john@globaltech.com',
        contactPersonPhone: '+1234567891',
        status: 'ACTIVE',
        userId: vendorUser.id,
      },
    });
    console.log('✓ Vendor created');

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           ✓ MongoDB Seeded Successfully!                  ║
║                                                            ║
║  Common Password: Password@123                             ║
║                                                            ║
║  Admin: admin@vendorbridge.com                             ║
║  Officer: officer@vendorbridge.com                         ║
║  Manager: manager@vendorbridge.com                         ║
║  Vendor: vendor@example.com                                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
