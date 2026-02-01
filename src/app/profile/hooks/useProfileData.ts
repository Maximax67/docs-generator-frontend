import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { adminApi } from '@/lib/api';
import { User } from '@/types/user';
import { toErrorMessage } from '@/utils/errors-messages';
import { isAdminUser } from '@/utils/is-admin';

export function useProfileData() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const { user: currentUser } = useUserStore();
  const isAdmin = isAdminUser(currentUser);

  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // If no userId or it's the current user's ID, use current user
    if (!userId || userId === currentUser._id) {
      setTargetUser(currentUser);
      setLoading(false);
      return;
    }

    // Only admins can view other profiles
    if (!isAdmin) {
      router.replace('/profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await adminApi.getUserById(userId);
      setTargetUser(user);
    } catch (err) {
      setError(toErrorMessage(err, 'Не вдалось завантажити профіль'));
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin, userId, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const isOwnProfile = !userId || userId === currentUser?._id;

  return {
    targetUser,
    currentUser,
    loading,
    error,
    isOwnProfile,
    refetch: fetchUser,
  };
}
