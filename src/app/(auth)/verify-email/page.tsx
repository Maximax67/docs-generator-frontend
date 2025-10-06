'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
