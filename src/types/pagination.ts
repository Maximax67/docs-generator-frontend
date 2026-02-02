export type PaginationMetadata = {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMetadata;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginationFilterParams = Record<string, string | number | boolean | undefined>;

export type UsePaginationParamsOptions = {
  defaultPageSize?: number;
  filterDefaults?: PaginationFilterParams;
};
