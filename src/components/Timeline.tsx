import { Stack, Typography, Paper } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

const steps = [
  {
    title: 'Обери документ',
    description: 'Обери потрібний шаблон з доступних',
    icon: <DescriptionIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
  },
  {
    title: 'Проглянь превью',
    description: 'Переглянь превью вже заповненого документа',
    icon: <VisibilityIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
  },
  {
    title: 'Заповни дані',
    description: 'Уважно заповни всі поля в документі',
    icon: <EditIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
  },
  {
    title: 'Результат',
    description: 'Перевір згенерований документ на можливі помилки',
    icon: <CheckCircleIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
  },
  {
    title: 'Скачай PDF',
    description: 'Завантаж або роздрукуй документ',
    icon: <SaveAltIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
  },
];

export default function StepsTimeline() {
  return (
    <Stack spacing={6} alignItems="center" sx={{ width: '100%', mt: 6 }}>
      <Typography variant="h4" fontWeight={700}>
        Як створити документ
      </Typography>

      <Timeline position="alternate" sx={{ width: '100%' }}>
        {steps.map((step, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot
                sx={(theme) => ({
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[100],
                  color: theme.palette.getContrastText(
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[800]
                      : theme.palette.grey[100],
                  ),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                {index + 1}
              </TimelineDot>
              {index < steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {step.icon}
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Stack>
  );
}
