import { useEffect, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type UseAdminTablePaginationOptions = {
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

export type AdminTablePaginationState = {
  page: number;
  pageSize: number;
  pageCount: number;
  pageSizeOptions: number[];
  totalItems: number;
  displayStart: number;
  displayEnd: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
};

const normalizePageSizeOptions = (options: number[], initialPageSize: number) => (
  Array.from(new Set([...options, initialPageSize]))
    .filter((option) => Number.isFinite(option) && option > 0)
    .sort((left, right) => left - right)
);

export const useAdminTablePagination = <T,>(
  items: T[],
  { initialPageSize = 10, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS }: UseAdminTablePaginationOptions = {},
) => {
  const normalizedPageSizeOptions = useMemo(
    () => normalizePageSizeOptions(pageSizeOptions, initialPageSize),
    [initialPageSize, pageSizeOptions],
  );
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const totalItems = items.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPageState(1);
  }, [items]);

  useEffect(() => {
    setPageState((current) => Math.min(Math.max(current, 1), pageCount));
  }, [pageCount]);

  const setPage = (nextPage: number) => {
    setPageState(Math.min(Math.max(nextPage, 1), pageCount));
  };

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPageState(1);
  };

  const startIndex = totalItems ? (page - 1) * pageSize : 0;
  const paginatedItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, pageSize, startIndex],
  );

  return {
    page,
    pageSize,
    pageCount,
    pageSizeOptions: normalizedPageSizeOptions,
    totalItems,
    displayStart: totalItems ? startIndex + 1 : 0,
    displayEnd: Math.min(startIndex + pageSize, totalItems),
    paginatedItems,
    setPage,
    setPageSize,
  };
};
