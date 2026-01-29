export type UserRole = 'admin' | 'user' | 'god';

export type UserInfo = {
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

export type User = UserInfo & { _id: string };

export type SessionInfo = {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  current: boolean;
};

export type UserState = {
  // --- State ---
  user: User | null;
  loading: boolean;
  error: string | null;
  rateLimitedUntil: number | null;

  // --- Basic state setters ---
  setUser: (user: User | null) => void;
  clearError: () => void;
  logoutLocal: () => void;

  // --- Rate limiting ---
  setRateLimit: (until: number | null) => void;
  clearRateLimit: () => void;

  // --- Bootstrap ---
  bootstrap: () => Promise<void>;

  // --- Auth ---
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  registerWithCredentials: (payload: {
    email: string;
    first_name: string;
    last_name?: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  refeshSession: () => Promise<void>;

  // --- Email ---
  sendEmailConfirmation: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;

  // --- Password ---
  requestPasswordReset: (email: string) => Promise<void>;
  changePasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // --- Profile ---
  updateNames: (firstName: string, lastName?: string | null) => Promise<void>;
  deleteAccount: () => Promise<void>;
};
