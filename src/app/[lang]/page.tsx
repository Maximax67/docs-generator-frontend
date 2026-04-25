'use client';

import { Container, Stack, Typography, Button, Box, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import {
  Description as DescriptionIcon,
  HelpOutlined as HelpOutlinedIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { useDictionary, useLang } from '@/contexts/LangContext';
import StepsTimeline from '@/components/Timeline';
import Features from '@/components/Features';

export default function Home() {
  const dict = useDictionary();
  const lang = useLang();
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
        <Stack spacing={6} sx={{ alignItems: 'center' }}>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Image src="/logo.png" alt="Docs Generator" width={150} height={150} />
            <Typography
              variant="h2"
              component="h1"
              sx={{ fontSize: { xs: '2rem', sm: '3.75rem' }, fontWeight: 700 }}
            >
              Docs Generator
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, maxWidth: 600 }}
            >
              {dict.home.tagline}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: { sm: 1 } }}>
              <Button
                component={Link}
                href={`/${lang}/documents`}
                variant="contained"
                size="large"
                startIcon={<DescriptionIcon />}
              >
                {dict.home.goToDocuments}
              </Button>
              <Button
                component={Link}
                href={`/${lang}/faq`}
                variant="outlined"
                size="large"
                startIcon={<HelpOutlinedIcon />}
              >
                {dict.home.viewFaq}
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <ApiIcon
                color="primary"
                fontSize="large"
                sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {dict.home.api.title}
              </Typography>
            </Stack>

            <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 600 }}>
              {dict.home.api.description}
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
            <Link href={`/${lang}/tos`} target="_blank" rel="noopener noreferrer">
              {dict.home.tos}
            </Link>
            <Box component="span" sx={{ mx: { xs: 0.5, sm: 1.5 } }}>
              |
            </Box>
            <Link href={`/${lang}/privacy`} target="_blank" rel="noopener noreferrer">
              {dict.home.privacy}
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
