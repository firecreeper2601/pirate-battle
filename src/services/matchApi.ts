import axios from 'axios'

export interface MatchRegistration {
  id: string
  score: number
  duration: number
  endReason: string
}

export interface MatchRegistrationResponse {
  success: boolean
  id: string
  match: MatchRegistration
}

const api = axios.create({
  baseURL: '/api',
})

export async function registerMatch(
  match: MatchRegistration,
  scenario?: string,
): Promise<MatchRegistrationResponse> {
  const response =
    await api.post<MatchRegistrationResponse>(
      '/matches',
      match,
      {
        params: scenario
          ? {
              scenario,
            }
          : undefined,
      },
    )

  return response.data
}

export async function retryPendingMatch(
  match: MatchRegistration,
): Promise<MatchRegistrationResponse> {
  return registerMatch(match)
}