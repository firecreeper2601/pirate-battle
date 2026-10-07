# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\enemies.spec.ts >> Inimigos - Chaser e Shooter >> Chaser deve causar dano ao jogador ao colidir
- Location: tests\enemies.spec.ts:203:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "chaser"
Received: "projectile"

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
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
      - text: 7.56640399999953s
    - paragraph [ref=e14]:
      - strong [ref=e15]: "Fim da partida:"
      - text: death
    - paragraph [ref=e16]:
      - strong [ref=e17]: "ID da partida:"
      - text: match-1791339061505-8uwkgh
    - paragraph [ref=e18]: Registrando partida...
  - button "Jogar novamente" [ref=e19]
  - button "Voltar ao Menu" [ref=e20]
```

# Test source

```ts
  119 |         ).toBeLessThan(
  120 |           initial.chaserDistance,
  121 |         )
  122 |       },
  123 |     )
  124 | 
  125 |     test(
  126 |       'Shooter deve se aproximar do jogador',
  127 |       async ({ page }) => {
  128 |         const initial =
  129 |           await getCanvasData(page)
  130 | 
  131 |         expect(
  132 |           initial.shooterDistance,
  133 |         ).toBeGreaterThan(300)
  134 | 
  135 |         await page.waitForTimeout(2000)
  136 | 
  137 |         const after =
  138 |           await getCanvasData(page)
  139 | 
  140 |         expect(
  141 |           after.shooterDistance,
  142 |         ).toBeLessThan(
  143 |           initial.shooterDistance,
  144 |         )
  145 |       },
  146 |     )
  147 | 
  148 |     test(
  149 |       'Shooter deve disparar quando entrar no alcance',
  150 |       async ({ page }) => {
  151 |         await expect
  152 |           .poll(
  153 |             async () => {
  154 |               const data =
  155 |                 await getCanvasData(page)
  156 | 
  157 |               return data.enemyShotCount
  158 |             },
  159 |             {
  160 |               timeout: 10000,
  161 |               intervals: [250],
  162 |             },
  163 |           )
  164 |           .toBeGreaterThan(0)
  165 |       },
  166 |     )
  167 | 
  168 |     test(
  169 |       'Shooter deve criar projéteis inimigos',
  170 |       async ({ page }) => {
  171 |         await expect
  172 |           .poll(
  173 |             async () => {
  174 |               const data =
  175 |                 await getCanvasData(page)
  176 | 
  177 |               return data.enemyShotCount
  178 |             },
  179 |             {
  180 |               timeout: 10000,
  181 |               intervals: [250],
  182 |             },
  183 |           )
  184 |           .toBeGreaterThan(0)
  185 | 
  186 |         await expect
  187 |           .poll(
  188 |             async () => {
  189 |               const data =
  190 |                 await getCanvasData(page)
  191 | 
  192 |               return data.enemyProjectileCount
  193 |             },
  194 |             {
  195 |               timeout: 3000,
  196 |               intervals: [50],
  197 |             },
  198 |           )
  199 |           .toBeGreaterThan(0)
  200 |       },
  201 |     )
  202 | 
  203 |     test(
  204 |       'Chaser deve causar dano ao jogador ao colidir',
  205 |       async ({ page }) => {
  206 |         await expect
  207 |           .poll(
  208 |             async () => {
  209 |               const data =
  210 |                 await getCanvasData(page)
  211 | 
  212 |               return data.lastDamageSource
  213 |             },
  214 |             {
  215 |               timeout: 8000,
  216 |               intervals: [100],
  217 |             },
  218 |           )
> 219 |           .toBe('chaser')
      |            ^ Error: expect(received).toBe(expected) // Object.is equality
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
  316 |           .toBeGreaterThan(0)
  317 | 
  318 |         await expect
  319 |           .poll(
```