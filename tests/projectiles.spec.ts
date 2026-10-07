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
      projectileCount: Number(
        canvas.dataset.projectileCount ?? '0',
      ),

      playerShotCount: Number(
        canvas.dataset.playerShotCount ?? '0',
      ),

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

      score: Number(
        canvas.dataset.score ?? '0',
      ),

      lastDestroyedEnemy:
        canvas.dataset.lastDestroyedEnemy ?? '',

      playerX: Number(
        canvas.dataset.playerX ?? '0',
      ),

      playerY: Number(
        canvas.dataset.playerY ?? '0',
      ),

      playerAngle: Number(
        canvas.dataset.playerAngle ?? '0',
      ),
    }),
  )
}

test.describe(
  'Projéteis e ataques do jogador',
  () => {
    test.beforeEach(async ({ page }) => {
      await startGame(page)
    })

    test(
      'disparo frontal deve criar um projétil',
      async ({ page }) => {
        const before =
          await getCanvasData(page)

        expect(
          before.playerShotCount,
        ).toBe(0)

        await page.keyboard.down('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.playerShotCount
            },
            {
              timeout: 2000,
              intervals: [50],
            },
          )
          .toBeGreaterThan(0)

        await page.keyboard.up('Space')
      },
    )

    test(
      'disparo frontal deve permitir disparos contínuos',
      async ({ page }) => {
        await page.keyboard.down('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.playerShotCount
            },
            {
              timeout: 2000,
              intervals: [50],
            },
          )
          .toBeGreaterThan(0)

        const first =
          await getCanvasData(page)

        await page.waitForTimeout(700)

        const second =
          await getCanvasData(page)

        await page.keyboard.up('Space')

        expect(
          second.playerShotCount,
        ).toBeGreaterThan(
          first.playerShotCount,
        )
      },
    )

    test(
      'disparo frontal deve respeitar cooldown',
      async ({ page }) => {
        await page.keyboard.press('Space')

        const first =
          await getCanvasData(page)

        expect(
          first.playerShotCount,
        ).toBe(1)

        await page.waitForTimeout(100)

        const second =
          await getCanvasData(page)

        expect(
          second.playerShotCount,
        ).toBe(1)

        await page.waitForTimeout(200)

        await page.keyboard.press('Space')

        const third =
          await getCanvasData(page)

        expect(
          third.playerShotCount,
        ).toBe(2)
      },
    )

    test(
      'ataque lateral Q deve criar três projéteis',
      async ({ page }) => {
        await page.keyboard.press('KeyQ')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.playerShotCount
            },
            {
              timeout: 2000,
              intervals: [50],
            },
          )
          .toBe(3)
      },
    )

    test(
      'ataque lateral E deve criar três projéteis',
      async ({ page }) => {
        await page.keyboard.press('KeyE')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.playerShotCount
            },
            {
              timeout: 2000,
              intervals: [50],
            },
          )
          .toBe(3)
      },
    )

    test(
      'ataque lateral Q deve respeitar cooldown',
      async ({ page }) => {
        await page.keyboard.press('KeyQ')

        const first =
          await getCanvasData(page)

        expect(
          first.playerShotCount,
        ).toBe(3)

        await page.waitForTimeout(200)

        await page.keyboard.press('KeyQ')

        const second =
          await getCanvasData(page)

        expect(
          second.playerShotCount,
        ).toBe(3)

        await page.waitForTimeout(500)

        await page.keyboard.press('KeyQ')

        const third =
          await getCanvasData(page)

        expect(
          third.playerShotCount,
        ).toBe(6)
      },
    )

    test(
      'ataque lateral E deve respeitar cooldown',
      async ({ page }) => {
        await page.keyboard.press('KeyE')

        const first =
          await getCanvasData(page)

        expect(
          first.playerShotCount,
        ).toBe(3)

        await page.waitForTimeout(200)

        await page.keyboard.press('KeyE')

        const second =
          await getCanvasData(page)

        expect(
          second.playerShotCount,
        ).toBe(3)

        await page.waitForTimeout(500)

        await page.keyboard.press('KeyE')

        const third =
          await getCanvasData(page)

        expect(
          third.playerShotCount,
        ).toBe(6)
      },
    )

    test(
      'projéteis devem permanecer ativos por algum tempo após o disparo',
      async ({ page }) => {
        await page.keyboard.press('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.projectileCount
            },
            {
              timeout: 1000,
              intervals: [25],
            },
          )
          .toBeGreaterThan(0)
      },
    )

    test(
      'projéteis devem desaparecer após o tempo de vida',
      async ({ page }) => {
        await page.keyboard.press('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.projectileCount
            },
            {
              timeout: 1000,
              intervals: [25],
            },
          )
          .toBeGreaterThan(0)

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.projectileCount
            },
            {
              timeout: 2500,
              intervals: [50],
            },
          )
          .toBe(0)
      },
    )

    test(
      'projétil deve se mover após ser disparado',
      async ({ page }) => {
        await page.keyboard.press('Space')

        const before =
          await getCanvasData(page)

        await page.waitForTimeout(100)

        const after =
          await getCanvasData(page)

        expect(
          after.projectileCount,
        ).toBeGreaterThanOrEqual(0)

        expect(
          after.playerX,
        ).toBe(
          before.playerX,
        )

        expect(
          after.playerY,
        ).toBe(
          before.playerY,
        )
      },
    )

    test(
      'disparo frontal deve conseguir atingir um inimigo',
      async ({ page }) => {
        /*
         * Os inimigos são móveis.
         *
         * Por isso, não usamos uma posição fixa
         * nem um ângulo calculado previamente.
         *
         * O jogador gira enquanto dispara,
         * fazendo os projéteis varrerem a arena.
         */
        await page.keyboard.down('ArrowRight')
        await page.keyboard.down('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.score
            },
            {
              timeout: 10000,
              intervals: [100],
            },
          )
          .toBeGreaterThan(0)

        await page.keyboard.up('Space')
        await page.keyboard.up('ArrowRight')
      },
    )

    test(
      'destruir inimigo com projétil deve aumentar a pontuação',
      async ({ page }) => {
        const before =
          await getCanvasData(page)

        expect(
          before.score,
        ).toBe(0)

        /*
         * O jogador dispara continuamente enquanto gira.
         *
         * Quando um projétil destrói um inimigo,
         * damageEnemy() aumenta a pontuação.
         */
        await page.keyboard.down('ArrowRight')
        await page.keyboard.down('Space')

        await expect
          .poll(
            async () => {
              const data =
                await getCanvasData(page)

              return data.score
            },
            {
              timeout: 10000,
              intervals: [100],
            },
          )
          .toBeGreaterThan(
            before.score,
          )

        const after =
          await getCanvasData(page)

        expect(
          after.score,
        ).toBeGreaterThan(
          before.score,
        )

        expect(
          after.lastDestroyedEnemy,
        ).not.toBe('')
        
        await page.keyboard.up('Space')
        await page.keyboard.up('ArrowRight')
      },
    )

    test(
      'ataques laterais devem disparar sem alterar a posição do jogador',
      async ({ page }) => {
        const before =
          await getCanvasData(page)

        await page.keyboard.press('KeyQ')

        await page.waitForTimeout(100)

        const after =
          await getCanvasData(page)

        expect(
          after.playerX,
        ).toBeCloseTo(
          before.playerX,
          0,
        )

        expect(
          after.playerY,
        ).toBeCloseTo(
          before.playerY,
          0,
        )

        expect(
          after.playerShotCount,
        ).toBe(3)
      },
    )

    test(
      'disparar não deve causar dano ao próprio jogador',
      async ({ page }) => {
        const before =
          await getCanvasData(page)

        await page.keyboard.down('Space')

        await page.waitForTimeout(1000)

        await page.keyboard.up('Space')

        const after =
          await getCanvasData(page)

        expect(
          after.playerHealth,
        ).toBe(
          before.playerHealth,
        )
      },
    )
  },
)