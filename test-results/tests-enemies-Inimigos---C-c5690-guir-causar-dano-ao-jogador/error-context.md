# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\enemies.spec.ts >> Inimigos - Chaser e Shooter >> projétil de Shooter deve conseguir causar dano ao jogador
- Location: tests\enemies.spec.ts:300:5

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e7]:
  - heading "FIM DE JOGO" [level=1] [ref=e8]
  - generic [ref=e9]:
    - paragraph [ref=e10]:
      - strong [ref=e11]: "Pontuação:"
      - text: "0"
    - paragraph [ref=e12]:
      - strong [ref=e13]: "Duração:"
      - text: 7.566367999999578s
    - paragraph [ref=e14]:
      - strong [ref=e15]: "Fim da partida:"
      - text: death
    - paragraph [ref=e16]:
      - strong [ref=e17]: "ID da partida:"
      - text: match-1791339095136-0n20jc
    - paragraph [ref=e18]: 🟢 Partida registrada com sucesso!
  - button "Jogar novamente" [ref=e19]
  - button "Voltar ao Menu" [ref=e20]
```

# Test source

```ts
  216 |               intervals: [100],
  217 |             },
  218 |           )
  219 |           .toBe('chaser')
  220 | 
  221 |         const data =
  222 |           await getCanvasData(page)
  223 | 
  224 |         expect(
  225 |           data.playerHealth,
  226 |         ).toBeLessThan(5)
  227 | 
  228 |         expect(
  229 |           data.playerDamageCount,
  230 |         ).toBeGreaterThan(0)
  231 |       },
  232 |     )
  233 | 
  234 |     test(
  235 |       'Chaser deve ser removido após colidir com o jogador',
  236 |       async ({ page }) => {
  237 |         await expect
  238 |           .poll(
  239 |             async () => {
  240 |               const data =
  241 |                 await getCanvasData(page)
  242 | 
  243 |               return data.lastDamageSource
  244 |             },
  245 |             {
  246 |               timeout: 8000,
  247 |               intervals: [100],
  248 |             },
  249 |           )
  250 |           .toBe('chaser')
  251 | 
  252 |         await expect
  253 |           .poll(
  254 |             async () => {
  255 |               const data =
  256 |                 await getCanvasData(page)
  257 | 
  258 |               return data.chaserCount
  259 |             },
  260 |             {
  261 |               timeout: 2000,
  262 |               intervals: [100],
  263 |             },
  264 |           )
  265 |           .toBe(1)
  266 |       },
  267 |     )
  268 | 
  269 |     test(
  270 |       'colisão do Chaser não deve aumentar a pontuação',
  271 |       async ({ page }) => {
  272 |         await expect
  273 |           .poll(
  274 |             async () => {
  275 |               const data =
  276 |                 await getCanvasData(page)
  277 | 
  278 |               return data.lastDamageSource
  279 |             },
  280 |             {
  281 |               timeout: 8000,
  282 |               intervals: [100],
  283 |             },
  284 |           )
  285 |           .toBe('chaser')
  286 | 
  287 |         const data =
  288 |           await getCanvasData(page)
  289 | 
  290 |         expect(
  291 |           data.score,
  292 |         ).toBe(0)
  293 | 
  294 |         expect(
  295 |           data.lastDestroyedEnemy,
  296 |         ).toBe('')
  297 |       },
  298 |     )
  299 | 
  300 |     test(
  301 |       'projétil de Shooter deve conseguir causar dano ao jogador',
  302 |       async ({ page }) => {
  303 |         await expect
  304 |           .poll(
  305 |             async () => {
  306 |               const data =
  307 |                 await getCanvasData(page)
  308 | 
  309 |               return data.enemyShotCount
  310 |             },
  311 |             {
  312 |               timeout: 10000,
  313 |               intervals: [100],
  314 |             },
  315 |           )
> 316 |           .toBeGreaterThan(0)
      |            ^ Error: expect(received).toBeGreaterThan(expected)
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
  416 |           .toBeGreaterThan(0)
```