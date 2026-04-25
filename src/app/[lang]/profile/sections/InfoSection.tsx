import { Stack, Typography, Chip, Box, Button } from '@mui/material';
import {
  Verified as VerifiedIcon,
  ErrorOutline as ErrorOutlineIcon,
  Email as EmailIcon,
  LockReset as LockResetIcon,
  Edit as EditIcon,
  GppGood as GppGoodIcon,
  GppBad as GppBadIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { User } from '@/types/user';
import RoleChip from '@/components/RoleChip';
import { useDictionary } from '@/contexts/LangContext';

type InfoSectionProps = {
  user: User;
  loading: boolean;
  isOwnProfile: boolean;
  isGod: boolean;
  onSendEmailConfirm: () => void;
  onOpenChangeEmail: () => void;
  onOpenChangePassword: () => void;
  onOpenEditNames: () => void;
  onConfirmEmail: () => void;
  onRevokeConfirmEmail: () => void;
  onBan: () => void;
  onUnban: () => void;
  onPromote: () => void;
  onDemote: () => void;
  onDelete: () => void;
};

export default function InfoSection({
  user,
  loading,
  isOwnProfile,
  isGod,
  onSendEmailConfirm,
  onOpenChangeEmail,
  onOpenChangePassword,
  onOpenEditNames,
  onConfirmEmail,
  onRevokeConfirmEmail,
  onBan,
  onUnban,
  onPromote,
  onDemote,
  onDelete,
}: InfoSectionProps) {
  const dict = useDictionary();

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{dict.profile.info.title}</Typography>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <RoleChip role={user.role} />
        <Chip
          label={user.is_banned ? dict.profile.info.banned : dict.profile.info.active}
          color={user.is_banned ? 'error' : 'success'}
          icon={user.is_banned ? <BlockIcon /> : <VerifiedIcon />}
        />
        <Chip
          label={user.email_verified ? dict.profile.info.emailVerified : dict.profile.info.emailNotVerified}
          color={user.email_verified ? 'success' : 'warning'}
          icon={user.email_verified ? <VerifiedIcon /> : <ErrorOutlineIcon />}
        />
      </Stack>

      <Box
        sx={{
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {dict.profile.info.emailLabel}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="h6">{user.email}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {!user.email_verified && (isOwnProfile || isGod || user.role == 'user') && (
              <Button
                size="small"
                onClick={isOwnProfile ? onSendEmailConfirm : onConfirmEmail}
                disabled={loading}
              >
                {isOwnProfile ? dict.profile.info.sendConfirmation : dict.profile.info.confirmEmail}
              </Button>
            )}
            {user.email_verified && !isOwnProfile && (isGod || user.role == 'user') && (
              <Button size="small" onClick={onRevokeConfirmEmail} disabled={loading}>
                {dict.profile.info.revokeConfirmation}
              </Button>
            )}
            {(isOwnProfile || isGod) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={onOpenChangeEmail}
                disabled={loading}
              >
                {dict.profile.info.changeEmail}
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.default',
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {dict.profile.info.nameLabel}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="h6">
            {user.first_name} {user.last_name || ''}
          </Typography>
          {(isOwnProfile || isGod) && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onOpenEditNames}
              disabled={loading}
            >
              {dict.profile.info.editName}
            </Button>
          )}
        </Stack>
      </Box>

      {(isOwnProfile || user.role === 'user' || isGod) && (
        <Box
          sx={{
            bgcolor: 'background.default',
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {dict.profile.info.securityLabel}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              '& > *': {
                width: { xs: '100%', sm: 'auto' },
              },
            }}
          >
            {isOwnProfile && (
              <Button
                variant="outlined"
                startIcon={<LockResetIcon />}
                onClick={onOpenChangePassword}
                disabled={loading}
              >
                {dict.profile.info.changePassword}
              </Button>
            )}

            {!isOwnProfile && (
              <>
                {user.is_banned ? (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<VerifiedIcon />}
                    onClick={onUnban}
                    disabled={loading}
                  >
                    {dict.profile.info.unblock}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={onBan}
                    disabled={loading}
                  >
                    {dict.profile.info.block}
                  </Button>
                )}

                {isGod && (
                  <>
                    {user.role === 'admin' ? (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<GppBadIcon />}
                        onClick={onDemote}
                        disabled={loading}
                      >
                        {dict.profile.info.makeUser}
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<GppGoodIcon />}
                        onClick={onPromote}
                        disabled={loading}
                      >
                        {dict.profile.info.makeAdmin}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={onDelete}
                      disabled={loading}
                    >
                      {dict.profile.info.deleteUser}
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
