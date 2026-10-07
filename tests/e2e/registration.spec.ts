import { test, expect } from '@playwright/test'

test.describe('Registro de partidas', () => {
  test('partida deve ser registrada com sucesso', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    await expect(
      page.locator('canvas'),
    ).toBeVisible()

    await expect(
      page.getByText(
        /Partida registrada com sucesso/i,
      ),
    ).toBeVisible({
      timeout: 10000,
    })
  })

  test('falha no registro deve salvar a partida como pendente', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?matchScenario=server-error&testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    await expect(
      page.locator('canvas'),
    ).toBeVisible()

    await expect(
      page.getByText(
        /partida.*pendente|pendente.*partida/i,
      ),
    ).toBeVisible({
      timeout: 10000,
    })
  })
})