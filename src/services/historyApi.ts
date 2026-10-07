import axios from 'axios'

export interface HistoryItem {
  id: string
  score: number
  duration: number
  endReason: string
  date: string
}

export interface HistoryResponse {
  items: HistoryItem[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const api = axios.create({
  baseURL: '/api',
  timeout: 2000,
})

export async function getHistory(
  page: number = 1,
  limit: number = 5,
  scenario?: string,
): Promise<HistoryResponse> {
  const response =
    await api.get<HistoryResponse>(
      '/history',
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