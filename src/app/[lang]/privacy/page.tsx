'use client';

import { privacy, privacyUpdateDate } from '@/app/[lang]/privacy/data';
import { LegalInfo } from '@/components/LegalInfo';
import { Container } from '@mui/material';

export default function TOSPage() {
  return (
    <Container sx={{ py: 6, maxWidth: '1000px' }}>
      <LegalInfo title="Політика конфіденційності" data={privacy} updateDate={privacyUpdateDate} />
    </Container>
  );
}
