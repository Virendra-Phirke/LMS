import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  limit?: number;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  limit,
}: DataTablePaginationProps) {
  if (totalPages <= 1) return null;

  const createPageRange = () => {
    const range: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      range.push(1);
      
      if (page > 3) {
        range.push("...");
      }
      
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      
      if (page === 1) end = 3;
      if (page === totalPages) start = totalPages - 2;
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      
      if (page < totalPages - 2) {
        range.push("...");
      }
      
      range.push(totalPages);
    }
    
    return range;
  };

  const pages = createPageRange();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2">
      <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
        {totalItems !== undefined && limit !== undefined ? (
          <>
            Showing {Math.min((page - 1) * limit + 1, totalItems)} to{" "}
            {Math.min(page * limit, totalItems)} of {totalItems} items
          </>
        ) : (
          <>Page {page} of {totalPages}</>
        )}
      </div>
      
      <Pagination className="justify-end w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(page - 1)}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {pages.map((p, i) => (
            <PaginationItem key={i}>
              {p === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(p as number)}
                  isActive={page === p}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(page + 1)}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
