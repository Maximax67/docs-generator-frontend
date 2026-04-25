import { Stack, Typography, Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useDictionary } from '@/contexts/LangContext';

type LogoutSectionProps = {
  onLogout: () => void;
  onLogoutEverywhere: () => void;
  onDeleteAccount: () => void;
};

export default function LogoutSection({
  onLogout,
  onLogoutEverywhere,
  onDeleteAccount,
}: LogoutSectionProps) {
  const dict = useDictionary();

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{dict.profile.logout.title}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button startIcon={<LogoutIcon />} color="warning" variant="outlined" onClick={onLogout}>
          {dict.profile.logout.signOut}
        </Button>

        <Button
          startIcon={<LogoutIcon />}
          color="error"
          variant="outlined"
          onClick={onLogoutEverywhere}
        >
          {dict.profile.logout.signOutAll}
        </Button>

        <Button color="error" variant="contained" onClick={onDeleteAccount}>
          {dict.profile.logout.deleteAccount}
        </Button>
      </Stack>
    </Stack>
  );
}
