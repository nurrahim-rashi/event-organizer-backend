export interface PaginationQueryParams {
  page: number;
  take: number;
  sortOrder: string;
  sortBy: string;
  search?: string;
  location?: string;
  category?: string;
}
