import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdminTablePaginationState } from "./useAdminTablePagination";

type PageItem = number | "ellipsis";

type AdminTablePaginationProps = {
  pagination: AdminTablePaginationState;
  itemLabel?: string;
  className?: string;
};

const getPageItems = (page: number, pageCount: number): PageItem[] => {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const visiblePages = Array.from(pages)
    .filter((item) => item >= 1 && item <= pageCount)
    .sort((left, right) => left - right);

  return visiblePages.reduce<PageItem[]>((items, item, index) => {
    const previous = visiblePages[index - 1];
    if (previous && item - previous > 1) items.push("ellipsis");
    items.push(item);
    return items;
  }, []);
};

const AdminTablePagination = ({ pagination, itemLabel = "items", className }: AdminTablePaginationProps) => {
  const pageItems = useMemo(
    () => getPageItems(pagination.page, pagination.pageCount),
    [pagination.page, pagination.pageCount],
  );

  if (!pagination.totalItems) return null;

  return (
    <div className={cn("flex flex-col gap-3 border-t border-grid/20 px-4 py-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      <p className="text-sm text-muted-foreground">
        Showing {pagination.displayStart}-{pagination.displayEnd} of {pagination.totalItems} {itemLabel}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select value={String(pagination.pageSize)} onValueChange={(value) => pagination.setPageSize(Number(value))}>
            <SelectTrigger className="h-9 w-[92px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pagination.pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pagination.setPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="hidden items-center gap-1 sm:flex">
            {pageItems.map((item, index) => item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="flex h-9 min-w-9 items-center justify-center px-2 text-sm text-muted-foreground">...</span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={pagination.page === item ? "default" : "ghost"}
                size="sm"
                className="h-9 min-w-9 px-3"
                onClick={() => pagination.setPage(item)}
                aria-current={pagination.page === item ? "page" : undefined}
              >
                {item}
              </Button>
            ))}
          </div>
          <span className="px-2 text-sm text-muted-foreground sm:hidden">
            Page {pagination.page} of {pagination.pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pagination.setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pageCount}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTablePagination;
