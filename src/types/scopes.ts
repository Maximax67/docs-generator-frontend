export enum AccessLevel {
  ANY = 'any',
  AUTHENTICATED = 'authenticated',
  VERIFIED = 'email_verified',
  ADMIN = 'admin',
}

export interface ScopeRestrictions {
  access_level: AccessLevel;
  max_depth: number | null;
}

export interface ScopeResponse {
  drive_id: string;
  is_folder: boolean;
  is_pinned: boolean;
  restrictions: ScopeRestrictions;
  created_at: string;
  updated_at: string;
}

export interface ScopeCreate {
  drive_id: string;
  is_pinned: boolean;
  restrictions: ScopeRestrictions;
}

export interface ScopeUpdate {
  restrictions: ScopeRestrictions;
}

export interface ScopeSettings {
  drive_id: string;
  is_pinned: boolean;
  restrictions: ScopeRestrictions;
}
