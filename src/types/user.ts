export type UserRole = 'admin' | 'user' | 'god';

export type User = {
  _id: string;
  telegram_id?: number | null;
  email?: string | null;
  first_name: string;
  last_name?: string | null;
  telegram_username?: string | null;
  saved_variables: Record<string, string>;
  is_banned: boolean;
  email_verified?: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type AllUsersResponse = {
  users: User[];
};

export type SessionInfo = {
  id: string;
  name?: string | null;
  created_at: string;
  updated_at: string;
  current: boolean;
};

export type UserState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  rateLimitedUntil: number | null;
  setRateLimit: (until: number | null) => void;
  clearRateLimit: () => void;
  setUser: (u: User | null) => void;
  clearError: () => void;
  logoutLocal: () => void;
  bootstrap: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  registerWithCredentials: (payload: {
    email: string;
    first_name: string;
    last_name?: string;
    password: string;
  }) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  changePasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  logout: () => Promise<void>;
  sendEmailConfirmation: () => Promise<void>;
  confirmEmail: (userId: string) => Promise<void>;
  revokeConfirmEmail: (userId: string) => Promise<void>;
  changeUserEmail: (userId: string, newEmail: string) => Promise<void>;
  banUser: (userId: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;
  promoteUser: (userId: string) => Promise<void>;
  demoteUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateNames: (firstName: string, lastName?: string | null) => Promise<void>;
  updateUserNames: (userId: string, firstName: string, lastName?: string | null) => Promise<void>;
  listSessions: () => Promise<SessionInfo[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  getSavedVariables: () => Promise<Record<string, string>>;
  setSavedVariables: (vars: Record<string, string>) => Promise<User>;
  updateSavedVariable: (key: string, value: string) => Promise<User>;
  deleteSavedVariable: (key: string) => Promise<User>;
  clearSavedVariables: () => Promise<User>;
  getUserSavedVariables: (userId: string) => Promise<Record<string, string>>;
  setUserSavedVariables: (userId: string, vars: Record<string, string>) => Promise<User>;
  updateUserSavedVariable: (userId: string, key: string, value: string) => Promise<User>;
  deleteUserSavedVariable: (userId: string, key: string) => Promise<User>;
  clearUserSavedVariables: (userId: string) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
};
