import React from 'react';
import {
  Stack,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Key as KeyIcon,
  Logout as LogoutIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { User } from '@/types/user';
import { ProfileTab } from '@/types/profile';

type SidebarProps = {
  active: ProfileTab;
  onChange: (val: ProfileTab) => void;
  user: User;
  isOwnProfile: boolean;
};

export default function Sidebar({ active, onChange, user, isOwnProfile }: SidebarProps) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <PersonIcon />
        <Typography variant="h6">
          {user.first_name} {user.last_name || ''}
        </Typography>
      </Stack>

      <Divider />

      <List dense>
        <ListItemButton selected={active === 'info'} onClick={() => onChange('info')}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Інформація" />
        </ListItemButton>

        <ListItemButton selected={active === 'generations'} onClick={() => onChange('generations')}>
          <ListItemIcon>
            <PictureAsPdfIcon />
          </ListItemIcon>
          <ListItemText primary="Генерації" />
        </ListItemButton>

        <ListItemButton selected={active === 'vars'} onClick={() => onChange('vars')}>
          <ListItemIcon>
            <StorageIcon />
          </ListItemIcon>
          <ListItemText primary="Збережені дані" />
        </ListItemButton>

        {isOwnProfile && (
          <>
            <ListItemButton selected={active === 'sessions'} onClick={() => onChange('sessions')}>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary="Сесії" />
            </ListItemButton>

            <ListItemButton selected={active === 'logout'} onClick={() => onChange('logout')}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Вийти" />
            </ListItemButton>
          </>
        )}
      </List>
    </Stack>
  );
}
