'use client';

import { useCallback, useEffect, useState } from 'react';
import { Container, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUserProfile } from './hooks/useUserProfile';

import Sidebar from './Sidebar';
import ProfileLayout from './ProfileLayout';
import InfoSection from './sections/InfoSection';
import VariablesSection from './sections/VariablesSection';
import SessionsSection from './sections/SessionsSection';
import LogoutSection from './sections/LogoutSection';

import ChangeEmailDialog from './dialogs/ChangeEmailDialog';
import ChangePasswordDialog from './dialogs/ChangePasswordDialog';
import EditNamesDialog from './dialogs/EditNamesDialog';
import DeleteAccountDialog from './dialogs/DeleteAccountDialog';

import { useUserStore } from '@/store/user';
import { SessionInfo } from '@/types/user';
import { AllVariablesResponse, DocumentVariable, VariableType } from '@/types/variables';
import { getInitialFormValues } from '@/lib/validation';
import { filterSavedVariables } from '@/utils/filter-saved-variables';
import { api } from '@/lib/api/core';
import { toErrorMessage } from '@/utils/errors-messages';

export default function ProfilePage() {
  const router = useRouter();
  const { targetUser, currentUser, isOwnProfile, error: hookError } = useUserProfile();

  const {
    logoutEverywhere,
    logout,
    sendEmailConfirmation,
    changeEmail,
    changeUserEmail,
    revokeConfirmEmail,
    changePassword,
    deleteAccount,
    updateNames,
    updateUserNames,
    listSessions,
    revokeSession,
    getSavedVariables,
    updateSavedVariable,
    deleteSavedVariable,
    clearSavedVariables,
    logoutLocal,
    confirmEmail,
    banUser,
    unbanUser,
    promoteUser,
    demoteUser,
    getUserSavedVariables,
    updateUserSavedVariable,
    deleteUserSavedVariable,
    clearUserSavedVariables,
    deleteUser,
  } = useUserStore();

  const [active, setActive] = useState<'info' | 'vars' | 'sessions' | 'logout'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [namesOpen, setNamesOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [allVars, setAllVars] = useState<Record<string, DocumentVariable>>({});
  const [savedVars, setSavedVars] = useState<Record<string, string>>({});
  const [savedDataValues, setSavedDataValues] = useState<Record<string, string>>({});

  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState<string | ''>('');
  const [confirmEmailDeleteAccount, setConfirmEmailDeleteAccount] = useState('');
  const [errorDeleteAccount, setErrorDeleteAccount] = useState('');

  const [loadingAttempted, setLoadingAttempted] = useState<string | null>(null);

  const updateVariables = useCallback(async () => {
    if (!targetUser?._id) return;

    const allVarsResponse = await api.get<AllVariablesResponse>('/config/variables');

    const newAllVars: Record<string, DocumentVariable> = {};
    for (const variable of allVarsResponse.data.variables) {
      if (variable.type !== VariableType.CONSTANT) {
        newAllVars[variable.variable] = variable;
      }
    }
    setAllVars(newAllVars);

    let vars: Record<string, string>;
    if (isOwnProfile) {
      vars = await getSavedVariables();
    } else {
      vars = await getUserSavedVariables(targetUser._id);
    }
    const filteredVars = filterSavedVariables(vars, newAllVars);
    setSavedVars(filteredVars);

    const initialValues = getInitialFormValues(
      Object.keys(filteredVars).map((variable) => newAllVars[variable]),
      filteredVars,
    );
    setSavedDataValues(initialValues);
  }, [getSavedVariables, getUserSavedVariables, isOwnProfile, targetUser?._id]);

  useEffect(() => {
    const load = async () => {
      if (!targetUser?._id) return;

      try {
        if (loadingAttempted !== targetUser._id) {
          setLoadingAttempted(targetUser._id);

          if (isOwnProfile) {
            const list = await listSessions();
            setSessions(list);
          }

          await updateVariables();
        }
      } catch (e) {
        setError(toErrorMessage(e, 'Помилка завантаження даних'));
      }
    };

    load();
  }, [
    targetUser?._id,
    updateVariables,
    listSessions,
    isOwnProfile,
    loadingAttempted,
    setLoadingAttempted,
  ]);

  if (!currentUser) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">Ви не авторизовані</Alert>
      </Container>
    );
  }

  if (!isOwnProfile && currentUser?.role !== 'admin' && currentUser?.role !== 'god') {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">Лише модератор може переглядати профіль інших</Alert>
      </Container>
    );
  }

  if (!targetUser) {
    if (!loadingAttempted && !hookError) return;

    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{hookError ? hookError : 'Користувач не знайдений'}</Alert>
      </Container>
    );
  }

  const handleRefreshSessions = async () => {
    if (!targetUser) return;
    setError(null);
    setLoading(true);
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалося завантажити сесії'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    setError(null);
    setLoading(true);
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (isCurrent) {
        logoutLocal();
        router.push('/');
      }
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалося видалити сесію'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleLogoutEverywhere = async () => {
    await logoutEverywhere();
    router.push('/');
  };

  const handleSavedValuesChange = (variable: string, value: string) => {
    setSavedDataValues((prev) => ({ ...prev, [variable]: value }));
  };

  const handleRefreshSavedVars = async () => {
    if (!targetUser) return;
    setError(null);
    setLoading(true);
    try {
      await updateVariables();
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалося завантажити дані'));
    } finally {
      setLoading(false);
    }
  };

  const handleClearSavedVariables = async () => {
    try {
      setError(null);
      setLoading(true);
      let saved_variables: Record<string, string>;
      if (isOwnProfile) {
        ({ saved_variables } = await clearSavedVariables());
      } else {
        ({ saved_variables } = await clearUserSavedVariables(targetUser._id));
      }
      const filtered = filterSavedVariables(saved_variables, allVars);
      setSavedVars(filtered);
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалося очистити дані'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVariable = async (variable: string, value: string) => {
    try {
      setLoading(true);
      let saved_variables: Record<string, string>;
      if (isOwnProfile) {
        ({ saved_variables } = await updateSavedVariable(variable, value));
      } else {
        ({ saved_variables } = await updateUserSavedVariable(targetUser._id, variable, value));
      }
      const filtered = filterSavedVariables(saved_variables, allVars);
      setSavedVars(filtered);
    } catch {
      setError('Не вдалося зберегти змінну');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariable = async (variable: string) => {
    try {
      setLoading(true);
      let saved_variables: Record<string, string>;
      if (isOwnProfile) {
        ({ saved_variables } = await deleteSavedVariable(variable));
      } else {
        ({ saved_variables } = await deleteUserSavedVariable(targetUser._id, variable));
      }
      const filtered = filterSavedVariables(saved_variables, allVars);
      setSavedVars(filtered);
    } catch {
      setError('Не вдалося видалити змінну');
    } finally {
      setLoading(false);
    }
  };

  const withAsyncHandler = async (action: CallableFunction, errorMessage: string) => {
    setError(null);
    setLoading(true);
    try {
      await action();
    } catch (e) {
      setError(toErrorMessage(e, errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailConfirm = () =>
    withAsyncHandler(sendEmailConfirmation, 'Не вдалося надіслати лист підтвердження');

  const handleConfirmEmail = () =>
    withAsyncHandler(async () => {
      await confirmEmail(targetUser._id);
      targetUser.email_verified = true;
    }, 'Не вдалося підтвердити пошту');

  const handleRevokeConfirmEmail = () =>
    withAsyncHandler(async () => {
      await revokeConfirmEmail(targetUser._id);
      targetUser.email_verified = false;
    }, 'Не вдалося зняти підтвердження пошту');

  const handleBanUser = () =>
    withAsyncHandler(async () => {
      await banUser(targetUser._id);
      targetUser.is_banned = true;
    }, 'Не вдалося заблокувати користувача');

  const handleUnbanUser = () =>
    withAsyncHandler(async () => {
      await unbanUser(targetUser._id);
      targetUser.is_banned = false;
    }, 'Не вдалося розблокувати користувача');

  const handlePromoteUser = () =>
    withAsyncHandler(async () => {
      await promoteUser(targetUser._id);
      targetUser.role = 'admin';
    }, 'Не вдалося підвищити користувача');

  const handleDemoteUser = () =>
    withAsyncHandler(async () => {
      await demoteUser(targetUser._id);
      targetUser.role = 'user';
    }, 'Не вдалося понизити користувача');

  const handleChangeEmail = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isOwnProfile) {
        await changeEmail(newEmail);
      } else {
        await changeUserEmail(targetUser._id, newEmail);
        targetUser.email = newEmail;
      }

      setEmailOpen(false);
      setNewEmail('');

      if (isOwnProfile) {
        router.push('/login');
      }
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалося змінити пошту'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordOpen(false);
      router.push('/login');
    } catch (e) {
      setError(toErrorMessage(e, 'Не вдалося змінити пароль'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNames = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isOwnProfile) {
        await updateNames(firstName, lastName || null);
      } else {
        await updateUserNames(targetUser._id, firstName, lastName || null);
        targetUser.first_name = firstName;
        targetUser.last_name = lastName || null;
      }
      setNamesOpen(false);
    } catch (e) {
      setError(toErrorMessage(e, "Не вдалося оновити ім'я"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeleteAccount = async () => {
    setErrorDeleteAccount('');
    setConfirmEmailDeleteAccount('');
    setOpenDeleteDialog(false);
  };

  const handleDeleteAccount = async () => {
    setErrorDeleteAccount('');

    try {
      if (isOwnProfile) {
        await deleteAccount();
      } else {
        await deleteUser(targetUser._id);
      }
      setOpenDeleteDialog(false);
      router.push(isOwnProfile ? '/' : '/users');
    } catch {
      setErrorDeleteAccount('Помилка при видаленні акаунта.');
    }
  };

  return (
    <Container sx={{ py: { xs: 2, md: 6 } }}>
      <ProfileLayout
        active={active}
        onChangeActive={(v) => setActive(v)}
        sidebar={
          <Sidebar
            isOwnProfile={isOwnProfile}
            active={active}
            onChange={(v) => setActive(v)}
            user={targetUser}
          />
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {active === 'info' && (
          <InfoSection
            isGod={currentUser.role === 'god'}
            isOwnProfile={isOwnProfile}
            user={targetUser}
            loading={loading}
            onSendEmailConfirm={handleSendEmailConfirm}
            onOpenChangeEmail={() => {
              setNewEmail(targetUser.email || '');
              setEmailOpen(true);
            }}
            onOpenChangePassword={() => setPasswordOpen(true)}
            onOpenEditNames={() => {
              setFirstName(targetUser.first_name || '');
              setLastName(targetUser.last_name || '');
              setNamesOpen(true);
            }}
            onConfirmEmail={handleConfirmEmail}
            onRevokeConfirmEmail={handleRevokeConfirmEmail}
            onBan={handleBanUser}
            onUnban={handleUnbanUser}
            onPromote={handlePromoteUser}
            onDemote={handleDemoteUser}
            onDelete={() => setOpenDeleteDialog(true)}
          />
        )}

        {active === 'vars' && (
          <VariablesSection
            isGod={currentUser.role === 'god'}
            isTargetUserRestricted={
              targetUser.role !== 'admin' && targetUser.role !== 'god' && !targetUser.email_verified
            }
            isOwnProfile={isOwnProfile}
            savedVars={savedVars}
            allVars={allVars}
            savedDataValues={savedDataValues}
            onRefresh={handleRefreshSavedVars}
            onClear={handleClearSavedVariables}
            onSave={handleSaveVariable}
            onDelete={handleDeleteVariable}
            onChangeValue={handleSavedValuesChange}
          />
        )}

        {active === 'sessions' && isOwnProfile && (
          <SessionsSection
            sessions={sessions}
            loading={loading}
            onRefresh={handleRefreshSessions}
            onRevoke={handleRevokeSession}
            onLogoutEverywhere={handleLogoutEverywhere}
          />
        )}

        {active === 'logout' && isOwnProfile && (
          <LogoutSection
            onLogout={handleLogout}
            onLogoutEverywhere={handleLogoutEverywhere}
            onDeleteAccount={() => setOpenDeleteDialog(true)}
          />
        )}
      </ProfileLayout>

      <ChangeEmailDialog
        open={emailOpen}
        value={newEmail}
        loading={loading}
        onClose={() => setEmailOpen(false)}
        onChange={(val) => setNewEmail(val)}
        onSubmit={handleChangeEmail}
      />

      <ChangePasswordDialog
        open={passwordOpen}
        loading={loading}
        oldPassword={oldPassword}
        newPassword={newPassword}
        showOld={showOldPassword}
        showNew={showNewPassword}
        onClose={() => setPasswordOpen(false)}
        onChangeOld={(val) => setOldPassword(val)}
        onChangeNew={(val) => setNewPassword(val)}
        onToggleOld={() => setShowOldPassword((s) => !s)}
        onToggleNew={() => setShowNewPassword((s) => !s)}
        onSubmit={handleChangePassword}
      />

      <EditNamesDialog
        open={namesOpen}
        loading={loading}
        firstName={firstName}
        lastName={lastName}
        onChangeFirst={(v) => setFirstName(v)}
        onChangeLast={(v) => setLastName(v)}
        onClose={() => setNamesOpen(false)}
        onSubmit={handleUpdateNames}
      />

      <DeleteAccountDialog
        open={openDeleteDialog}
        email={targetUser.email || 'Видалити'}
        confirmValue={confirmEmailDeleteAccount}
        error={errorDeleteAccount}
        onChangeConfirm={(v) => setConfirmEmailDeleteAccount(v)}
        onClose={handleCancelDeleteAccount}
        onSubmit={handleDeleteAccount}
      />
    </Container>
  );
}
