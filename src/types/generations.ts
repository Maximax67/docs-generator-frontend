import { UserInfo } from './user';

export type Generation = {
  _id: string;
  user?: UserInfo & { id: string };
  template_id: string;
  template_name: string;
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
};
