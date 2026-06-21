import type { PaginatedResult } from '../dto/pagination.dto';
export type { PaginatedResult };

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function paginationParams(page = 1, limit = 20) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
