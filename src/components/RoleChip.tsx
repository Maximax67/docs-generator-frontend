import { FC } from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Person as PersonIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { UserRole } from '@/types/user';

type RoleChipInputProps = {
  role: UserRole;
};

export const RoleChip: FC<RoleChipInputProps> = ({ role }) => {
  let chipProps: ChipProps = {
    label: 'Користувач',
    color: 'default',
    icon: <PersonIcon />,
    variant: 'outlined',
  };

  switch (role) {
    case 'admin':
      chipProps = {
        label: 'Адмін',
        color: 'secondary',
        icon: <AdminPanelSettingsIcon />,
        variant: 'outlined',
      };
      break;

    case 'god':
      chipProps = {
        label: 'Бог',
        color: 'warning',
        icon: <BoltIcon />,
        sx: {
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #ffb300, #ff9100)',
          color: 'white',
          '& .MuiChip-icon': { color: 'white' },
          boxShadow: '0 0 10px rgba(255, 152, 0, 0.6)',
        },
      };
      break;

    default:
      break;
  }

  return <Chip {...chipProps} />;
};

export default RoleChip;
