# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\enemies.spec.ts >> Inimigos - Chaser e Shooter >> Shooter deve disparar quando entrar no alcance
- Location: tests\enemies.spec.ts:148:5

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
      - text: 7.599803999999523s
    - paragraph [ref=e14]:
      - strong [ref=e15]: "Fim da partida:"
      - text: death
    - paragraph [ref=e16]:
      - strong [ref=e17]: "ID da partida:"
      - text: match-1791339032088-w93vrb
    - paragraph [ref=e18]: 🟢 Partida registrada com sucesso!
  - button "Jogar novamente" [ref=e19]
  - button "Voltar ao Menu" [ref=e20]
```

# Test source

```ts
  64  | 
  65  | test.describe(
  66  |   'Inimigos - Chaser e Shooter',
  67  |   () => {
  68  |     test.beforeEach(async ({ page }) => {
  69  |       await startGame(page)
  70  |     })
  71  | 
  72  |     test(
  73  |       'partida deve iniciar com dois Chasers e um Shooter',
  74  |       async ({ page }) => {
  75  |         await expect
  76  |           .poll(
  77  |             async () => {
  78  |               const data =
  79  |                 await getCanvasData(page)
  80  | 
  81  |               return {
  82  |                 chaserCount:
  83  |                   data.chaserCount,
  84  |                 shooterCount:
  85  |                   data.shooterCount,
  86  |                 enemyCount:
  87  |                   data.enemyCount,
  88  |               }
  89  |             },
  90  |             {
  91  |               timeout: 3000,
  92  |             },
  93  |           )
  94  |           .toEqual({
  95  |             chaserCount: 2,
  96  |             shooterCount: 1,
  97  |             enemyCount: 3,
  98  |           })
  99  |       },
  100 |     )
  101 | 
  102 |     test(
  103 |       'Chaser deve perseguir o jogador',
  104 |       async ({ page }) => {
  105 |         const initial =
  106 |           await getCanvasData(page)
  107 | 
  108 |         expect(
  109 |           initial.chaserDistance,
  110 |         ).toBeGreaterThan(0)
  111 | 
  112 |         await page.waitForTimeout(1000)
  113 | 
  114 |         const after =
  115 |           await getCanvasData(page)
  116 | 
  117 |         expect(
  118 |           after.chaserDistance,
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
> 164 |           .toBeGreaterThan(0)
      |            ^ Error: expect(received).toBeGreaterThan(expected)
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
```