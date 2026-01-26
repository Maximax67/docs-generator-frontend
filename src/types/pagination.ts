export type PaginationMetadata = {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export type Paginated<T> = {
  data: T[];
  meta: PaginationMetadata;
}
