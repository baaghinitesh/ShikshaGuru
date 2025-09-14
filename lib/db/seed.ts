import connectDB from './mongodb';
import { User } from './models';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  await connectDB();

  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('Test user already exists, skipping creation.');
    return;
  }

  const user = new User({
    email: email,
    passwordHash: passwordHash,
    name: 'Test User',
  });

  await user.save();

  console.log('Initial user created.');
  console.log('Seed data created successfully.');
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });