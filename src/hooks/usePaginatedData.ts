import { useState} from 'react';
export function usePaginatedData<T>(
    items: T[],
    pageSize = 20
  ) {
    const [page, setPage] = useState(0);
    
    return {
      items: items.slice(page * pageSize, (page + 1) * pageSize),
      page,
      setPage,
      totalPages: Math.ceil(items.length / pageSize),
    };
  }