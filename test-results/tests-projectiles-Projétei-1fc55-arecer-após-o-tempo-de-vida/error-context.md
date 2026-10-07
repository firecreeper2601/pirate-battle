# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\projectiles.spec.ts >> Projéteis e ataques do jogador >> projéteis devem desaparecer após o tempo de vida
- Location: tests\projectiles.spec.ts:321:5

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 1000ms exceeded while waiting on the predicate
```

# Test source

```ts
  239 |         await page.waitForTimeout(200)
  240 | 
  241 |         await page.keyboard.press('KeyQ')
  242 | 
  243 |         const second =
  244 |           await getCanvasData(page)
  245 | 
  246 |         expect(
  247 |           second.playerShotCount,
  248 |         ).toBe(3)
  249 | 
  250 |         await page.waitForTimeout(500)
  251 | 
  252 |         await page.keyboard.press('KeyQ')
  253 | 
  254 |         const third =
  255 |           await getCanvasData(page)
  256 | 
  257 |         expect(
  258 |           third.playerShotCount,
  259 |         ).toBe(6)
  260 |       },
  261 |     )
  262 | 
  263 |     test(
  264 |       'ataque lateral E deve respeitar cooldown',
  265 |       async ({ page }) => {
  266 |         await page.keyboard.press('KeyE')
  267 | 
  268 |         const first =
  269 |           await getCanvasData(page)
  270 | 
  271 |         expect(
  272 |           first.playerShotCount,
  273 |         ).toBe(3)
  274 | 
  275 |         await page.waitForTimeout(200)
  276 | 
  277 |         await page.keyboard.press('KeyE')
  278 | 
  279 |         const second =
  280 |           await getCanvasData(page)
  281 | 
  282 |         expect(
  283 |           second.playerShotCount,
  284 |         ).toBe(3)
  285 | 
  286 |         await page.waitForTimeout(500)
  287 | 
  288 |         await page.keyboard.press('KeyE')
  289 | 
  290 |         const third =
  291 |           await getCanvasData(page)
  292 | 
  293 |         expect(
  294 |           third.playerShotCount,
  295 |         ).toBe(6)
  296 |       },
  297 |     )
  298 | 
  299 |     test(
  300 |       'projéteis devem permanecer ativos por algum tempo após o disparo',
  301 |       async ({ page }) => {
  302 |         await page.keyboard.press('Space')
  303 | 
  304 |         await expect
  305 |           .poll(
  306 |             async () => {
  307 |               const data =
  308 |                 await getCanvasData(page)
  309 | 
  310 |               return data.projectileCount
  311 |             },
  312 |             {
  313 |               timeout: 1000,
  314 |               intervals: [25],
  315 |             },
  316 |           )
  317 |           .toBeGreaterThan(0)
  318 |       },
  319 |     )
  320 | 
  321 |     test(
  322 |       'projéteis devem desaparecer após o tempo de vida',
  323 |       async ({ page }) => {
  324 |         await page.keyboard.press('Space')
  325 | 
  326 |         await expect
  327 |           .poll(
  328 |             async () => {
  329 |               const data =
  330 |                 await getCanvasData(page)
  331 | 
  332 |               return data.projectileCount
  333 |             },
  334 |             {
  335 |               timeout: 1000,
  336 |               intervals: [25],
  337 |             },
  338 |           )
> 339 |           .toBeGreaterThan(0)
      |            ^ Error: expect(received).toBeGreaterThan(expected)
  340 | 
  341 |         await expect
  342 |           .poll(
  343 |             async () => {
  344 |               const data =
  345 |                 await getCanvasData(page)
  346 | 
  347 |               return data.projectileCount
  348 |             },
  349 |             {
  350 |               timeout: 2500,
  351 |               intervals: [50],
  352 |             },
  353 |           )
  354 |           .toBe(0)
  355 |       },
  356 |     )
  357 | 
  358 |     test(
  359 |       'projétil deve se mover após ser disparado',
  360 |       async ({ page }) => {
  361 |         await page.keyboard.press('Space')
  362 | 
  363 |         const before =
  364 |           await getCanvasData(page)
  365 | 
  366 |         await page.waitForTimeout(100)
  367 | 
  368 |         const after =
  369 |           await getCanvasData(page)
  370 | 
  371 |         expect(
  372 |           after.projectileCount,
  373 |         ).toBeGreaterThanOrEqual(0)
  374 | 
  375 |         expect(
  376 |           after.playerX,
  377 |         ).toBe(
  378 |           before.playerX,
  379 |         )
  380 | 
  381 |         expect(
  382 |           after.playerY,
  383 |         ).toBe(
  384 |           before.playerY,
  385 |         )
  386 |       },
  387 |     )
  388 | 
  389 |     test(
  390 |       'disparo frontal deve conseguir atingir um inimigo',
  391 |       async ({ page }) => {
  392 |         /*
  393 |          * Os inimigos são móveis.
  394 |          *
  395 |          * Por isso, não usamos uma posição fixa
  396 |          * nem um ângulo calculado previamente.
  397 |          *
  398 |          * O jogador gira enquanto dispara,
  399 |          * fazendo os projéteis varrerem a arena.
  400 |          */
  401 |         await page.keyboard.down('ArrowRight')
  402 |         await page.keyboard.down('Space')
  403 | 
  404 |         await expect
  405 |           .poll(
  406 |             async () => {
  407 |               const data =
  408 |                 await getCanvasData(page)
  409 | 
  410 |               return data.score
  411 |             },
  412 |             {
  413 |               timeout: 10000,
  414 |               intervals: [100],
  415 |             },
  416 |           )
  417 |           .toBeGreaterThan(0)
  418 | 
  419 |         await page.keyboard.up('Space')
  420 |         await page.keyboard.up('ArrowRight')
  421 |       },
  422 |     )
  423 | 
  424 |     test(
  425 |       'destruir inimigo com projétil deve aumentar a pontuação',
  426 |       async ({ page }) => {
  427 |         const before =
  428 |           await getCanvasData(page)
  429 | 
  430 |         expect(
  431 |           before.score,
  432 |         ).toBe(0)
  433 | 
  434 |         /*
  435 |          * O jogador dispara continuamente enquanto gira.
  436 |          *
  437 |          * Quando um projétil destrói um inimigo,
  438 |          * damageEnemy() aumenta a pontuação.
  439 |          */
```