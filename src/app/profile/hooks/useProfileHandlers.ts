import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { adminApi, authApi, generationsApi, variablesApi, documentsApi } from '@/lib/api';
import { User, SessionInfo } from '@/types/user';
import { toErrorMessage } from '@/utils/errors-messages';
import { savePdfToIndexedDb } from '@/lib/indexed-db-pdf';
import { JSONValue } from '@/types/json';
import { Paginated } from '@/types/pagination';
import { Generation } from '@/types/generations';
import { SavedVariable } from '@/types/variables';
import { FolderTree } from '@/types/documents';

export function useProfileHandlers(targetUser: User | null, isOwnProfile: boolean) {
  const router = useRouter();
  const userStore = useUserStore();

  // UI State
  const [activeTab, setActiveTab] = useState<
    'info' | 'generations' | 'vars' | 'sessions' | 'logout'
  >('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [namesDialogOpen, setNamesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form States
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    showOld: false,
    showNew: false,
  });
  const [namesForm, setNamesForm] = useState({ firstName: '', lastName: '' });
  const [deleteForm, setDeleteForm] = useState({ confirmEmail: '', error: '' });

  // Data States
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [savedVars, setSavedVars] = useState<Paginated<SavedVariable> | null>(null);
  const [savedVarsPage, setSavedVarsPage] = useState(1);
  const [generationPage, setGenerationPage] = useState(1);
  const [generations, setGenerations] = useState<Paginated<Generation> | null>(null);
  const [folderTree, setFolderTree] = useState<FolderTree[] | null>(null);

  // Generic async handler wrapper
  const withAsyncHandler = useCallback(
    async (action: () => Promise<void>, errorMessage: string) => {
      setError(null);
      setLoading(true);
      try {
        await action();
      } catch (e) {
        setError(toErrorMessage(e, errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Email Handlers
  const handleOpenEmailDialog = useCallback(() => {
    setEmailForm({ newEmail: targetUser?.email || '' });
    setEmailDialogOpen(true);
  }, [targetUser]);

  const handleChangeEmail = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      if (isOwnProfile) {
        await userStore.changeEmail(emailForm.newEmail);
        router.push('/login');
      } else {
        await adminApi.changeUserEmail(targetUser.id, emailForm.newEmail);
        if (targetUser) targetUser.email = emailForm.newEmail;
      }
      setEmailDialogOpen(false);
      setEmailForm({ newEmail: '' });
    }, 'Не вдалося змінити пошту');
  }, [targetUser, isOwnProfile, emailForm.newEmail, router, withAsyncHandler, userStore]);

  // Password Handlers
  const handleOpenPasswordDialog = useCallback(() => {
    setPasswordDialogOpen(true);
  }, []);

  const handleChangePassword = useCallback(async () => {
    await withAsyncHandler(async () => {
      await userStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordDialogOpen(false);
      router.push('/login');
    }, 'Не вдалося змінити пароль');
  }, [passwordForm, router, withAsyncHandler, userStore]);

  // Names Handlers
  const handleOpenNamesDialog = useCallback(() => {
    setNamesForm({
      firstName: targetUser?.first_name || '',
      lastName: targetUser?.last_name || '',
    });
    setNamesDialogOpen(true);
  }, [targetUser]);

  const handleUpdateNames = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      if (isOwnProfile) {
        await userStore.updateNames(namesForm.firstName, namesForm.lastName || null);
      } else {
        await adminApi.updateUserNames(
          targetUser.id,
          namesForm.firstName,
          namesForm.lastName || null,
        );
        targetUser.first_name = namesForm.firstName;
        targetUser.last_name = namesForm.lastName || null;
      }
      setNamesDialogOpen(false);
    }, "Не вдалося оновити ім'я");
  }, [targetUser, isOwnProfile, namesForm, withAsyncHandler, userStore]);

  // Account Actions
  const handleSendEmailConfirm = useCallback(
    () =>
      withAsyncHandler(
        () => userStore.sendEmailConfirmation(),
        'Не вдалося надіслати лист підтвердження',
      ),
    [withAsyncHandler, userStore],
  );

  const handleConfirmEmail = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.confirmUserEmail(targetUser.id);
        targetUser.email_verified = true;
      }, 'Не вдалося підтвердити пошту'),
    [targetUser, withAsyncHandler],
  );

  const handleRevokeConfirmEmail = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.revokeUserEmailConfirmation(targetUser.id);
        targetUser.email_verified = false;
      }, 'Не вдалося зняти підтвердження пошту'),
    [targetUser, withAsyncHandler],
  );

  const handleBanUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.banUser(targetUser.id);
        targetUser.is_banned = true;
      }, 'Не вдалося заблокувати користувача'),
    [targetUser, withAsyncHandler],
  );

  const handleUnbanUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.unbanUser(targetUser.id);
        targetUser.is_banned = false;
      }, 'Не вдалося розблокувати користувача'),
    [targetUser, withAsyncHandler],
  );

  const handlePromoteUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.promoteUserToAdmin(targetUser.id);
        targetUser.role = 'admin';
      }, 'Не вдалося підвищити користувача'),
    [targetUser, withAsyncHandler],
  );

  const handleDemoteUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.demoteAdminToUser(targetUser.id);
        targetUser.role = 'user';
      }, 'Не вдалося понизити користувача'),
    [targetUser, withAsyncHandler],
  );

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!targetUser) return;

    try {
      setDeleteForm((prev) => ({ ...prev, error: '' }));
      if (isOwnProfile) {
        await userStore.deleteAccount();
      } else {
        await adminApi.deleteUser(targetUser.id);
      }
      setDeleteDialogOpen(false);
      router.push(isOwnProfile ? '/' : '/users');
    } catch {
      setDeleteForm((prev) => ({ ...prev, error: 'Помилка при видаленні акаунта.' }));
    }
  }, [targetUser, isOwnProfile, router, userStore]);

  // Session Handlers
  const handleRefreshSessions = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      const list = await authApi.listSessions();
      setSessions(list);
    }, 'Не вдалося завантажити сесії');
  }, [targetUser, withAsyncHandler]);

  const handleRevokeSession = useCallback(
    async (sessionId: string, isCurrent: boolean) => {
      await withAsyncHandler(async () => {
        await authApi.revokeSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (isCurrent) {
          userStore.logoutLocal();
          router.push('/');
        }
      }, 'Не вдалося видалити сесію');
    },
    [router, withAsyncHandler, userStore],
  );

  const handleLogout = useCallback(async () => {
    await userStore.logout();
    router.push('/');
  }, [router, userStore]);

  const handleLogoutEverywhere = useCallback(async () => {
    await userStore.logoutEverywhere();
    router.push('/');
  }, [router, userStore]);

  // Variables Handlers
  const handleRefreshSavedVars = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      const vars = await variablesApi.getSavedVariables(savedVarsPage, 25);
      setSavedVars(vars);
    }, 'Не вдалося завантажити дані');
  }, [targetUser, savedVarsPage, withAsyncHandler]);

  const handleSavedVarsPageChange = useCallback(
    async (page: number) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        const vars = await variablesApi.getSavedVariables(page, 25);
        setSavedVarsPage(page);
        setSavedVars(vars);
      }, 'Не вдалося завантажити дані');
    },
    [targetUser, withAsyncHandler],
  );

  const handleClearSavedVariables = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      await variablesApi.clearSavedVariables();
      setSavedVars(null);
      setSavedVarsPage(1);
    }, 'Не вдалося очистити дані');
  }, [targetUser, withAsyncHandler]);

  const handleDeleteVariable = useCallback(
    async (variableId: string) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        await variablesApi.deleteSavedVariable(variableId);
        const vars = await variablesApi.getSavedVariables(savedVarsPage, 25);
        setSavedVars(vars);
      }, 'Не вдалося видалити змінну');
    },
    [targetUser, savedVarsPage, withAsyncHandler],
  );

  const handleUpdateVariable = useCallback(
    async (variableId: string, value: JSONValue) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        await variablesApi.updateSavedVariable(variableId, value);
        const vars = await variablesApi.getSavedVariables(savedVarsPage, 25);
        setSavedVars(vars);
      }, 'Не вдалося оновити змінну');
    },
    [targetUser, savedVarsPage, withAsyncHandler],
  );

  const handleRefreshGenerations = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      const results = await generationsApi.getGenerations({
        page: generationPage,
        userId: targetUser.id,
      });
      setGenerations(results);
    }, 'Не вдалось отримати список генерацій');
  }, [targetUser, generationPage, withAsyncHandler]);

  const handleChangeGenerationPage = useCallback(
    async (page: number) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        const results = await generationsApi.getGenerations({ page, userId: targetUser.id });
        setGenerationPage(page);
        setGenerations(results);
      }, 'Не вдалось отримати список генерацій');
    },
    [targetUser, withAsyncHandler],
  );

  const handleRegenerateGeneration = useCallback(
    async (id: string, variables?: Record<string, JSONValue>) => {
      await withAsyncHandler(async () => {
        const blob = await generationsApi.regenerateGeneration(id, variables);
        await savePdfToIndexedDb('generatedPdf', blob);
        router.push('/documents/result');
      }, 'Не вдалось перегенерувати PDF');
    },
    [router, withAsyncHandler],
  );

  const handleDeleteGeneration = useCallback(
    async (id: string) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        await generationsApi.deleteGeneration(id);

        const isLastItemOnPage = generations?.data.length === 1;
        const isNotFirstPage = generationPage > 1;

        if (isLastItemOnPage && isNotFirstPage) {
          await handleChangeGenerationPage(generationPage - 1);
        } else {
          await handleRefreshGenerations();
        }
      }, 'Не вдалось видалити генерацію');
    },
    [
      targetUser,
      generations,
      generationPage,
      handleChangeGenerationPage,
      handleRefreshGenerations,
      withAsyncHandler,
    ],
  );

  const handleDeleteAllGenerations = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(
      () => generationsApi.deleteAllUserGenerations(targetUser.id),
      'Не вдалось видалити всі генерації',
    );

    await handleChangeGenerationPage(1);
  }, [targetUser, handleChangeGenerationPage, withAsyncHandler]);

  // Initialize data on mount
  useEffect(() => {
    if (!targetUser) return;

    const init = async () => {
      if (isOwnProfile) {
        try {
          const sessionList = await authApi.listSessions();
          setSessions(sessionList);
        } catch (e) {
          setError(toErrorMessage(e, 'Помилка завантаження сесій'));
        }

        try {
          const vars = await variablesApi.getSavedVariables(1, 25);
          setSavedVars(vars);
        } catch (e) {
          setError(toErrorMessage(e, 'Помилка завантаження змінних'));
        }

        try {
          const data = await documentsApi.getFolderTree();
          setFolderTree(data.tree);
        } catch (e) {
          setError(toErrorMessage(e, 'Помилка завантаження структури документів'));
        }
      }

      try {
        const generations = await generationsApi.getGenerations({
          page: 1,
          userId: targetUser.id,
        });
        setGenerations(generations);
      } catch (e) {
        setError(toErrorMessage(e, 'Помилка завантаження генерацій'));
      }
    };

    init();
  }, [isOwnProfile, targetUser]);

  return {
    // State
    activeTab,
    loading,
    error,
    sessions,
    savedVars,
    savedVarsPage,
    generationPage,
    generations: generations,
    folderTree,

    // Setters
    setActiveTab,
    setError,

    // Dialog States
    emailDialogOpen,
    setEmailDialogOpen,
    passwordDialogOpen,
    setPasswordDialogOpen,
    namesDialogOpen,
    setNamesDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,

    // Form States
    emailForm,
    setEmailForm,
    passwordForm,
    setPasswordForm,
    namesForm,
    setNamesForm,
    deleteForm,
    setDeleteForm,

    // Handlers
    handleOpenEmailDialog,
    handleChangeEmail,
    handleOpenPasswordDialog,
    handleChangePassword,
    handleOpenNamesDialog,
    handleUpdateNames,
    handleSendEmailConfirm,
    handleConfirmEmail,
    handleRevokeConfirmEmail,
    handleBanUser,
    handleUnbanUser,
    handlePromoteUser,
    handleDemoteUser,
    handleOpenDeleteDialog,
    handleDeleteAccount,
    handleRefreshSessions,
    handleRevokeSession,
    handleLogout,
    handleLogoutEverywhere,
    handleRefreshSavedVars,
    handleSavedVarsPageChange,
    handleClearSavedVariables,
    handleDeleteVariable,
    handleUpdateVariable,
    handleRefreshGenerations,
    handleChangeGenerationPage,
    handleRegenerateGeneration,
    handleDeleteGeneration,
    handleDeleteAllGenerations,
  };
}
