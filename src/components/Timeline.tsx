import { Stack, Typography, Paper } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material';
import { useDictionary } from '@/contexts/LangContext';

const stepIcons = [
  <DescriptionIcon key="d" sx={{ fontSize: 30, color: 'primary.main' }} />,
  <VisibilityIcon key="v" sx={{ fontSize: 30, color: 'primary.main' }} />,
  <EditIcon key="e" sx={{ fontSize: 30, color: 'primary.main' }} />,
  <CheckCircleIcon key="c" sx={{ fontSize: 30, color: 'primary.main' }} />,
  <SaveAltIcon key="s" sx={{ fontSize: 30, color: 'primary.main' }} />,
];

export default function StepsTimeline() {
  const dict = useDictionary();

  return (
    <Stack spacing={6} sx={{ width: '100%', mt: 6, alignItems: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {dict.timeline.title}
      </Typography>

      <Timeline position="alternate" sx={{ width: '100%' }}>
        {dict.timeline.steps.map((step, index) => (
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
              {index < dict.timeline.steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                >
                  {stepIcons[index]}
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
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
