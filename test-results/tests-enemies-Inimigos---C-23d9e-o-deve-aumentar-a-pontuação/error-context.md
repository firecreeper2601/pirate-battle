# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\enemies.spec.ts >> Inimigos - Chaser e Shooter >> destruir um inimigo deve aumentar a pontuação
- Location: tests\enemies.spec.ts:389:5

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Test source

```ts
  316 |           .toBeGreaterThan(0)
  317 | 
  318 |         await expect
  319 |           .poll(
  320 |             async () => {
  321 |               const data =
  322 |                 await getCanvasData(page)
  323 | 
  324 |               return data.lastDamageSource
  325 |             },
  326 |             {
  327 |               timeout: 10000,
  328 |               intervals: [100],
  329 |             },
  330 |           )
  331 |           .toBe('projectile')
  332 | 
  333 |         const data =
  334 |           await getCanvasData(page)
  335 | 
  336 |         expect(
  337 |           data.playerHealth,
  338 |         ).toBeLessThan(5)
  339 |       },
  340 |     )
  341 | 
  342 |     test(
  343 |       'quantidade de inimigos deve permanecer estável quando o spawn está desativado',
  344 |       async ({ page }) => {
  345 |         const initial =
  346 |           await getCanvasData(page)
  347 | 
  348 |         expect(
  349 |           initial.enemyCount,
  350 |         ).toBe(3)
  351 | 
  352 |         await page.waitForTimeout(3000)
  353 | 
  354 |         const after =
  355 |           await getCanvasData(page)
  356 | 
  357 |         expect(
  358 |           after.enemyCount,
  359 |         ).toBeLessThanOrEqual(3)
  360 |       },
  361 |     )
  362 | 
  363 |     test(
  364 |       'inimigos devem continuar dentro da arena',
  365 |       async ({ page }) => {
  366 |         const canvas =
  367 |           page.locator('canvas')
  368 | 
  369 |         await expect(
  370 |           canvas,
  371 |         ).toHaveAttribute(
  372 |           'data-enemy-count',
  373 |           '3',
  374 |         )
  375 | 
  376 |         const data =
  377 |           await getCanvasData(page)
  378 | 
  379 |         expect(
  380 |           data.chaserDistance,
  381 |         ).toBeGreaterThan(0)
  382 | 
  383 |         expect(
  384 |           data.shooterDistance,
  385 |         ).toBeGreaterThan(0)
  386 |       },
  387 |     )
  388 | 
  389 |     test(
  390 |       'destruir um inimigo deve aumentar a pontuação',
  391 |       async ({ page }) => {
  392 |         // O jogador começa apontando para a direita.
  393 |         // Giramos aproximadamente 180 graus para apontar para a esquerda.
  394 |         await page.keyboard.down('ArrowLeft')
  395 | 
  396 |         await page.waitForTimeout(1120)
  397 | 
  398 |         await page.keyboard.up('ArrowLeft')
  399 | 
  400 |         // Mantemos o disparo para tentar atingir o Shooter.
  401 |         await page.keyboard.down('Space')
  402 | 
  403 |         await expect
  404 |           .poll(
  405 |             async () => {
  406 |               const data =
  407 |                 await getCanvasData(page)
  408 | 
  409 |               return data.score
  410 |             },
  411 |             {
  412 |               timeout: 5000,
  413 |               intervals: [100],
  414 |             },
  415 |           )
> 416 |           .toBeGreaterThan(0)
      |            ^ Error: expect(received).toBeGreaterThan(expected)
  417 | 
  418 |         await page.keyboard.up('Space')
  419 |       },
  420 |     )
  421 |   },
  422 | )
```