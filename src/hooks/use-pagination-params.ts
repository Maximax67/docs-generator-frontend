import { PaginationFilterParams, PaginationParams, UsePaginationParamsOptions } from '@/types/pagination';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function usePaginationParams(options: UsePaginationParamsOptions = {}) {
  const { defaultPageSize = 25, filterDefaults = {} } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('page_size') ?? defaultPageSize);

  const filters = useMemo(() => {
    const result: PaginationFilterParams = {};
    Object.keys(filterDefaults).forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        result[key] = value;
      } else {
        result[key] = filterDefaults[key];
      }
    });
    return result;
  }, [searchParams, filterDefaults]);

  const updateParams = useCallback(
    (updates: Partial<PaginationParams & PaginationFilterParams>) => {
      const params = new URLSearchParams();

      const newPage = updates.page ?? page;
      const newPageSize = updates.pageSize ?? pageSize;

      params.set('page', String(newPage));
      params.set('page_size', String(newPageSize));

      Object.keys(filterDefaults).forEach((key) => {
        const value = key in updates ? updates[key] : filters[key];
        const defaultValue = filterDefaults[key];

        if (value !== undefined && value !== defaultValue && value !== '') {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [page, pageSize, filters, filterDefaults, router],
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage });
    },
    [updateParams],
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      updateParams({ page: 1, pageSize: newPageSize });
    },
    [updateParams],
  );

  const setFilter = useCallback(
    (key: string, value: string | number | boolean | undefined) => {
      updateParams({ page: 1, [key]: value });
    },
    [updateParams],
  );

  return {
    page,
    pageSize,
    filters,
    setPage,
    setPageSize,
    setFilter,
    updateParams,
  };
}
