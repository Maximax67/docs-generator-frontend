'use client';

import { Container, Stack, Alert, Box } from '@mui/material';
import { useUserStore } from '@/store/user';
import { DocumentSelector } from '@/components/DocumentSelector';
import { useState } from 'react';

export default function DocumentsPage() {
  const { user } = useUserStore();
  const [showAlert, setShowAlert] = useState(true);

  const handleCloseAlert = () => setShowAlert(false);

  return (
    <Container
      maxWidth={false}
      sx={{ py: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}
    >
      <Stack spacing={2} sx={{ height: '100%' }}>
        {!user && showAlert && (
          <Alert severity="info" onClose={handleCloseAlert}>
            Увійдіть, щоб зберігати введені значення
          </Alert>
        )}

        {user && user.role !== 'admin' && user.role !== 'god' && !user.email_verified && (
          <Alert severity="info" onClose={handleCloseAlert}>
            Підтвердіть пошту, щоб зберігати введені значення
          </Alert>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DocumentSelector showWebLink={user?.role === 'admin' || user?.role === 'god'} />
        </Box>
      </Stack>
    </Container>
  );
}
