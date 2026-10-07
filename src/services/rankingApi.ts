import axios from 'axios'

export interface RankingItem {
  id: number
  name: string
  score: number
}

export interface RankingResponse {
  items: RankingItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const api = axios.create({
  baseURL: '/api',
  timeout: 2000,
})

export async function getRanking(
  page: number = 1,
  limit: number = 5,
  scenario?: string,
): Promise<RankingResponse> {
  const response =
    await api.get<RankingResponse>(
      '/ranking',
      {
        params: {
          page,
          limit,
          ...(scenario
            ? { scenario }
            : {}),
        },
      },
    )

  return response.data
}