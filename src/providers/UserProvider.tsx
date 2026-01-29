'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/user';

import '@/lib/api/setup/request-interceptor';
import '@/lib/api/setup/response-interceptor';

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const { bootstrap } = useUserStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return children;
}
