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
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import StorageIcon from '@mui/icons-material/Storage';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';
import { User } from '@/types/user';

type SidebarProps = {
  active: 'info' | 'vars' | 'sessions' | 'logout';
  onChange: (val: 'info' | 'vars' | 'sessions' | 'logout') => void;
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
