import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import { getHistory } from '../services/historyApi'

export function useHistory(
  page: number,
  limit: number = 5,
  scenario?: string,
) {
  return useQuery({
    queryKey: [
      'history',
      page,
      limit,
      scenario,
    ],

    queryFn: () =>
      getHistory(
        page,
        limit,
        scenario,
      ),

    placeholderData:
      keepPreviousData,

    staleTime: 30 * 1000,

    gcTime: 5 * 60 * 1000,

    retry: 2,

    refetchOnWindowFocus: true,
  })
}