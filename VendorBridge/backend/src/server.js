import 'dotenv/config';
import app from './app.js';
import prisma from './config/database.js';

const PORT = process.env.SERVER_PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$runCommandRaw({ ping: 1 });
    console.log('✓ Database connected successfully (MongoDB)');

    // Start listening
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                   🚀 VendorBridge API                      ║
║                                                            ║
║          Server running on port ${PORT}                    ║
║          Environment: ${NODE_ENV}                           ║
║          URL: http://localhost:${PORT}/api                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n📌 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('✓ Server closed');
      try {
        await prisma.$disconnect();
        console.log('✓ Database disconnected');
      } catch (error) {
        console.error('Error disconnecting database:', error);
      }
      process.exit(0);
    });

    // Force shutdown after 30s
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcing shutdown');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
