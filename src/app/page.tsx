'use client';

import { Container, Stack, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import {
  Description as DescriptionIcon,
  HelpOutline as HelpOutlineIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import StepsTimeline from '@/components/Timeline';
import Features from '@/components/Features';

export default function Home() {
  const swaggerUrl = process.env.NEXT_PUBLIC_SWAGGER_URL || 'https://example.com';
  const postmanUrl = process.env.NEXT_PUBLIC_POSTMAN_URL || 'https://example.com';

  return (
    <Box
      sx={{
        minHeight: 'calc(100dvh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container>
        <Stack spacing={6} alignItems="center">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Image src="/logo.png" alt="Docs Generator" width={150} height={150} />
            <Typography
              variant="h2"
              component="h1"
              fontWeight={700}
              sx={{ fontSize: { xs: '2rem', sm: '3.75rem' } }}
            >
              Docs Generator
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              maxWidth={600}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Генеруй документи швидко та зручно всього в кілька кліків
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={{ sm: 1 }}>
              <Button
                component={Link}
                href="/documents"
                variant="contained"
                size="large"
                startIcon={<DescriptionIcon />}
              >
                Перейти до документів
              </Button>
              <Button
                component={Link}
                href="/faq"
                variant="outlined"
                size="large"
                startIcon={<HelpOutlineIcon />}
              >
                Переглянути FAQ
              </Button>
            </Stack>
          </Stack>

          <Features />
          <StepsTimeline />

          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              maxWidth: 800,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ApiIcon
                color="primary"
                fontSize="large"
                sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
              />
              <Typography variant="h4" fontWeight={700}>
                Наше API
              </Typography>
            </Stack>

            <Typography variant="body1" textAlign="center" maxWidth={600}>
              Використовуй REST-API для автоматичної генерації PDF-документів у твоєму застосунку.
              Документація доступна за посиланнями нижче.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                component={Link}
                href={swaggerUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
              >
                Swagger
              </Button>

              <Button
                component={Link}
                href={postmanUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
              >
                Postman
              </Button>
            </Stack>
          </Paper>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            <Link href="/tos" target="_blank" rel="noopener noreferrer">
              Умови користування
            </Link>
            <Box component="span" sx={{ mx: { xs: 0.5, sm: 1.5 } }}>
              |
            </Box>
            <Link href="/privacy" target="_blank" rel="noopener noreferrer">
              Політика конфіденційності
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
