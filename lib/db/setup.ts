import { promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import connectDB from './mongodb';

function generateAuthSecret(): string {
  console.log('Step 1: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 2: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.log('.env file created with the necessary variables.');
}

async function testDatabaseConnection() {
  console.log('Step 3: Testing MongoDB connection...');
  try {
    await connectDB();
    console.log('✅ MongoDB connection successful.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setting up ShikshaGuru Application Database...');
  
  const MONGO_URI = 'mongodb://admin:JtlsfYlv@127.0.0.1:27017/shikshaguru?authSource=admin';
  const BASE_URL = 'http://localhost:3000';
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    MONGO_URI,
    BASE_URL,
    AUTH_SECRET,
  });

  await testDatabaseConnection();

  console.log('🎉 ShikshaGuru Application setup completed successfully!');
  console.log('You can now run: npm run dev');
}

main().catch(console.error);