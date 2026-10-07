import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getRanking } from '../services/rankingApi'

export function useRanking(
  page: number,
  limit: number = 5,
  scenario?: string,
) {
  return useQuery({
    queryKey: ['ranking', page, limit, scenario],

    queryFn: () =>
      getRanking(
        page,
        limit,
        scenario,
      ),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    gcTime: 5 * 60 * 1000,

    retry: 2,

    refetchOnWindowFocus: true,
  })
}