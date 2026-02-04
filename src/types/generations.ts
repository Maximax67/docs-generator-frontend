import { User } from './user';

export type Generation = {
  id: string;
  user: User | null;
  template_id: string;
  template_name: string;
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
};
