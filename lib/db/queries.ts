import connectDB from './mongodb';
import { User, ActivityLog, type IUser, type IActivityLog } from './models';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser(): Promise<IUser | null> {
  await connectDB();
  
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'string'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  try {
    const user = await User.findOne({
      _id: sessionData.user.id,
      deletedAt: null
    }).exec();

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getActivityLogs() {
  await connectDB();
  
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const logs = await ActivityLog.find({ userId: user._id })
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    return logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      metadata: log.metadata,
      userName: (log.userId as any)?.name || null
    }));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
}