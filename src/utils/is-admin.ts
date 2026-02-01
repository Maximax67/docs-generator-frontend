import { User } from "@/types/user";

export const isAdminRole = (role: string): boolean => {
  return role === 'admin' || role === 'god';
}

export const isAdminUser = (user: User | null): boolean => {
  return !!user && isAdminRole(user.role);
}
