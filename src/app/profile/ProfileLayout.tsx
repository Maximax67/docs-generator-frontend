import React from 'react';
import { Box } from '@mui/material';
import { ProfileTab } from '@/types/profile';

type ProfileLayoutProps = {
  active: string;
  onChangeActive: (value: ProfileTab) => void;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
};

export default function ProfileLayout({ sidebar, children }: ProfileLayoutProps) {
  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: { xs: 'block', md: 'flex' } }}>
        <Box
          sx={{
            width: { xs: '100%', md: 280 },
            borderRight: { md: 1 },
            borderColor: 'divider',
            p: 2,
          }}
        >
          {sidebar}
        </Box>

        <Box sx={{ flex: 1, p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
