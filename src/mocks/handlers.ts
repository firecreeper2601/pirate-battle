import {
  http,
  HttpResponse,
  delay,
} from 'msw'

const ranking = [
  {
    id: 1,
    name: 'Capitão Nemo',
    score: 150,
  },
  {
    id: 2,
    name: 'Barba Azul',
    score: 135,
  },
  {
    id: 3,
    name: 'Almirante Vermelho',
    score: 120,
  },
  {
    id: 4,
    name: 'Corsário Azul',
    score: 105,
  },
  {
    id: 5,
    name: 'Capitão Tempestade',
    score: 95,
  },
  {
    id: 6,
    name: 'Pirata do Kraken',
    score: 85,
  },
  {
    id: 7,
    name: 'Capitão Tubarão',
    score: 75,
  },
  {
    id: 8,
    name: 'Corsário Sombrio',
    score: 65,
  },
  {
    id: 9,
    name: 'Pirata Dourado',
    score: 55,
  },
  {
    id: 10,
    name: 'Capitão Marujo',
    score: 45,
  },
]

function addScoreToRanking(score: number) {
  ranking.push({
    id: Date.now(),
    name: 'Você',
    score,
  })

  ranking.sort(
    (a, b) => b.score - a.score,
  )
}

const history = [
  {
    id: 'history-1',
    score: 10,
    duration: 60,
    endReason: 'TEMPO ESGOTADO',
    date: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'history-2',
    score: 8,
    duration: 45,
    endReason: 'VOCÊ PERDEU',
    date: '2026-10-02T12:00:00.000Z',
  },
  {
    id: 'history-3',
    score: 15,
    duration: 90,
    endReason: 'TEMPO ESGOTADO',
    date: '2026-10-03T12:00:00.000Z',
  },
  {
    id: 'history-4',
    score: 5,
    duration: 30,
    endReason: 'VOCÊ PERDEU',
    date: '2026-10-04T12:00:00.000Z',
  },
  {
    id: 'history-5',
    score: 20,
    duration: 120,
    endReason: 'TEMPO ESGOTADO',
    date: '2026-10-05T12:00:00.000Z',
  },
  {
    id: 'history-6',
    score: 12,
    duration: 75,
    endReason: 'VOCÊ PERDEU',
    date: '2026-10-06T12:00:00.000Z',
  },
  {
    id: 'history-7',
    score: 18,
    duration: 110,
    endReason: 'TEMPO ESGOTADO',
    date: '2026-10-07T12:00:00.000Z',
  },
]

export const handlers = [
  http.get(
    '/api/ranking',
    async ({ request }) => {
      const url = new URL(request.url)

      const page = Number(
        url.searchParams.get('page') ?? '1',
      )

      const limit = Number(
        url.searchParams.get('limit') ?? '5',
      )

      const scenario =
        url.searchParams.get('scenario')

      if (scenario === 'empty') {
        return HttpResponse.json({
          items: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
        })
      }

      if (scenario === 'client-error') {
        return HttpResponse.json(
          {
            message:
              'Erro de requisição do cliente.',
          },
          {
            status: 400,
          },
        )
      }

      if (scenario === 'server-error') {
        return new HttpResponse(null, {
          status: 500,
        })
      }

      if (scenario === 'latency') {
        await delay(1000)
      }

      if (scenario === 'out-of-order') {
        if (page === 1) {
          await delay(1500)
        } else {
          await delay(100)
        }
      }

      if (scenario === 'timeout') {
        await delay(5000)
      }

      if (scenario === 'network-error') {
        return HttpResponse.error()
      }

      const start =
        (page - 1) * limit

      const items = ranking.slice(
        start,
        start + limit,
      )

      return HttpResponse.json({
        items,
        page,
        limit,
        total: ranking.length,
        totalPages: Math.ceil(
          ranking.length / limit,
        ),
      })
    },
  ),

  http.post(
    '/api/matches',
    async ({ request }) => {
      const url = new URL(request.url)

      const scenario =
        url.searchParams.get('scenario')

      const body =
        (await request.json()) as {
          id: string
          score: number
          duration: number
          endReason: string
        }

      if (scenario === 'client-error') {
        return HttpResponse.json(
          {
            message:
              'Erro ao registrar a partida.',
          },
          {
            status: 400,
          },
        )
      }

      if (scenario === 'server-error') {
        return new HttpResponse(null, {
          status: 500,
        })
      }

      if (scenario === 'network-error') {
        return HttpResponse.error()
      }

      const existingMatch =
        history.find(
          (item) => item.id === body.id,
        )

      if (existingMatch) {
        return HttpResponse.json(
          {
            success: true,
            id: existingMatch.id,
            match: {
              id: existingMatch.id,
              score: existingMatch.score,
              duration:
                existingMatch.duration,
              endReason:
                existingMatch.endReason,
            },
          },
          {
            status: 200,
          },
        )
      }

      addScoreToRanking(body.score)

      const newHistoryItem = {
        id: body.id,
        score: body.score,
        duration: body.duration,
        endReason: body.endReason,
        date: new Date().toISOString(),
      }

      history.unshift(newHistoryItem)

      return HttpResponse.json(
        {
          success: true,
          id: newHistoryItem.id,
          match: body,
        },
        {
          status: 201,
        },
      )
    },
  ),

  http.get(
    '/api/history',
    async ({ request }) => {
      const url = new URL(request.url)

      const page = Number(
        url.searchParams.get('page') ?? '1',
      )

      const limit = Number(
        url.searchParams.get('limit') ?? '5',
      )

      const scenario =
        url.searchParams.get('scenario')

      if (scenario === 'empty') {
        return HttpResponse.json({
          items: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
        })
      }

      if (scenario === 'client-error') {
        return HttpResponse.json(
          {
            message:
              'Erro ao carregar o histórico.',
          },
          {
            status: 400,
          },
        )
      }

      if (scenario === 'server-error') {
        return new HttpResponse(null, {
          status: 500,
        })
      }

      if (scenario === 'latency') {
        await delay(1000)
      }

      if (scenario === 'out-of-order') {
        if (page === 1) {
          await delay(1500)
        } else {
          await delay(100)
        }
      }

      if (scenario === 'timeout') {
        await delay(5000)
      }

      if (scenario === 'network-error') {
        return HttpResponse.error()
      }

      const start =
        (page - 1) * limit

      const items = history.slice(
        start,
        start + limit,
      )

      return HttpResponse.json({
        items,
        page,
        limit,
        total: history.length,
        totalPages: Math.ceil(
          history.length / limit,
        ),
      })
    },
  ),
]