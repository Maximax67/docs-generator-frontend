import { FC } from 'react';
import { User } from '@/types/user';
import ChangeEmailDialog from '../dialogs/ChangeEmailDialog';
import ChangePasswordDialog from '../dialogs/ChangePasswordDialog';
import EditNamesDialog from '../dialogs/EditNamesDialog';
import DeleteAccountDialog from '../dialogs/DeleteAccountDialog';

interface ProfileDialogsProps {
  targetUser: User;
  handlers: ReturnType<typeof import('../hooks/useProfileHandlers').useProfileHandlers>;
}

export const ProfileDialogs: FC<ProfileDialogsProps> = ({ targetUser, handlers }) => {
  return (
    <>
      <ChangeEmailDialog
        open={handlers.emailDialogOpen}
        value={handlers.emailForm.newEmail}
        loading={handlers.loading}
        onClose={() => handlers.setEmailDialogOpen(false)}
        onChange={(val) => handlers.setEmailForm({ newEmail: val })}
        onSubmit={handlers.handleChangeEmail}
      />

      <ChangePasswordDialog
        open={handlers.passwordDialogOpen}
        loading={handlers.loading}
        oldPassword={handlers.passwordForm.oldPassword}
        newPassword={handlers.passwordForm.newPassword}
        showOld={handlers.passwordForm.showOld}
        showNew={handlers.passwordForm.showNew}
        onClose={() => handlers.setPasswordDialogOpen(false)}
        onChangeOld={(val) => handlers.setPasswordForm((prev) => ({ ...prev, oldPassword: val }))}
        onChangeNew={(val) => handlers.setPasswordForm((prev) => ({ ...prev, newPassword: val }))}
        onToggleOld={() =>
          handlers.setPasswordForm((prev) => ({ ...prev, showOld: !prev.showOld }))
        }
        onToggleNew={() =>
          handlers.setPasswordForm((prev) => ({ ...prev, showNew: !prev.showNew }))
        }
        onSubmit={handlers.handleChangePassword}
      />

      <EditNamesDialog
        open={handlers.namesDialogOpen}
        loading={handlers.loading}
        firstName={handlers.namesForm.firstName}
        lastName={handlers.namesForm.lastName}
        onChangeFirst={(v) => handlers.setNamesForm((prev) => ({ ...prev, firstName: v }))}
        onChangeLast={(v) => handlers.setNamesForm((prev) => ({ ...prev, lastName: v }))}
        onClose={() => handlers.setNamesDialogOpen(false)}
        onSubmit={handlers.handleUpdateNames}
      />

      <DeleteAccountDialog
        open={handlers.deleteDialogOpen}
        email={targetUser.email || 'Видалити'}
        confirmValue={handlers.deleteForm.confirmEmail}
        error={handlers.deleteForm.error}
        onChangeConfirm={(v) => handlers.setDeleteForm((prev) => ({ ...prev, confirmEmail: v }))}
        onClose={() => {
          handlers.setDeleteDialogOpen(false);
          handlers.setDeleteForm({ confirmEmail: '', error: '' });
        }}
        onSubmit={handlers.handleDeleteAccount}
      />
    </>
  );
};
