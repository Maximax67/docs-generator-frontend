'use client';

import { Container, Stack, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import {
  Description as DescriptionIcon,
  HelpOutline as HelpOutlineIcon,
  Api as ApiIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';
import StepsTimeline from '@/components/Timeline';
import Features from '@/components/Features';

export default function Home() {
  const apiDocsUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/docs`
    : 'https://example.com';
  const postmanUrl = process.env.NEXT_PUBLIC_POSTMAN_URL || 'https://example.com';

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container>
        <Stack spacing={6} alignItems="center">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box sx={{ mb: 2 }}>
              <Image src="/logo.png" alt="Docs Generator" width={150} height={150} />
            </Box>
            <Typography variant="h2" component="h1" fontWeight={700}>
              Docs Generator
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600}>
              Генеруй документи швидко та зручно всього в кілька кліків.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              <ApiIcon color="primary" fontSize="large" />
              <Typography variant="h4" fontWeight={700}>
                Інтеграція через API
              </Typography>
            </Stack>

            <Typography variant="body1" textAlign="center" maxWidth={600}>
              Використовуйте наш REST-API для автоматичної генерації PDF-документів у вашому
              застосунку. Документація доступна за посиланнями нижче.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                href={apiDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="large"
              >
                Відкрити Swagger UI
              </Button>

              <Button
                component={Link}
                href={postmanUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
              >
                Відкрити в Postman
              </Button>
            </Stack>
          </Paper>

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
              <TelegramIcon color="primary" fontSize="large" />
              <Typography variant="h4" fontWeight={700}>
                Наш Telegram‑бот
              </Typography>
            </Stack>
            <Typography variant="body1" textAlign="center" maxWidth={600}>
              Швидко створюйте PDF‑документи безпосередньо в Telegram. Бот підтримує персоналізовані
              шаблони та зберігає ваші налаштування локально.
            </Typography>
            <Button
              component={Link}
              href="https://t.me/kpi_docs_bot"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
            >
              Відкрити @kpi_docs_bot
            </Button>
            <Typography color="text.secondary" maxWidth={600} textAlign="center">
              Зауважте, що історія та збережені дані веб‑сервісу не синхронізуються з ботом.
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
