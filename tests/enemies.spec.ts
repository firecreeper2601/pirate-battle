import { test, expect } from '@playwright/test'

async function startGame(page: any) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'pirate-battle-spawn-time',
      '30',
    )
  })

  await page.goto('http://localhost:5173/')

  await page.getByRole('button', {
    name: 'Jogar',
  }).click()

  await expect(
    page.locator('canvas'),
  ).toBeVisible()
}

async function getCanvasData(
  page: any,
) {
  return page.locator('canvas').evaluate(
    (canvas: HTMLCanvasElement) => ({
      playerHealth: Number(
        canvas.dataset.playerHealth ?? '0',
      ),
      enemyCount: Number(
        canvas.dataset.enemyCount ?? '0',
      ),
      chaserCount: Number(
        canvas.dataset.chaserCount ?? '0',
      ),
      shooterCount: Number(
        canvas.dataset.shooterCount ?? '0',
      ),
      enemyProjectileCount: Number(
        canvas.dataset.enemyProjectileCount ?? '0',
      ),
      enemyShotCount: Number(
        canvas.dataset.enemyShotCount ?? '0',
      ),
      playerDamageCount: Number(
        canvas.dataset.playerDamageCount ?? '0',
      ),
      score: Number(
        canvas.dataset.score ?? '0',
      ),
      chaserDistance: Number(
        canvas.dataset.chaserDistance ?? '0',
      ),
      shooterDistance: Number(
        canvas.dataset.shooterDistance ?? '0',
      ),
      lastDamageSource:
        canvas.dataset.lastDamageSource ?? '',
      lastDestroyedEnemy:
        canvas.dataset.lastDestroyedEnemy ?? '',
    }),
  )
}

test.describe(
  'Inimigos - Chaser e Shooter',
  () => {
    test.beforeEach(async ({ page }) => {
      await startGame(page)
    })

    test(
      'partida deve iniciar com dois Chasers e um Shooter',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return {
                chaserCount:
                  data.chaserCount,
                shooterCount:
                  data.shooterCount,
                enemyCount:
                  data.enemyCount,
              }
            },
            {
              timeout: 3000,
            },
          )
          .toEqual({
            chaserCount: 2,
            shooterCount: 1,
            enemyCount: 3,
          })
      },
    )

    test(
      'Chaser deve perseguir o jogador',
      async ({ page }) => {
        const initial =
          await getCanvasData(page)

        expect(
          initial.chaserDistance,
        ).toBeGreaterThan(0)

        await page.waitForTimeout(1000)

        const after =
          await getCanvasData(page)

        expect(
          after.chaserDistance,
        ).toBeLessThan(
          initial.chaserDistance,
        )
      },
    )

    test(
      'Shooter deve se aproximar do jogador',
      async ({ page }) => {
        const initial =
          await getCanvasData(page)

        expect(
          initial.shooterDistance,
        ).toBeGreaterThan(300)

        await page.waitForTimeout(2000)

        const after =
          await getCanvasData(page)

        expect(
          after.shooterDistance,
        ).toBeLessThan(
          initial.shooterDistance,
        )
      },
    )

    test(
      'Shooter deve disparar quando entrar no alcance',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.enemyShotCount
            },
            {
              timeout: 10000,
              intervals: [250],
            },
          )
          .toBeGreaterThan(0)
      },
    )

    test(
      'Shooter deve criar projéteis inimigos',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.enemyShotCount
            },
            {
              timeout: 10000,
              intervals: [250],
            },
          )
          .toBeGreaterThan(0)

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.enemyProjectileCount
            },
            {
              timeout: 3000,
              intervals: [50],
            },
          )
          .toBeGreaterThan(0)
      },
    )

    test(
      'Chaser deve causar dano ao jogador ao colidir',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.lastDamageSource
            },
            {
              timeout: 8000,
              intervals: [100],
            },
          )
          .toBe('chaser')

        const data =
          await getCanvasData(page)

        expect(
          data.playerHealth,
        ).toBeLessThan(5)

        expect(
          data.playerDamageCount,
        ).toBeGreaterThan(0)
      },
    )

    test(
      'Chaser deve ser removido após colidir com o jogador',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.lastDamageSource
            },
            {
              timeout: 8000,
              intervals: [100],
            },
          )
          .toBe('chaser')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.chaserCount
            },
            {
              timeout: 2000,
              intervals: [100],
            },
          )
          .toBe(1)
      },
    )

    test(
      'colisão do Chaser não deve aumentar a pontuação',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.lastDamageSource
            },
            {
              timeout: 8000,
              intervals: [100],
            },
          )
          .toBe('chaser')

        const data =
          await getCanvasData(page)

        expect(
          data.score,
        ).toBe(0)

        expect(
          data.lastDestroyedEnemy,
        ).toBe('')
      },
    )

    test(
      'projétil de Shooter deve conseguir causar dano ao jogador',
      async ({ page }) => {
        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.enemyShotCount
            },
            {
              timeout: 10000,
              intervals: [100],
            },
          )
          .toBeGreaterThan(0)

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.lastDamageSource
            },
            {
              timeout: 10000,
              intervals: [100],
            },
          )
          .toBe('projectile')

        const data =
          await getCanvasData(page)

        expect(
          data.playerHealth,
        ).toBeLessThan(5)
      },
    )

    test(
      'quantidade de inimigos deve permanecer estável quando o spawn está desativado',
      async ({ page }) => {
        const initial =
          await getCanvasData(page)

        expect(
          initial.enemyCount,
        ).toBe(3)

        await page.waitForTimeout(3000)

        const after =
          await getCanvasData(page)

        expect(
          after.enemyCount,
        ).toBeLessThanOrEqual(3)
      },
    )

    test(
      'inimigos devem continuar dentro da arena',
      async ({ page }) => {
        const canvas =
          page.locator('canvas')

        await expect(
          canvas,
        ).toHaveAttribute(
          'data-enemy-count',
          '3',
        )

        const data =
          await getCanvasData(page)

        expect(
          data.chaserDistance,
        ).toBeGreaterThan(0)

        expect(
          data.shooterDistance,
        ).toBeGreaterThan(0)
      },
    )

    test(
      'destruir um inimigo deve aumentar a pontuação',
      async ({ page }) => {
        // O jogador começa apontando para a direita.
        // Giramos aproximadamente 180 graus para apontar para a esquerda.
        await page.keyboard.down('ArrowLeft')

        await page.waitForTimeout(1120)

        await page.keyboard.up('ArrowLeft')

        // Mantemos o disparo para tentar atingir o Shooter.
        await page.keyboard.down('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.score
            },
            {
              timeout: 5000,
              intervals: [100],
            },
          )
          .toBeGreaterThan(0)

        await page.keyboard.up('Space')
      },
    )
  },
)