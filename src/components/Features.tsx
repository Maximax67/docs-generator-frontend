'use client';

import { Grid, Paper, Stack, Typography } from '@mui/material';
import {
  Description as DescriptionIcon,
  HelpOutline as HelpOutlineIcon,
  AutoAwesome as AutoAwesomeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import React from 'react';

const keyFeatures = [
  {
    icon: <DescriptionIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Створення документів',
    desc: 'Обирай шаблон та отримуйте готовий PDF за лічені хвилини',
  },
  {
    icon: <AutoAwesomeIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Персоналізація',
    desc: 'Зберігайте налаштування полів та керуйте своїми даними',
  },
  {
    icon: <HelpOutlineIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Допомога та FAQ',
    desc: 'Всі відповіді на питання зібрані в одному місці',
  },
  {
    icon: <SecurityIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />,
    title: 'Безпека даних',
    desc: 'Згенеровані документи не зберігаються на наших серверах',
  },
];

export default function Features() {
  return (
    <Grid container spacing={3}>
      {keyFeatures.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6 }} key={index}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              gap: 1,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{ mb: 1 }}
            >
              {card.icon}
              <Typography variant="h6" fontWeight={600}>
                {card.title}
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
              {card.desc}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
