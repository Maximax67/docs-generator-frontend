'use client';

import { tos, tosUpdateDate } from '@/app/[lang]/tos/data';
import { LegalInfo } from '@/components/LegalInfo';
import { Container } from '@mui/material';

export default function TOSPage() {
  return (
    <Container sx={{ py: 6, maxWidth: '1000px' }}>
      <LegalInfo
        title="Умови користування (Terms of Service)"
        data={tos}
        updateDate={tosUpdateDate}
      />
    </Container>
  );
}
