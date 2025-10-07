'use client';

import { FC } from 'react';
import { Stack, Typography, Divider } from '@mui/material';
import { LegalInfoRecord } from '@/types/legal-info-record';

interface LegalInfoProps {
  title: string;
  data: LegalInfoRecord[];
  updateDate?: string;
}

export const LegalInfo: FC<LegalInfoProps> = ({ title, data, updateDate }) => {
  return (
    <>
      <Stack spacing={4}>
        <Typography variant="h4" fontWeight={600}>
          {title}
        </Typography>

        {data.map((section, idx) => (
          <Stack key={idx} spacing={2}>
            {section.t && (
              <Typography variant="h5" fontWeight={500}>
                {section.t}
              </Typography>
            )}
            {section.c.map((paragraph, pIdx) => (
              <Typography key={pIdx}>{paragraph}</Typography>
            ))}
            {idx < data.length - 1 && <Divider />}
          </Stack>
        ))}
      </Stack>
      {updateDate && (
        <Typography variant="h6" fontWeight={500} sx={{ mt: 4 }}>
          Останнє оновлення: {updateDate}
        </Typography>
      )}
    </>
  );
};
