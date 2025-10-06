import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { User } from '@/types/user';
import { api, toErrorMessage } from '@/lib/api';

export function useUserProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const currentUser = useUserStore((state) => state.user);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!currentUser) return;

    if (!userId || userId === currentUser._id) {
      setTargetUser(currentUser);
      return;
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'god') {
      router.replace('/profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/users/${userId}`);
      setTargetUser(response.data);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentUser, userId, router]);

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
