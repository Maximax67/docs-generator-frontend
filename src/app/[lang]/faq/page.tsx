'use client';

import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Container,
} from '@mui/material';
import { useDictionary } from '@/contexts/LangContext';

export default function FrequentlyAskedQuestions() {
  const dict = useDictionary();

  return (
    <Container sx={{ py: 6, maxWidth: '1000px' }}>
      <Stack spacing={4}>
        <Typography variant="h4" fontWeight={600}>
          {dict.faq.title}
        </Typography>

        <Stack spacing={2}>
          {dict.faq.items.map((item, index) => (
            <Stack key={index}>
              <Accordion>
                <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                  <Typography fontWeight={600}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
