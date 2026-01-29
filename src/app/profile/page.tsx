'use client';

import { Suspense } from 'react';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import { useUserStore } from '@/store/user';
import { useProfileData } from './hooks/useProfileData';
import { useProfileHandlers } from './hooks/useProfileHandlers';
import { ProfileContent } from './components/ProfileContent';
import { ProfileDialogs } from './components/ProfileDialogs';

function ProfilePageContent() {
  const { user: currentUser } = useUserStore();
  const { targetUser, isOwnProfile, loading, error } = useProfileData();
  const handlers = useProfileHandlers(targetUser, isOwnProfile);

  if (!currentUser) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Ви не авторизовані</Alert>
      </Container>
    );
  }

  if (!isOwnProfile && currentUser.role !== 'admin' && currentUser.role !== 'god') {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">Лише модератор може переглядати профіль інших</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !targetUser) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{error || 'Користувач не знайдений'}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 2, md: 6 } }}>
      <ProfileContent
        currentUser={currentUser}
        targetUser={targetUser}
        isOwnProfile={isOwnProfile}
        handlers={handlers}
      />
      <ProfileDialogs targetUser={targetUser} handlers={handlers} />
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ProfilePageContent />
    </Suspense>
  );
}
