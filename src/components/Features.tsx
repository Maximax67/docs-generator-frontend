'use client';

import { Grid, Paper, Stack, Typography } from '@mui/material';
import {
  Description as DescriptionIcon,
  HelpOutline as HelpOutlineIcon,
  AutoAwesome as AutoAwesomeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useDictionary } from '@/contexts/LangContext';

const icons = [
  <DescriptionIcon key="desc" color="primary" sx={{ fontSize: 50, mb: 1 }} />,
  <AutoAwesomeIcon key="auto" color="primary" sx={{ fontSize: 50, mb: 1 }} />,
  <HelpOutlineIcon key="help" color="primary" sx={{ fontSize: 50, mb: 1 }} />,
  <SecurityIcon key="sec" color="primary" sx={{ fontSize: 50, mb: 1 }} />,
];

export default function Features() {
  const dict = useDictionary();

  return (
    <Grid container spacing={3}>
      {dict.features.map((card, index) => (
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
              {icons[index]}
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
