'use client';

import { Container, Stack, Alert, Box } from '@mui/material';
import { useUserStore } from '@/store/user';
import { DocumentSelector } from '@/app/[lang]/documents/components/DocumentSelector';
import { useState } from 'react';
import { isAdminUser } from '@/utils/is-admin';
import { useDictionary } from '@/contexts/LangContext';

export default function DocumentsPage() {
  const { user } = useUserStore();
  const dict = useDictionary();
  const [showAlert, setShowAlert] = useState(true);
  const handleCloseAlert = () => setShowAlert(false);

  const isAdmin = isAdminUser(user);

  return (
    <Container
      maxWidth={false}
      sx={{ py: 3, height: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column' }}
    >
      <Stack spacing={2} sx={{ height: '100%' }}>
        {!user && showAlert && (
          <Alert severity="info" onClose={handleCloseAlert}>
            {dict.documents.signInToSave}
          </Alert>
        )}

        {user && !isAdmin && !user.email_verified && (
          <Alert severity="info" onClose={handleCloseAlert}>
            {dict.documents.verifyEmailToSave}
          </Alert>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DocumentSelector showWebLink={isAdmin} />
        </Box>
      </Stack>
    </Container>
  );
}
