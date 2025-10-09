import { UserInfo } from './user';

export type Result = {
  _id: string;
  user?: UserInfo & { id: string };
  template_id: string;
  template_name: string;
  variables: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type PaginationMeta = {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

export type PaginatedResults = {
  data: Result[];
  meta: PaginationMeta;
};
