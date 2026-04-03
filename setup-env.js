const fs = require('fs');
const path = require('path');

// Environment configuration for NextAuth
const envConfig = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=invoice-master-secret-key-for-development-32-chars

# Application Configuration
NODE_ENV=development
PORT=3001

# Database Configuration (for production)
# DATABASE_URL=postgresql://username:password@localhost:5432/invoicedb

# Email Configuration (optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Security Configuration
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envConfig);
  console.log('✅ Environment file created successfully!');
  console.log('📁 File location:', envPath);
  console.log('🔄 Please restart your development server');
  console.log('');
  console.log('📋 Environment variables configured:');
  console.log('   - NEXTAUTH_URL: http://localhost:3001');
  console.log('   - NEXTAUTH_SECRET: ✅ Configured');
  console.log('   - NODE_ENV: development');
  console.log('');
  console.log('🚀 Run: npm run dev');
} catch (error) {
  console.error('❌ Error creating environment file:', error.message);
  process.exit(1);
}
