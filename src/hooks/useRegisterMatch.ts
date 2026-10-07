import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  registerMatch,
  type MatchRegistration,
} from '../services/matchApi'

export function useRegisterMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      match,
      scenario,
    }: {
      match: MatchRegistration
      scenario?: string
    }) =>
      registerMatch(
        match,
        scenario,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['ranking'],
      })

      queryClient.invalidateQueries({
        queryKey: ['history'],
      })
    },
  })
}