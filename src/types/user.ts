export type UserRole = 'admin' | 'user' | 'god';

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  saved_variables: Record<string, string>;
  is_banned: boolean;
  email_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type SessionInfo = {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  current: boolean;
};

export type UserState = {
  user: User | null;
  setUser: (user: User) => void;
  logoutLocal: () => void;
  bootstrap: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerWithCredentials: (payload: {
    email: string;
    first_name: string;
    last_name?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  refeshSession: () => Promise<void>;
  sendEmailConfirmation: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  changePasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateNames: (firstName: string, lastName?: string | null) => Promise<void>;
  deleteAccount: () => Promise<void>;
};
