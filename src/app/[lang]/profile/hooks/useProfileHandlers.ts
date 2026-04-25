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
import { FolderTreeGlobal } from '@/types/documents';
import { useConfirm } from '@/providers/ConfirmProvider';
import { useDictionary } from '@/contexts/LangContext';

export function useProfileHandlers(targetUser: User | null, isOwnProfile: boolean) {
  const router = useRouter();
  const userStore = useUserStore();
  const { confirm } = useConfirm();
  const dict = useDictionary();
  const pe = dict.profile.errors;
  const pc = dict.profile.confirmations;

  const [activeTab, setActiveTab] = useState<'info' | 'generations' | 'vars' | 'sessions' | 'logout'>('info');
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
  const [folderTree, setFolderTree] = useState<FolderTreeGlobal | null>(null);

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
    }, pe.changeEmail);
  }, [targetUser, isOwnProfile, emailForm.newEmail, router, withAsyncHandler, userStore, pe.changeEmail]);

  // Password Handlers
  const handleOpenPasswordDialog = useCallback(() => {
    setPasswordDialogOpen(true);
  }, []);

  const handleChangePassword = useCallback(async () => {
    await withAsyncHandler(async () => {
      await userStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordDialogOpen(false);
      router.push('/login');
    }, pe.changePassword);
  }, [passwordForm, router, withAsyncHandler, userStore, pe.changePassword]);

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
    }, pe.updateNames);
  }, [targetUser, isOwnProfile, namesForm, withAsyncHandler, userStore, pe.updateNames]);

  // Account Actions
  const handleSendEmailConfirm = useCallback(
    () =>
      withAsyncHandler(
        () => userStore.sendEmailConfirmation(),
        pe.sendConfirmation,
      ),
    [withAsyncHandler, userStore, pe.sendConfirmation],
  );

  const handleConfirmEmail = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.confirmUserEmail(targetUser.id);
        targetUser.email_verified = true;
      }, pe.confirmEmail),
    [targetUser, withAsyncHandler, pe.confirmEmail],
  );

  const handleRevokeConfirmEmail = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.revokeUserEmailConfirmation(targetUser.id);
        targetUser.email_verified = false;
      }, pe.revokeConfirmation),
    [targetUser, withAsyncHandler, pe.revokeConfirmation],
  );

  const handleBanUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.banUser(targetUser.id);
        targetUser.is_banned = true;
      }, pe.banUser),
    [targetUser, withAsyncHandler, pe.banUser],
  );

  const handleUnbanUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.unbanUser(targetUser.id);
        targetUser.is_banned = false;
      }, pe.unbanUser),
    [targetUser, withAsyncHandler, pe.unbanUser],
  );

  const handlePromoteUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.promoteUserToAdmin(targetUser.id);
        targetUser.role = 'admin';
      }, pe.promoteUser),
    [targetUser, withAsyncHandler, pe.promoteUser],
  );

  const handleDemoteUser = useCallback(
    () =>
      withAsyncHandler(async () => {
        if (!targetUser) return;
        await adminApi.demoteAdminToUser(targetUser.id);
        targetUser.role = 'user';
      }, pe.demoteUser),
    [targetUser, withAsyncHandler, pe.demoteUser],
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
      setDeleteForm((prev) => ({ ...prev, error: pe.deleteAccount }));
    }
  }, [targetUser, isOwnProfile, router, userStore, pe.deleteAccount]);

  // Session Handlers
  const handleRefreshSessions = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      const list = await authApi.listSessions();
      setSessions(list);
    }, pe.loadSessions);
  }, [targetUser, withAsyncHandler, pe.loadSessions]);

  const handleRevokeSession = useCallback(
    async (sessionId: string, isCurrent: boolean) => {
      const confirmed = await confirm({
        title: pc.endSession.title,
        message: isCurrent ? pc.endSession.currentMessage : pc.endSession.message,
        confirmText: pc.endSession.confirm,
        cancelText: dict.common.cancel,
        severity: 'warning',
      });

      if (!confirmed) return;

      await withAsyncHandler(async () => {
        await authApi.revokeSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (isCurrent) {
          userStore.logoutLocal();
          router.push('/');
        }
      }, pe.deleteSession);
    },
    [confirm, withAsyncHandler, userStore, router, pc, dict.common.cancel, pe.deleteSession],
  );

  const handleLogout = useCallback(async () => {
    await userStore.logout();
    router.push('/');
  }, [router, userStore]);

  const handleLogoutEverywhere = useCallback(async () => {
    const confirmed = await confirm({
      title: pc.logoutAll.title,
      message: pc.logoutAll.message,
      confirmText: pc.logoutAll.confirm,
      cancelText: dict.common.cancel,
      severity: 'error',
    });

    if (!confirmed) return;

    await userStore.logoutEverywhere();
    router.push('/');
  }, [confirm, router, userStore, pc, dict.common.cancel]);

  // Variables Handlers
  const handleRefreshSavedVars = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      const vars = await variablesApi.getSavedVariables(savedVarsPage);
      setSavedVars(vars);
    }, pe.loadVars);
  }, [targetUser, savedVarsPage, withAsyncHandler, pe.loadVars]);

  const handleSavedVarsPageChange = useCallback(
    async (page: number) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        const vars = await variablesApi.getSavedVariables(page);
        setSavedVarsPage(page);
        setSavedVars(vars);
      }, pe.loadVars);
    },
    [targetUser, withAsyncHandler, pe.loadVars],
  );

  const handleClearSavedVariables = useCallback(async () => {
    if (!targetUser) return;

    const confirmed = await confirm({
      title: pc.clearData.title,
      message: pc.clearData.message,
      confirmText: pc.clearData.confirm,
      cancelText: dict.common.cancel,
      severity: 'warning',
    });

    if (!confirmed) return;

    await withAsyncHandler(async () => {
      await variablesApi.clearSavedVariables();
      setSavedVars(null);
      setSavedVarsPage(1);
    }, pe.clearVars);
  }, [confirm, targetUser, withAsyncHandler, pc, dict.common.cancel, pe.clearVars]);

  const handleDeleteVariable = useCallback(
    async (variableId: string) => {
      if (!targetUser) return;

      const confirmed = await confirm({
        title: pc.deleteVar.title,
        message: pc.deleteVar.message,
        confirmText: pc.deleteVar.confirm,
        cancelText: dict.common.cancel,
        severity: 'error',
      });

      if (!confirmed) return;

      await withAsyncHandler(async () => {
        await variablesApi.deleteSavedVariable(variableId);
        const vars = await variablesApi.getSavedVariables(savedVarsPage);
        setSavedVars(vars);
      }, pe.deleteVar);
    },
    [targetUser, confirm, withAsyncHandler, savedVarsPage, pc, dict.common.cancel, pe.deleteVar],
  );

  const handleUpdateVariable = useCallback(
    async (variableId: string, value: JSONValue) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        await variablesApi.updateSavedVariable(variableId, value);
        const vars = await variablesApi.getSavedVariables(1);
        setSavedVars(vars);
        setSavedVarsPage(1);
      }, pe.updateVar);
    },
    [targetUser, withAsyncHandler, pe.updateVar],
  );

  const handleRefreshGenerations = useCallback(async () => {
    if (!targetUser) return;

    await withAsyncHandler(async () => {
      const results = await generationsApi.getGenerations({
        page: generationPage,
        userId: targetUser.id,
      });
      setGenerations(results);
    }, pe.loadGenerations);
  }, [targetUser, generationPage, withAsyncHandler, pe.loadGenerations]);

  const handleChangeGenerationPage = useCallback(
    async (page: number) => {
      if (!targetUser) return;

      await withAsyncHandler(async () => {
        const results = await generationsApi.getGenerations({ page, userId: targetUser.id });
        setGenerationPage(page);
        setGenerations(results);
      }, pe.loadGenerations);
    },
    [targetUser, withAsyncHandler, pe.loadGenerations],
  );

  const handleRegenerateGeneration = useCallback(
    async (id: string, variables?: Record<string, JSONValue>) => {
      await withAsyncHandler(async () => {
        const blob = await generationsApi.regenerateGeneration(id, variables);
        await savePdfToIndexedDb('generatedPdf', blob);
        router.push('/documents/result');
      }, pe.regenerate);
    },
    [router, withAsyncHandler, pe.regenerate],
  );

  const handleDeleteGeneration = useCallback(
    async (id: string) => {
      if (!targetUser) return;

      const confirmed = await confirm({
        title: pc.deleteGeneration.title,
        message: pc.deleteGeneration.message,
        confirmText: pc.deleteGeneration.confirm,
        cancelText: dict.common.cancel,
        severity: 'error',
      });

      if (!confirmed) return;

      await withAsyncHandler(async () => {
        await generationsApi.deleteGeneration(id);

        const isLastItemOnPage = generations?.data.length === 1;
        const isNotFirstPage = generationPage > 1;

        if (isLastItemOnPage && isNotFirstPage) {
          await handleChangeGenerationPage(generationPage - 1);
        } else {
          await handleRefreshGenerations();
        }
      }, pe.deleteGeneration);
    },
    [
      targetUser,
      confirm,
      withAsyncHandler,
      generations?.data.length,
      generationPage,
      handleChangeGenerationPage,
      handleRefreshGenerations,
      pc,
      dict.common.cancel,
      pe.deleteGeneration,
    ],
  );

  const handleDeleteAllGenerations = useCallback(async () => {
    if (!targetUser) return;

    const confirmed = await confirm({
      title: pc.deleteAllGenerations.title,
      message: pc.deleteAllGenerations.message,
      confirmText: pc.deleteAllGenerations.confirm,
      cancelText: dict.common.cancel,
      severity: 'error',
    });

    if (!confirmed) return;

    await withAsyncHandler(
      () => generationsApi.deleteAllUserGenerations(targetUser.id),
      pe.deleteAllGenerations,
    );

    await handleChangeGenerationPage(1);
  }, [targetUser, confirm, withAsyncHandler, handleChangeGenerationPage, pc, dict.common.cancel, pe.deleteAllGenerations]);

  // Initialize data on mount
  useEffect(() => {
    if (!targetUser) return;

    const init = async () => {
      if (isOwnProfile) {
        try {
          const sessionList = await authApi.listSessions();
          setSessions(sessionList);
        } catch (e) {
          setError(toErrorMessage(e, pe.initSessions));
        }

        try {
          const vars = await variablesApi.getSavedVariables(1);
          setSavedVars(vars);
        } catch (e) {
          setError(toErrorMessage(e, pe.initVars));
        }

        try {
          const data = await documentsApi.getGlobalFolderTree();
          setFolderTree(data);
        } catch (e) {
          setError(toErrorMessage(e, pe.loadFolderTree));
        }
      }

      try {
        const gens = await generationsApi.getGenerations({
          page: 1,
          userId: targetUser.id,
        });
        setGenerations(gens);
      } catch (e) {
        setError(toErrorMessage(e, pe.initGenerations));
      }
    };

    init();
  }, [isOwnProfile, targetUser, pe]);

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
