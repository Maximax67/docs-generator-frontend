import { FC } from 'react';
import { Alert } from '@mui/material';
import { User } from '@/types/user';
import { ProfileTab } from '@/types/profile';
import ProfileLayout from '../ProfileLayout';
import Sidebar from '../Sidebar';
import InfoSection from '../sections/InfoSection';
import GenerationSection from '../sections/GenerationSection';
import VariablesSection from '../sections/VariablesSection';
import SessionsSection from '../sections/SessionsSection';
import LogoutSection from '../sections/LogoutSection';
import { isAdminRole } from '@/utils/is-admin';

interface ProfileContentProps {
  currentUser: User;
  targetUser: User;
  isOwnProfile: boolean;
  handlers: ReturnType<typeof import('../hooks/useProfileHandlers').useProfileHandlers>;
}

export const ProfileContent: FC<ProfileContentProps> = ({
  currentUser,
  targetUser,
  isOwnProfile,
  handlers,
}) => {
  const isGod = currentUser.role === 'god';
  const isAdmin = isAdminRole(currentUser.role);
  const canDeleteGenerations =
    currentUser.role === 'god' || (currentUser.role === 'admin' && targetUser.role === 'user');

  return (
    <ProfileLayout
      active={handlers.activeTab}
      onChangeActive={(tab: ProfileTab) => handlers.setActiveTab(tab)}
      sidebar={
        <Sidebar
          isOwnProfile={isOwnProfile}
          active={handlers.activeTab}
          onChange={(tab: ProfileTab) => handlers.setActiveTab(tab)}
          user={targetUser}
        />
      }
    >
      {handlers.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => handlers.setError(null)}>
          {handlers.error}
        </Alert>
      )}

      {handlers.activeTab === 'info' && (
        <InfoSection
          isGod={isGod}
          isOwnProfile={isOwnProfile}
          user={targetUser}
          loading={handlers.loading}
          onSendEmailConfirm={handlers.handleSendEmailConfirm}
          onOpenChangeEmail={handlers.handleOpenEmailDialog}
          onOpenChangePassword={handlers.handleOpenPasswordDialog}
          onOpenEditNames={handlers.handleOpenNamesDialog}
          onConfirmEmail={handlers.handleConfirmEmail}
          onRevokeConfirmEmail={handlers.handleRevokeConfirmEmail}
          onBan={handlers.handleBanUser}
          onUnban={handlers.handleUnbanUser}
          onPromote={handlers.handlePromoteUser}
          onDemote={handlers.handleDemoteUser}
          onDelete={handlers.handleOpenDeleteDialog}
        />
      )}

      {handlers.activeTab === 'generations' && (
        <GenerationSection
          deleteAllowed={canDeleteGenerations}
          isAdmin={isAdmin}
          loading={handlers.loading}
          generations={handlers.generations}
          onDelete={handlers.handleDeleteGeneration}
          onRefresh={handlers.handleRefreshGenerations}
          onChangePage={handlers.handleChangeGenerationPage}
          onRegenerate={handlers.handleRegenerateGeneration}
          onDeleteAll={handlers.handleDeleteAllGenerations}
        />
      )}

      {handlers.activeTab === 'vars' && isOwnProfile && (
        <VariablesSection
          savedVars={handlers.savedVars}
          loading={handlers.loading}
          onRefresh={handlers.handleRefreshSavedVars}
          onClear={handlers.handleClearSavedVariables}
          onDelete={handlers.handleDeleteVariable}
          onUpdate={handlers.handleUpdateVariable}
          onPageChange={handlers.handleSavedVarsPageChange}
        />
      )}

      {handlers.activeTab === 'sessions' && isOwnProfile && (
        <SessionsSection
          sessions={handlers.sessions}
          loading={handlers.loading}
          onRefresh={handlers.handleRefreshSessions}
          onRevoke={handlers.handleRevokeSession}
          onLogoutEverywhere={handlers.handleLogoutEverywhere}
        />
      )}

      {handlers.activeTab === 'logout' && isOwnProfile && (
        <LogoutSection
          onLogout={handlers.handleLogout}
          onLogoutEverywhere={handlers.handleLogoutEverywhere}
          onDeleteAccount={handlers.handleOpenDeleteDialog}
        />
      )}
    </ProfileLayout>
  );
};
