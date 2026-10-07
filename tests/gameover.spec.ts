import {
  test,
  expect,
  type Page,
} from '@playwright/test'

async function startGame(
  page: Page,
) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'pirate-battle-spawn-time',
      '30',
    )
  })

  await page.goto(
    'http://localhost:5173/',
  )

  await page.getByRole(
    'button',
    {
      name: 'Jogar',
    },
  ).click()

  await expect(
    page.locator('canvas'),
  ).toBeVisible()

  await expect
    .poll(
      async () => {
        return page.locator(
          'canvas',
        ).getAttribute(
          'data-player-health',
        )
      },
      {
        timeout: 5000,
        intervals: [100],
      },
    )
    .toBe('5')
}

async function getCanvasData(
  page: Page,
) {
  return page.locator(
    'canvas',
  ).evaluate(
    (
      canvas: HTMLCanvasElement,
    ) => ({
      playerHealth: Number(
        canvas.dataset
          .playerHealth ?? 0,
      ),

      playerDamageCount:
        Number(
          canvas.dataset
            .playerDamageCount ??
            0,
        ),

      score: Number(
        canvas.dataset.score ?? 0,
      ),

      lastDamageSource:
        canvas.dataset
          .lastDamageSource ?? '',

      gameOver:
        canvas.dataset.gameOver ===
        'true',

      endReason:
        canvas.dataset.endReason ??
        '',

      paused:
        canvas.dataset.paused ===
        'true',

      remainingTime: Number(
        canvas.dataset
          .remainingTime ?? 0,
      ),

      enemyCount: Number(
        canvas.dataset
          .enemyCount ?? 0,
      ),
    }),
  )
}

async function forceDeath(
  page: Page,
) {
  await page.evaluate(() => {
    const testWindow =
      window as Window & {
        __pirateBattleTestDamage?: (
          damage: number,
        ) => void
      }

    if (
      !testWindow
        .__pirateBattleTestDamage
    ) {
      throw new Error(
        'Hook de teste de dano não encontrado.',
      )
    }

    testWindow
      .__pirateBattleTestDamage(5)
  })

  await expect
    .poll(
      async () => {
        const data =
          await getCanvasData(
            page,
          )

        return data.playerHealth
      },
      {
        timeout: 5000,
        intervals: [100],
      },
    )
    .toBe(0)
}

async function forceChaserCollision(
  page: Page,
) {
  await page.evaluate(() => {
    const testWindow =
      window as Window & {
        __pirateBattleTestSpawnChaser?: () =>
          void
      }

    if (
      !testWindow
        .__pirateBattleTestSpawnChaser
    ) {
      throw new Error(
        'Hook de teste do Chaser não encontrado.',
      )
    }

    testWindow
      .__pirateBattleTestSpawnChaser()
  })

  await expect
    .poll(
      async () => {
        const data =
          await getCanvasData(
            page,
          )

        return data.playerDamageCount
      },
      {
        timeout: 5000,
        intervals: [100],
      },
    )
    .toBeGreaterThan(0)
}

