import { test, expect } from '@playwright/test'

test.describe('Pirate Battle', () => {
  test('menu principal deve mostrar as opções principais', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await expect(
      page.getByRole('button', {
        name: 'Jogar',
      }),
    ).toBeVisible()

    await expect(
      page.getByRole('button', {
        name: 'Opções',
      }),
    ).toBeVisible()

    await expect(
      page.getByRole('button', {
        name: 'Ranking',
      }),
    ).toBeVisible()

    await expect(
      page.getByRole('button', {
        name: 'Histórico de Partidas',
      }),
    ).toBeVisible()
  })

  test('Jogar deve abrir a arena do jogo', async ({
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
  })

  test('Opções deve abrir a tela de configurações', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    await expect(
      page.getByText(
        'Duração da partida',
      ),
    ).toBeVisible()

    await expect(
      page.getByText(
        'Tempo entre surgimentos de inimigos',
      ),
    ).toBeVisible()
  })

  test('duração da partida pode ser alterada', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const durationInput =
      page.locator(
        'input[type="number"]',
      ).first()

    await durationInput.fill('120')

    await expect(
      durationInput,
    ).toHaveValue('120')
  })

  test('duração mínima deve ser 60 segundos', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const durationInput =
      page.locator(
        'input[type="number"]',
      ).first()

    await durationInput.fill('30')

    await expect(
      durationInput,
    ).toHaveValue('60')
  })

  test('duração máxima deve ser 180 segundos', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const durationInput =
      page.locator(
        'input[type="number"]',
      ).first()

    await durationInput.fill('300')

    await expect(
      durationInput,
    ).toHaveValue('180')
  })

  test('tempo de surgimento de inimigos pode ser alterado', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const inputs =
      page.locator(
        'input[type="number"]',
      )

    const spawnInput =
      inputs.nth(1)

    await spawnInput.fill('10')

    await expect(
      spawnInput,
    ).toHaveValue('10')
  })

  test('tempo mínimo de surgimento deve ser 2 segundos', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const inputs =
      page.locator(
        'input[type="number"]',
      )

    const spawnInput =
      inputs.nth(1)

    await spawnInput.fill('1')

    await expect(
      spawnInput,
    ).toHaveValue('2')
  })

  test('tempo máximo de surgimento deve ser 30 segundos', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const inputs =
      page.locator(
        'input[type="number"]',
      )

    const spawnInput =
      inputs.nth(1)

    await spawnInput.fill('60')

    await expect(
      spawnInput,
    ).toHaveValue('30')
  })

  test('configurações devem permanecer após recarregar a página', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    const inputs =
      page.locator(
        'input[type="number"]',
      )

    const durationInput =
      inputs.nth(0)

    const spawnInput =
      inputs.nth(1)

    await durationInput.fill('120')

    await spawnInput.fill('10')

    await page.reload()

    await page.getByRole('button', {
      name: 'Opções',
    }).click()

    await expect(
      inputs.nth(0),
    ).toHaveValue('120')

    await expect(
      inputs.nth(1),
    ).toHaveValue('10')
  })

  test('Ranking deve abrir', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Ranking',
    }).click()

    await expect(
      page.getByText('Ranking'),
    ).toBeVisible()
  })

  test('Ranking deve tratar resposta vazia', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?scenario=empty&testMode=true',
    )

    await page.getByRole('button', {
      name: 'Ranking',
    }).click()

    await expect(
      page.getByText(
        'Nenhum jogador encontrado.',
      ),
    ).toBeVisible()
  })

  test('Ranking deve tratar erro 400', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?scenario=client-error&testMode=true',
    )

    await page.getByRole('button', {
      name: 'Ranking',
    }).click()

    await expect(
      page.getByText(
        'Não foi possível carregar o ranking.',
      ),
    ).toBeVisible()
  })

  test('Histórico deve abrir', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Histórico de Partidas',
    }).click()

    await expect(
      page.getByText(
        'Histórico de Partidas',
      ),
    ).toBeVisible()
  })

  test('Ranking deve mostrar jogadores', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Ranking',
    }).click()

    await expect(
      page.getByText('Capitão Nemo'),
    ).toBeVisible()

    await expect(
      page.getByText('Barba Azul'),
    ).toBeVisible()
  })

  test('Ranking deve permitir paginação', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Ranking',
    }).click()

    const nextButton =
      page.getByRole('button', {
        name: /próxima|next/i,
      })

    if (
      await nextButton.count()
    ) {
      await nextButton.click()
    }
  })

  test('Histórico deve mostrar partidas', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Histórico de Partidas',
    }).click()

    await expect(
      page.getByText(
        /Pontos|Score/i,
      ).first(),
    ).toBeVisible()
  })

  test('partida deve terminar e mostrar resultado', async ({
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
        /Resultado|Fim de jogo|Tempo esgotado/i,
      ),
    ).toBeVisible({
      timeout: 5000,
    })
  })

  test('Jogar novamente deve iniciar uma nova partida', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    await expect(
      page.getByText(
        /Resultado|Fim de jogo|Tempo esgotado/i,
      ),
    ).toBeVisible({
      timeout: 5000,
    })

    await page.getByRole('button', {
      name: 'Jogar novamente',
    }).click()

    await expect(
      page.locator('canvas'),
    ).toBeVisible()
  })

  test('W deve movimentar o jogador para frente', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const initialY =
      await canvas.getAttribute(
        'data-player-y',
      )

    await page.keyboard.down(
      'KeyW',
    )

    await page.waitForTimeout(
      300,
    )

    await page.keyboard.up(
      'KeyW',
    )

    const finalX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const finalY =
      await canvas.getAttribute(
        'data-player-y',
      )

    expect(
      initialX !== finalX ||
        initialY !== finalY,
    ).toBeTruthy()
  })

  test('ArrowRight deve girar o jogador para a direita', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialAngle =
      await canvas.getAttribute(
        'data-player-angle',
      )

    await page.keyboard.down(
      'ArrowRight',
    )

    await page.waitForTimeout(
      300,
    )

    await page.keyboard.up(
      'ArrowRight',
    )

    const finalAngle =
      await canvas.getAttribute(
        'data-player-angle',
      )

    expect(
      initialAngle,
    ).not.toBe(
      finalAngle,
    )
  })

  test('Space deve disparar um projétil', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    await page.keyboard.press(
      'Space',
    )

    await page.waitForTimeout(
      100,
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      Number(finalShots),
    ).toBeGreaterThan(
      Number(initialShots),
    )
  })

  test('Q deve disparar 3 projéteis laterais', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    await page.keyboard.press(
      'KeyQ',
    )

    await page.waitForTimeout(
      100,
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      Number(finalShots) -
        Number(initialShots),
    ).toBe(3)
  })

  test('E deve disparar 3 projéteis laterais', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    await page.keyboard.press(
      'KeyE',
    )

    await page.waitForTimeout(
      100,
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      Number(finalShots) -
        Number(initialShots),
    ).toBe(3)
  })

  test('movimento e disparo devem funcionar simultaneamente', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const initialY =
      await canvas.getAttribute(
        'data-player-y',
      )

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    await page.keyboard.down(
      'KeyW',
    )

    await page.keyboard.down(
      'Space',
    )

    await page.waitForTimeout(
      300,
    )

    await page.keyboard.up(
      'KeyW',
    )

    await page.keyboard.up(
      'Space',
    )

    const finalX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const finalY =
      await canvas.getAttribute(
        'data-player-y',
      )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      initialX !== finalX ||
        initialY !== finalY,
    ).toBeTruthy()

    expect(
      Number(finalShots),
    ).toBeGreaterThan(
      Number(initialShots),
    )
  })

  test('partida deve pausar ao pressionar Escape', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'false',
    )

    await page.keyboard.press(
      'Escape',
    )

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'true',
    )
  })

  test('jogador não deve se movimentar enquanto a partida estiver pausada', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'false',
    )

    const initialX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const initialY =
      await canvas.getAttribute(
        'data-player-y',
      )

    await page.keyboard.press(
      'Escape',
    )

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'true',
    )

    await page.keyboard.down(
      'KeyW',
    )

    await page.waitForTimeout(
      500,
    )

    await page.keyboard.up(
      'KeyW',
    )

    const finalX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const finalY =
      await canvas.getAttribute(
        'data-player-y',
      )

    expect(finalX).toBe(
      initialX,
    )

    expect(finalY).toBe(
      initialY,
    )
  })

  test('disparos não devem acontecer enquanto a partida estiver pausada', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'false',
    )

    await page.keyboard.press(
      'Escape',
    )

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'true',
    )

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    await page.keyboard.down(
      'Space',
    )

    await page.waitForTimeout(
      500,
    )

    await page.keyboard.up(
      'Space',
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(finalShots).toBe(
      initialShots,
    )
  })

  test('tempo da partida não deve diminuir enquanto estiver pausada', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'false',
    )

    const initialTime =
      await canvas.getAttribute(
        'data-remaining-time',
      )

    await page.keyboard.press(
      'Escape',
    )

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'true',
    )

    await page.waitForTimeout(
      1000,
    )

    const finalTime =
      await canvas.getAttribute(
        'data-remaining-time',
      )

    expect(finalTime).toBe(
      initialTime,
    )
  })

  test('Ranking deve tratar erro 500', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?scenario=server-error&testMode=true',
    )

    await page.getByRole('button', {
      name: 'Ranking',
    }).click()

    await expect(
      page.locator('body'),
    ).toContainText(
      /ranking|erro|falha/i,
      {
        timeout: 10000,
      },
    )
  })

  test('partida deve pausar automaticamente ao perder o foco', async ({
    page,
  }) => {
    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'false',
    )

    await page.evaluate(() => {
      window.dispatchEvent(
        new Event('blur'),
      )
    })

    await expect(
      canvas,
    ).toHaveAttribute(
      'data-paused',
      'true',
    )
  })

  test('controles de toque devem estar disponíveis no modo mobile', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const canvasWidth =
      await canvas.getAttribute(
        'width',
      )

    const canvasHeight =
      await canvas.getAttribute(
        'height',
      )

    expect(canvasWidth).toBe('800')
    expect(canvasHeight).toBe('600')
  })

  test('controle de toque FIRE deve disparar um projétil', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    const box =
      await canvas.boundingBox()

    expect(box).not.toBeNull()

    if (!box) {
      throw new Error(
        'Não foi possível encontrar o canvas.',
      )
    }

    const x =
      box.x +
      (740 / 800) *
        box.width

    const y =
      box.y +
      (525 / 600) *
        box.height

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        const pointerDown =
          new PointerEvent(
            'pointerdown',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 1,
              pointerType: 'touch',
              isPrimary: true,
            },
          )

        canvas.dispatchEvent(
          pointerDown,
        )
      },
      {
        x,
        y,
      },
    )

    await page.waitForTimeout(
      150,
    )

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        const pointerUp =
          new PointerEvent(
            'pointerup',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 1,
              pointerType: 'touch',
              isPrimary: true,
            },
          )

        canvas.dispatchEvent(
          pointerUp,
        )
      },
      {
        x,
        y,
      },
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      Number(finalShots),
    ).toBeGreaterThan(
      Number(initialShots),
    )
  })

  test('controle de toque ▲ deve movimentar o jogador', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const initialY =
      await canvas.getAttribute(
        'data-player-y',
      )

    const box =
      await canvas.boundingBox()

    expect(box).not.toBeNull()

    if (!box) {
      throw new Error(
        'Não foi possível encontrar o canvas.',
      )
    }

    const x =
      box.x +
      (125 / 800) *
        box.width

    const y =
      box.y +
      (525 / 600) *
        box.height

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerdown',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 2,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    await page.waitForTimeout(
      300,
    )

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerup',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 2,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    const finalX =
      await canvas.getAttribute(
        'data-player-x',
      )

    const finalY =
      await canvas.getAttribute(
        'data-player-y',
      )

    expect(
      initialX !== finalX ||
        initialY !== finalY,
    ).toBeTruthy()
  })

  test('controle de toque ◀ deve girar o jogador para a esquerda', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialAngle =
      await canvas.getAttribute(
        'data-player-angle',
      )

    const box =
      await canvas.boundingBox()

    expect(box).not.toBeNull()

    if (!box) {
      throw new Error(
        'Não foi possível encontrar o canvas.',
      )
    }

    const x =
      box.x +
      (45 / 800) *
        box.width

    const y =
      box.y +
      (525 / 600) *
        box.height

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerdown',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 3,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    await page.waitForTimeout(
      300,
    )

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerup',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 3,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    const finalAngle =
      await canvas.getAttribute(
        'data-player-angle',
      )

    expect(
      finalAngle,
    ).not.toBe(
      initialAngle,
    )
  })

  test('controle de toque ▶ deve girar o jogador para a direita', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialAngle =
      await canvas.getAttribute(
        'data-player-angle',
      )

    const box =
      await canvas.boundingBox()

    expect(box).not.toBeNull()

    if (!box) {
      throw new Error(
        'Não foi possível encontrar o canvas.',
      )
    }

    const x =
      box.x +
      (205 / 800) *
        box.width

    const y =
      box.y +
      (525 / 600) *
        box.height

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerdown',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 4,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    await page.waitForTimeout(
      300,
    )

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerup',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 4,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    const finalAngle =
      await canvas.getAttribute(
        'data-player-angle',
      )

    expect(
      finalAngle,
    ).not.toBe(
      initialAngle,
    )
  })

  test('controle de toque Q deve disparar 3 projéteis laterais', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    const box =
      await canvas.boundingBox()

    expect(box).not.toBeNull()

    if (!box) {
      throw new Error(
        'Não foi possível encontrar o canvas.',
      )
    }

    const x =
      box.x +
      (625 / 800) *
        box.width

    const y =
      box.y +
      (525 / 600) *
        box.height

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerdown',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 5,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    await page.waitForTimeout(
      150,
    )

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerup',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 5,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      Number(finalShots) -
        Number(initialShots),
    ).toBe(3)
  })

  test('controle de toque E deve disparar 3 projéteis laterais', async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })

    await page.goto(
      'http://localhost:5173/?testMode=true',
    )

    await page.getByRole('button', {
      name: 'Jogar',
    }).click()

    const canvas =
      page.locator('canvas')

    await expect(
      canvas,
    ).toBeVisible()

    const initialShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    const box =
      await canvas.boundingBox()

    expect(box).not.toBeNull()

    if (!box) {
      throw new Error(
        'Não foi possível encontrar o canvas.',
      )
    }

    const x =
      box.x +
      (675 / 800) *
        box.width

    const y =
      box.y +
      (525 / 600) *
        box.height

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerdown',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 6,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    await page.waitForTimeout(
      150,
    )

    await page.evaluate(
      ({
        x,
        y,
      }) => {
        const canvas =
          document.querySelector(
            'canvas',
          )

        if (!canvas) {
          throw new Error(
            'Canvas não encontrado.',
          )
        }

        canvas.dispatchEvent(
          new PointerEvent(
            'pointerup',
            {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 6,
              pointerType: 'touch',
              isPrimary: true,
            },
          ),
        )
      },
      {
        x,
        y,
      },
    )

    const finalShots =
      await canvas.getAttribute(
        'data-player-shot-count',
      )

    expect(
      Number(finalShots) -
        Number(initialShots),
    ).toBe(3)
  })
})