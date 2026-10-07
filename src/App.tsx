import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import './App.css'
import { createGame, type GameResult } from './game/Game'
import { useRanking } from './hooks/useRanking'
import { useHistory } from './hooks/useHistory'
import { useRegisterMatch } from './hooks/useRegisterMatch'

const MATCH_DURATION_KEY =
  'pirate-battle-match-duration'

const SPAWN_TIME_KEY =
  'pirate-battle-spawn-time'

const MATCH_HISTORY_KEY =
  'pirate-battle-match-history'

const PENDING_MATCHES_KEY =
  'pirate-battle-pending-matches'

const DEFAULT_MATCH_DURATION = 60
const DEFAULT_SPAWN_TIME = 5

const MIN_MATCH_DURATION = 60
const MAX_MATCH_DURATION = 180

const MIN_SPAWN_TIME = 2
const MAX_SPAWN_TIME = 30

const RANKING_ITEMS_PER_PAGE = 5
const HISTORY_ITEMS_PER_PAGE = 5

const TEST_MATCH_DURATION = 1

type PendingMatch = {
  id: string
  score: number
  duration: number
  endReason: string
  createdAt: string
}

function createMatchId() {
  return `match-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function App() {
  const queryClient =
    useQueryClient()

  const [matchDuration, setMatchDuration] =
    useState(() => {
      const stored =
        localStorage.getItem(
          MATCH_DURATION_KEY,
        )

      const value = Number(stored)

      return Number.isFinite(value) &&
        value >= MIN_MATCH_DURATION &&
        value <= MAX_MATCH_DURATION
        ? value
        : DEFAULT_MATCH_DURATION
    })

  const [spawnTime, setSpawnTime] =
    useState(() => {
      const stored =
        localStorage.getItem(
          SPAWN_TIME_KEY,
        )

      const value = Number(stored)

      return Number.isFinite(value) &&
        value >= MIN_SPAWN_TIME &&
        value <= MAX_SPAWN_TIME
        ? value
        : DEFAULT_SPAWN_TIME
    })

  const [showGame, setShowGame] =
    useState(false)

  const [showOptions, setShowOptions] =
    useState(false)

  const [showRanking, setShowRanking] =
    useState(false)

  const [showHistory, setShowHistory] =
    useState(false)

  const [showResult, setShowResult] =
    useState(false)

  const [gameKey, setGameKey] =
    useState(0)

  const [gameResult, setGameResult] =
    useState<GameResult | null>(
      null,
    )

  // Garante que uma partida seja processada apenas uma vez,
  // mesmo que o callback de Game seja acionado novamente.
  const matchHandledRef = useRef(false)

  const [currentMatchId, setCurrentMatchId] =
    useState('')

  const [
    rankingPage,
    setRankingPage,
  ] = useState(1)

  const [
    historyPage,
    setHistoryPage,
  ] = useState(1)

  const [
    retryingPendingMatches,
    setRetryingPendingMatches,
  ] = useState(false)

  const [
    pendingRetryMessage,
    setPendingRetryMessage,
  ] = useState('')

  const searchParams =
    new URLSearchParams(
      window.location.search,
    )

  const testMode =
    searchParams.get(
      'testMode',
    ) === 'true'

  const rankingScenario =
    searchParams.get(
      'scenario',
    ) ?? undefined

  const historyScenario =
    searchParams.get(
      'historyScenario',
    ) ?? undefined

  const matchScenario =
    searchParams.get(
      'matchScenario',
    ) ?? undefined

  const effectiveMatchDuration =
    testMode
      ? TEST_MATCH_DURATION
      : matchDuration

  const rankingQuery =
    useRanking(
      rankingPage,
      RANKING_ITEMS_PER_PAGE,
      rankingScenario,
    )

  const historyQuery =
    useHistory(
      historyPage,
      HISTORY_ITEMS_PER_PAGE,
      historyScenario,
    )

  const registerMatchMutation =
    useRegisterMatch()

  const matchRegistrationPending =
    registerMatchMutation.isPending

  const matchRegistrationSuccess =
    registerMatchMutation.isSuccess

  const matchRegistrationError =
    registerMatchMutation.isError

  function saveMatchHistory(
    result: GameResult,
  ) {
    const item = {
      score: result.score,
      duration:
        result.duration,
      endReason:
        result.endReason,
      date:
        new Date().toISOString(),
    }

    try {
      const stored =
        localStorage.getItem(
          MATCH_HISTORY_KEY,
        )

      const existing =
        stored
          ? JSON.parse(
              stored,
            )
          : []

      const currentHistory =
        Array.isArray(
          existing,
        )
          ? existing
          : []

      const updated = [
        item,
        ...currentHistory,
      ]

      localStorage.setItem(
        MATCH_HISTORY_KEY,
        JSON.stringify(
          updated,
        ),
      )
    } catch {
      // Ignora falhas do localStorage.
    }
  }

  function savePendingMatch(
    result: GameResult,
    matchId: string,
  ) {
    try {
      const stored =
        localStorage.getItem(
          PENDING_MATCHES_KEY,
        )

      const existing: PendingMatch[] =
        stored
          ? JSON.parse(
              stored,
            )
          : []

      const alreadyExists =
        existing.some(
          (item) =>
            item.id ===
            matchId,
        )

      if (
        alreadyExists
      ) {
        return
      }

      const pending: PendingMatch =
        {
          id: matchId,
          score: result.score,
          duration:
            result.duration,
          endReason:
            result.endReason,
          createdAt:
            new Date().toISOString(),
        }

      const updated = [
        ...existing,
        pending,
      ]

      localStorage.setItem(
        PENDING_MATCHES_KEY,
        JSON.stringify(
          updated,
        ),
      )
    } catch {
      // Ignora falhas do localStorage.
    }
  }

  async function retryPendingMatches() {
    if (
      retryingPendingMatches
    ) {
      return
    }

    let pending: PendingMatch[] =
      []

    try {
      const stored =
        localStorage.getItem(
          PENDING_MATCHES_KEY,
        )

      if (!stored) {
        setPendingRetryMessage('')
        return
      }

      const parsed =
        JSON.parse(
          stored,
        )

      if (
        !Array.isArray(
          parsed,
        )
      ) {
        return
      }

      pending =
        parsed
    } catch {
      return
    }

    if (
      pending.length ===
      0
    ) {
      setPendingRetryMessage('')
      return
    }

    setRetryingPendingMatches(
      true,
    )

    setPendingRetryMessage(
      `Tentando registrar ${pending.length} partida(s) pendente(s)...`,
    )

    const remaining: PendingMatch[] =
      []

    for (
      const match of pending
    ) {
      try {
        await registerMatchMutation.mutateAsync(
          {
            match: {
              id: match.id,
              score: match.score,
              duration:
                match.duration,
              endReason:
                match.endReason,
            },
            scenario:
              undefined,
          },
        )
      } catch {
        remaining.push(
          match,
        )
      }
    }

    localStorage.setItem(
      PENDING_MATCHES_KEY,
      JSON.stringify(
        remaining,
      ),
    )

    if (
      remaining.length ===
      0
    ) {
      setPendingRetryMessage(
        'Partidas pendentes registradas com sucesso.',
      )
    } else {
      setPendingRetryMessage(
        `${remaining.length} partida(s) continuam pendentes.`,
      )
    }

    await queryClient.invalidateQueries(
      {
        queryKey: [
          'history',
        ],
      },
    )

    await queryClient.invalidateQueries(
      {
        queryKey: [
          'ranking',
        ],
      },
    )

    setRetryingPendingMatches(
      false,
    )
  }

  useEffect(() => {
    void retryPendingMatches()
  }, [])

  useEffect(() => {
    if (
      !showGame
    ) {
      return
    }

    let cancelled =
      false

    const element =
      document.getElementById(
        'game-container',
      )

    if (!element) {
      return
    }

    const container =
      element as HTMLDivElement

    let gameInstance:
      | Awaited<
          ReturnType<
            typeof createGame
          >
        >
      | undefined

    async function startGameInstance() {
      const instance =
        await createGame(
          container,
          effectiveMatchDuration,
          spawnTime,
          (
            result,
          ) => {
            if (
              cancelled ||
              matchHandledRef.current
            ) {
              return
            }

            matchHandledRef.current = true

            const matchId =
              createMatchId()

            setCurrentMatchId(
              matchId,
            )

            setGameResult(
              result,
            )

            saveMatchHistory(
              result,
            )

            void registerMatchMutation
              .mutateAsync({
                match: {
                  id: matchId,
                  score:
                    result.score,
                  duration:
                    result.duration,
                  endReason:
                    result.endReason,
                },
                scenario:
                  matchScenario,
              })
              .then(
                async () => {
                  await queryClient.invalidateQueries(
                    {
                      queryKey: [
                        'history',
                      ],
                    },
                  )

                  await queryClient.invalidateQueries(
                    {
                      queryKey: [
                        'ranking',
                      ],
                    },
                  )
                },
              )
              .catch(() => {
                savePendingMatch(
                  result,
                  matchId,
                )

                console.warn(
                  'Não foi possível registrar a partida no servidor. A partida foi salva como pendente.',
                )
              })

            /*
             * IMPORTANTE:
             *
             * Não desmontamos o jogo
             * neste momento.
             *
             * O canvas continua montado
             * durante o Game Over para que
             * os testes possam verificar:
             *
             * - gameOver
             * - endReason
             * - playerHealth
             * - score
             */
            setShowResult(
              true,
            )
          },
          
        )

      if (
        cancelled
      ) {
        instance.destroy()
        return
      }

      gameInstance =
        instance
    }

    void startGameInstance()

    return () => {
      cancelled =
        true

      if (
        gameInstance
      ) {
        gameInstance.destroy()

        gameInstance =
          undefined
      }
    }
  }, [
    showGame,
    gameKey,
    effectiveMatchDuration,
    spawnTime,
    matchScenario,
    testMode,
    registerMatchMutation.mutateAsync,
    queryClient,
  ])

  function startGame() {
    setShowOptions(
      false,
    )

    setShowRanking(
      false,
    )

    setShowHistory(
      false,
    )

    setShowResult(
      false,
    )

    setGameResult(
      null,
    )

    setCurrentMatchId(
      '',
    )

    matchHandledRef.current = false

    registerMatchMutation.reset()

    setGameKey(
      (current) =>
        current + 1,
    )

    setShowGame(
      true,
    )
  }

  function goToMenu() {
    setShowGame(
      false,
    )

    setShowOptions(
      false,
    )

    setShowRanking(
      false,
    )

    setShowHistory(
      false,
    )

    setShowResult(
      false,
    )

    setGameResult(
      null,
    )

    setCurrentMatchId(
      '',
    )
  }

  function openOptions() {
    setShowGame(
      false,
    )

    setShowRanking(
      false,
    )

    setShowHistory(
      false,
    )

    setShowResult(
      false,
    )

    setShowOptions(
      true,
    )
  }

  function openRanking() {
    setShowGame(
      false,
    )

    setShowOptions(
      false,
    )

    setShowHistory(
      false,
    )

    setShowResult(
      false,
    )

    setRankingPage(
      1,
    )

    setShowRanking(
      true,
    )
  }

  function openHistory() {
    setShowGame(
      false,
    )

    setShowOptions(
      false,
    )

    setShowRanking(
      false,
    )

    setShowResult(
      false,
    )

    setHistoryPage(
      1,
    )

    setShowHistory(
      true,
    )
  }

  function saveOptions() {
    localStorage.setItem(
      MATCH_DURATION_KEY,
      String(
        matchDuration,
      ),
    )

    localStorage.setItem(
      SPAWN_TIME_KEY,
      String(
        spawnTime,
      ),
    )

    goToMenu()
  }

  function handleMatchDurationChange(
    value: string,
  ) {
    const parsed =
      Number(value)

    if (
      !Number.isFinite(
        parsed,
      )
    ) {
      return
    }

    setMatchDuration(
      Math.min(
        MAX_MATCH_DURATION,
        Math.max(
          MIN_MATCH_DURATION,
          Math.round(
            parsed,
          ),
        ),
      ),
    )
  }

  function handleSpawnTimeChange(
    value: string,
  ) {
    const parsed =
      Number(value)

    if (
      !Number.isFinite(
        parsed,
      )
    ) {
      return
    }

    setSpawnTime(
      Math.min(
        MAX_SPAWN_TIME,
        Math.max(
          MIN_SPAWN_TIME,
          Math.round(
            parsed,
          ),
        ),
      ),
    )
  }

  const rankingItems =
    rankingQuery.data?.items ??
    []

  const rankingTotal =
    rankingQuery.data?.total ??
    0

  const rankingTotalPages =
    Math.max(
      1,
      Math.ceil(
        rankingTotal /
          RANKING_ITEMS_PER_PAGE,
      ),
    )

  const historyItems =
    historyQuery.data?.items ??
    []

  const historyTotal =
    historyQuery.data?.total ??
    0

  const historyTotalPages =
    Math.max(
      1,
      Math.ceil(
        historyTotal /
          HISTORY_ITEMS_PER_PAGE,
      ),
    )

  if (
    showGame
  ) {
    return (
      <div className="game-screen">
        <div
          id="game-container"
          className="game-container"
          key={gameKey}
        />

        {showResult &&
          gameResult && (
            <div
              style={{
                position:
                  'fixed',
                inset: 0,
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                background:
                  'rgba(0, 0, 0, 0.75)',
                zIndex: 1000,
              }}
            >
              <div
                className="menu"
                style={{
                  minWidth:
                    '320px',
                  maxWidth:
                    '500px',
                  textAlign:
                    'center',
                }}
              >
                <h1>
                  {gameResult.endReason ===
                  'death'
                    ? 'FIM DE JOGO'
                    : 'TEMPO ESGOTADO'}
                </h1>

                <div className="result-card">
                  <p>
                    <strong>
                      Pontuação:
                    </strong>{' '}
                    {
                      gameResult.score
                    }
                  </p>

                  <p>
                    <strong>
                      Duração:
                    </strong>{' '}
                    {
                      gameResult.duration
                    }
                    s
                  </p>

                  <p>
                    <strong>
                      Fim da partida:
                    </strong>{' '}
                    {
                      gameResult.endReason
                    }
                  </p>

                  {currentMatchId && (
                    <p>
                      <strong>
                        ID da partida:
                      </strong>{' '}
                      {
                        currentMatchId
                      }
                    </p>
                  )}

                  {matchRegistrationPending && (
                    <p>
                      Registrando
                      partida...
                    </p>
                  )}

                  {matchRegistrationSuccess && (
                    <p>
                      🟢 Partida
                      registrada com
                      sucesso!
                    </p>
                  )}

                  {matchRegistrationError && (
                    <p>
                      🔴 Não foi
                      possível
                      registrar a
                      partida.
                      <br />
                      A partida foi
                      salva como
                      pendente.
                    </p>
                  )}
                </div>

                <button
                  onClick={
                    startGame
                  }
                >
                  Jogar novamente
                </button>

                <button
                  onClick={
                    goToMenu
                  }
                >
                  Voltar ao Menu
                </button>
              </div>
            </div>
          )}
      </div>
    )
  }

  if (
    showOptions
  ) {
    return (
      <div className="menu">
        <h1>
          Opções
        </h1>

        <div className="options-card">
          <label>
            Duração da partida

            <input
              type="number"
              min={
                MIN_MATCH_DURATION
              }
              max={
                MAX_MATCH_DURATION
              }
              value={
                matchDuration
              }
              onChange={(event) =>
                handleMatchDurationChange(
                  event.target.value,
                )
              }
            />
          </label>

          <p>
            Valor mínimo:{' '}
            {
              MIN_MATCH_DURATION
            }s
            <br />
            Valor máximo:{' '}
            {
              MAX_MATCH_DURATION
            }s
          </p>

          <label>
            Tempo entre surgimentos de inimigos

            <input
              type="number"
              min={
                MIN_SPAWN_TIME
              }
              max={
                MAX_SPAWN_TIME
              }
              value={
                spawnTime
              }
              onChange={(event) =>
                handleSpawnTimeChange(
                  event.target.value,
                )
              }
            />
          </label>

          <p>
            Valor mínimo:{' '}
            {
              MIN_SPAWN_TIME
            }s
            <br />
            Valor máximo:{' '}
            {
              MAX_SPAWN_TIME
            }s
          </p>
        </div>

        <button
          onClick={
            saveOptions
          }
        >
          Salvar
        </button>

        <button
          onClick={
            goToMenu
          }
        >
          Voltar
        </button>
      </div>
    )
  }

  if (
    showRanking
  ) {
    return (
      <div className="menu">
        <h1>
          Ranking
        </h1>

        {rankingQuery.isLoading && (
          <p>
            Carregando
            ranking...
          </p>
        )}

        {rankingQuery.isError && (
          <div>
            <p>
              Não foi possível
              carregar o
              ranking.
            </p>

            <button
              onClick={() =>
                void rankingQuery.refetch()
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!rankingQuery.isLoading &&
          !rankingQuery.isError && (
            <>
              {rankingItems.length ===
              0 ? (
                <p>
                  Nenhum jogador
                  encontrado.
                </p>
              ) : (
                <div className="ranking-list">
                  {rankingItems.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        className="ranking-item"
                        key={`${item.name}-${index}`}
                      >
                        <span>
                          #
                          {(
                            (
                              rankingPage -
                              1
                            ) *
                              RANKING_ITEMS_PER_PAGE +
                            index +
                            1
                          )}
                        </span>

                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        <span>
                          {
                            item.score
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="pagination">
                <button
                  disabled={
                    rankingPage <=
                    1
                  }
                  onClick={() =>
                    setRankingPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                  }
                >
                  Anterior
                </button>

                <span>
                  Página{' '}
                  {
                    rankingPage
                  }{' '}
                  de{' '}
                  {
                    rankingTotalPages
                  }
                </span>

                <button
                  disabled={
                    rankingPage >=
                    rankingTotalPages
                  }
                  onClick={() =>
                    setRankingPage(
                      (
                        current,
                      ) =>
                        Math.min(
                          rankingTotalPages,
                          current +
                            1,
                        ),
                    )
                  }
                >
                  Próxima
                </button>
              </div>
            </>
          )}

        <button
          onClick={
            goToMenu
          }
        >
          Voltar
        </button>
      </div>
    )
  }

  if (
    showHistory
  ) {
    return (
      <div className="menu">
        <h1>
          Histórico de
          Partidas
        </h1>

        {historyQuery.isLoading && (
          <p>
            Carregando
            histórico...
          </p>
        )}

        {historyQuery.isError && (
          <div>
            <p>
              Não foi possível
              carregar o
              histórico.
            </p>

            <button
              onClick={() =>
                void historyQuery.refetch()
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!historyQuery.isLoading &&
          !historyQuery.isError && (
            <>
              {historyItems.length ===
              0 ? (
                <p>
                  Nenhuma partida
                  encontrada.
                </p>
              ) : (
                <div className="history-list">
                  {historyItems.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        className="history-item"
                        key={`${item.date}-${index}`}
                      >
                        <p>
                          <strong>
                            Pontos:
                          </strong>{' '}
                          {
                            item.score
                          }
                        </p>

                        <p>
                          <strong>
                            Duração:
                          </strong>{' '}
                          {
                            item.duration
                          }
                          s
                        </p>

                        <p>
                          <strong>
                            Resultado:
                          </strong>{' '}
                          {
                            item.endReason
                          }
                        </p>

                        <p>
                          <strong>
                            Data:
                          </strong>{' '}
                          {
                            item.date
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="pagination">
                <button
                  disabled={
                    historyPage <=
                    1
                  }
                  onClick={() =>
                    setHistoryPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                  }
                >
                  Anterior
                </button>

                <span>
                  Página{' '}
                  {
                    historyPage
                  }{' '}
                  de{' '}
                  {
                    historyTotalPages
                  }
                </span>

                <button
                  disabled={
                    historyPage >=
                    historyTotalPages
                  }
                  onClick={() =>
                    setHistoryPage(
                      (
                        current,
                      ) =>
                        Math.min(
                          historyTotalPages,
                          current +
                            1,
                        ),
                    )
                  }
                >
                  Próxima
                </button>
              </div>
            </>
          )}

        {pendingRetryMessage && (
          <p>
            {
              pendingRetryMessage
            }
          </p>
        )}

        <button
          onClick={() =>
            void retryPendingMatches()
          }
          disabled={
            retryingPendingMatches
          }
        >
          {retryingPendingMatches
            ? 'Tentando...'
            : 'Tentar partidas pendentes'}
        </button>

        <button
          onClick={
            goToMenu
          }
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="menu">
      <h1>
        Pirate Battle
      </h1>

      <button
        onClick={
          startGame
        }
      >
        Jogar
      </button>

      <button
        onClick={
          openOptions
        }
      >
        Opções
      </button>

      <button
        onClick={
          openRanking
        }
      >
        Ranking
      </button>

      <button
        onClick={
          openHistory
        }
      >
        Histórico de
        Partidas
      </button>
    </div>
  )
}

export default App