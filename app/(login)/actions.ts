'use server';

import { z } from 'zod';
import connectDB from '@/lib/db/mongodb';
import {
  User,
  ActivityLog,
  type IUser,
  type NewUser,
  type NewActivityLog,
  ActivityType,
} from '@/lib/db/models';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

async function logActivity(
  userId: string,
  type: ActivityType,
  ipAddress?: string,
  metadata?: string
) {
  await connectDB();
  
  const newActivity = new ActivityLog({
    userId,
    action: type,
    ipAddress: ipAddress || '',
    metadata: metadata || null
  });
  
  await newActivity.save();
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  await connectDB();

  try {
    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password
      };
    }

    const isPasswordValid = await comparePasswords(
      password,
      foundUser.passwordHash
    );

    if (!isPasswordValid) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password
      };
    }

    await Promise.all([
      setSession(foundUser),
      logActivity(foundUser._id.toString(), ActivityType.SIGN_IN)
    ]);

    redirect('/');
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      error: 'An error occurred during sign in. Please try again.',
      email,
      password
    };
  }
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;

  await connectDB();

  try {
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      return {
        error: 'Failed to create user. Please try again.',
        email,
        password
      };
    }

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      email,
      passwordHash,
      name: null
    });

    const createdUser = await newUser.save();

    if (!createdUser) {
      return {
        error: 'Failed to create user. Please try again.',
        email,
        password
      };
    }

    await Promise.all([
      logActivity(createdUser._id.toString(), ActivityType.SIGN_UP),
      setSession(createdUser)
    ]);

    redirect('/');
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }
});

export async function signOut() {
  const user = (await getUser()) as IUser;
  if (user) {
    await logActivity(user._id.toString(), ActivityType.SIGN_OUT);
  }
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      return {
        error: 'New passwords do not match.',
        currentPassword,
        newPassword,
        confirmPassword
      };
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        error: 'Current password is incorrect.',
        currentPassword,
        newPassword,
        confirmPassword
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await connectDB();

    try {
      await User.findByIdAndUpdate(user._id, {
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      });

      await logActivity(user._id.toString(), ActivityType.UPDATE_PASSWORD);

      return {
        success: 'Password updated successfully.',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        error: 'Failed to update password. Please try again.',
        currentPassword,
        newPassword,
        confirmPassword
      };
    }
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await connectDB();

    try {
      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: user._id } 
        }).exec();

        if (existingUser) {
          return {
            error: 'Email is already taken.',
            name,
            email
          };
        }
      }

      await User.findByIdAndUpdate(user._id, {
        name,
        email,
        updatedAt: new Date()
      });

      await logActivity(user._id.toString(), ActivityType.UPDATE_ACCOUNT);

      return {
        success: 'Account updated successfully.',
        name,
        email
      };
    } catch (error) {
      console.error('Update account error:', error);
      return {
        error: 'Failed to update account. Please try again.',
        name,
        email
      };
    }
  }
);

const deleteAccountSchema = z.object({
  confirmDelete: z.string()
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { confirmDelete } = data;

    if (confirmDelete !== 'DELETE') {
      return {
        error: 'Please type DELETE to confirm.',
        confirmDelete
      };
    }

    await connectDB();

    try {
      await User.findByIdAndUpdate(user._id, {
        deletedAt: new Date()
      });

      await logActivity(user._id.toString(), ActivityType.DELETE_ACCOUNT);

      (await cookies()).delete('session');
      redirect('/sign-in');
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        error: 'Failed to delete account. Please try again.',
        confirmDelete
      };
    }
  }
);