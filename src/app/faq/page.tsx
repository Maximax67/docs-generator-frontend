'use client';

import { faq } from '@/app/faq/data';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Container,
} from '@mui/material';
import 'jsonjoy-builder/styles.css';
import { JSONSchema, SchemaVisualEditor } from 'jsonjoy-builder';
import { useState } from 'react';

const FrequentlyAskedQuestions = () => {
  const [schema, setSchema] = useState<JSONSchema>({
      type: 'object',
      properties: {},
      required: [],
    });
  
  return (
    <Container sx={{ py: 6, maxWidth: '1000px' }}>
      <SchemaVisualEditor schema={schema} readOnly={false} onChange={setSchema} />
      <Stack spacing={4}>
        <Typography variant="h4" fontWeight={600}>
          Питання та відповіді
        </Typography>

        <Stack spacing={2}>
          {faq.map((item, index) => (
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
};

export default FrequentlyAskedQuestions;