test.describe(
  'Game Over e vida do jogador',
  () => {
    test(
      'jogador deve iniciar com 5 de vida',
      async ({ page }) => {
        await startGame(page)

        const data =
          await getCanvasData(page)

        expect(
          data.playerHealth,
        ).toBe(5)
      },
    )

    test(
      'jogador deve perder vida ao receber dano',
      async ({ page }) => {
        await startGame(page)

        await page.evaluate(() => {
          const testWindow =
            window as Window & {
              __pirateBattleTestDamage?: (
                damage: number,
              ) => void
            }

          testWindow
            .__pirateBattleTestDamage?.(
              1,
            )
        })

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(
                  page,
                )

              return data.playerHealth
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBe(4)
      },
    )

    test(
      'dano deve registrar a fonte corretamente',
      async ({ page }) => {
        await startGame(page)

        await page.evaluate(() => {
          const testWindow =
            window as Window & {
              __pirateBattleTestDamage?: (
                damage: number,
              ) => void
            }

          testWindow
            .__pirateBattleTestDamage?.(
              1,
            )
        })

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(
                  page,
                )

              return data.lastDamageSource
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBe('test')
      },
    )

    test(
      'contador de dano deve aumentar',
      async ({ page }) => {
        await startGame(page)

        const before =
          await getCanvasData(page)

        await page.evaluate(() => {
          const testWindow =
            window as Window & {
              __pirateBattleTestDamage?: (
                damage: number,
              ) => void
            }

          testWindow
            .__pirateBattleTestDamage?.(
              1,
            )
        })

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(
                  page,
                )

              return (
                data.playerDamageCount
              )
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBe(
            before.playerDamageCount +
              1,
          )
      },
    )

    test(
      'colisão do Chaser não deve aumentar a pontuação',
      async ({ page }) => {
        await startGame(page)

        const before =
          await getCanvasData(page)

        await forceChaserCollision(
          page,
        )

        const after =
          await getCanvasData(page)

        expect(
          after.score,
        ).toBe(
          before.score,
        )
      },
    )

    test(
      'Chaser deve desaparecer depois de colidir com o jogador',
      async ({ page }) => {
        await startGame(page)

        await page.evaluate(() => {
          const testWindow =
            window as Window & {
              __pirateBattleTestSpawnChaser?: () =>
                void
            }

          if (
            !testWindow
              .__pirateBattleTestSpawnChaser
          ) {
            throw new Error(
              'Hook de teste do Chaser não encontrado.',
            )
          }

          testWindow
            .__pirateBattleTestSpawnChaser()
        })

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(
                  page,
                )

              return data.enemyCount
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBe(0)
      },
    )

    test(
      'jogador deve chegar a 0 de vida após dano suficiente',
      async ({ page }) => {
        await startGame(page)

        await forceDeath(page)

        const data =
          await getCanvasData(page)

        expect(
          data.playerHealth,
        ).toBe(0)
      },
    )

    test(
      'partida deve terminar quando o jogador morrer',
      async ({ page }) => {
        await startGame(page)

        await forceDeath(page)

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(
                  page,
                )

              return data.gameOver
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBe(true)
      },
    )

    test(
      'resultado deve indicar morte do jogador',
      async ({ page }) => {
        await startGame(page)

        await forceDeath(page)

        const data =
          await getCanvasData(page)

        expect(
          data.endReason,
        ).toBe('death')

        await expect(
          page.getByText(
            'FIM DE JOGO',
          ),
        ).toBeVisible()
      },
    )

    test(
      'pontuação deve permanecer 0 ao morrer sem destruir inimigos',
      async ({ page }) => {
        await startGame(page)

        await forceDeath(page)

        const data =
          await getCanvasData(page)

        expect(
          data.score,
        ).toBe(0)
      },
    )

    test(
      'partida deve parar depois do Game Over',
      async ({ page }) => {
        await startGame(page)

        await forceDeath(page)

        const before =
          await getCanvasData(page)

        await page.waitForTimeout(
          1000,
        )

        const after =
          await getCanvasData(page)

        expect(
          after.gameOver,
        ).toBe(true)

        expect(
          after.playerHealth,
        ).toBe(
          before.playerHealth,
        )

        expect(
          after.score,
        ).toBe(
          before.score,
        )

        expect(
          after.remainingTime,
        ).toBe(
          before.remainingTime,
        )
      },
    )

    test(
      'nova partida deve reiniciar com 5 de vida',
      async ({ page }) => {
        await startGame(page)

        await forceDeath(page)

        await expect(
          page.getByText(
            'FIM DE JOGO',
          ),
        ).toBeVisible()

        await page.getByRole(
          'button',
          {
            name: 'Jogar novamente',
          },
        ).click()

        await expect(
          page.locator('canvas'),
        ).toBeVisible()

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(
                  page,
                )

              return data.playerHealth
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBe(5)

        const data =
          await getCanvasData(page)

        expect(
          data.gameOver,
        ).toBe(false)

        expect(
          data.score,
        ).toBe(0)
      },
    )
  },
)