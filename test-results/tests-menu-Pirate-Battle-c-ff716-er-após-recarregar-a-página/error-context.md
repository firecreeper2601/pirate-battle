# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\menu.spec.ts >> Pirate Battle >> configurações devem permanecer após recarregar a página
- Location: tests\menu.spec.ts:223:3

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('input[type="number"]').first()
Expected: "120"
Received: "60"
Timeout:  5000ms

Call log:
  - Expect "toHaveValue" locator('input[type="number"]').first() with timeout 5000ms
  - waiting for locator('input[type="number"]').first()
    13 × locator resolved to <input min="60" max="180" value="60" type="number"/>
       - unexpected value "60"

```

```yaml
- spinbutton "Duração da partida": "60"
```

# Test source

```ts
  157 |       page.locator(
  158 |         'input[type="number"]',
  159 |       )
  160 | 
  161 |     const spawnInput =
  162 |       inputs.nth(1)
  163 | 
  164 |     await spawnInput.fill('10')
  165 | 
  166 |     await expect(
  167 |       spawnInput,
  168 |     ).toHaveValue('10')
  169 |   })
  170 | 
  171 |   test('tempo mínimo de surgimento deve ser 2 segundos', async ({
  172 |     page,
  173 |   }) => {
  174 |     await page.goto(
  175 |       'http://localhost:5173/?testMode=true',
  176 |     )
  177 | 
  178 |     await page.getByRole('button', {
  179 |       name: 'Opções',
  180 |     }).click()
  181 | 
  182 |     const inputs =
  183 |       page.locator(
  184 |         'input[type="number"]',
  185 |       )
  186 | 
  187 |     const spawnInput =
  188 |       inputs.nth(1)
  189 | 
  190 |     await spawnInput.fill('1')
  191 | 
  192 |     await expect(
  193 |       spawnInput,
  194 |     ).toHaveValue('2')
  195 |   })
  196 | 
  197 |   test('tempo máximo de surgimento deve ser 30 segundos', async ({
  198 |     page,
  199 |   }) => {
  200 |     await page.goto(
  201 |       'http://localhost:5173/?testMode=true',
  202 |     )
  203 | 
  204 |     await page.getByRole('button', {
  205 |       name: 'Opções',
  206 |     }).click()
  207 | 
  208 |     const inputs =
  209 |       page.locator(
  210 |         'input[type="number"]',
  211 |       )
  212 | 
  213 |     const spawnInput =
  214 |       inputs.nth(1)
  215 | 
  216 |     await spawnInput.fill('60')
  217 | 
  218 |     await expect(
  219 |       spawnInput,
  220 |     ).toHaveValue('30')
  221 |   })
  222 | 
  223 |   test('configurações devem permanecer após recarregar a página', async ({
  224 |     page,
  225 |   }) => {
  226 |     await page.goto(
  227 |       'http://localhost:5173/?testMode=true',
  228 |     )
  229 | 
  230 |     await page.getByRole('button', {
  231 |       name: 'Opções',
  232 |     }).click()
  233 | 
  234 |     const inputs =
  235 |       page.locator(
  236 |         'input[type="number"]',
  237 |       )
  238 | 
  239 |     const durationInput =
  240 |       inputs.nth(0)
  241 | 
  242 |     const spawnInput =
  243 |       inputs.nth(1)
  244 | 
  245 |     await durationInput.fill('120')
  246 | 
  247 |     await spawnInput.fill('10')
  248 | 
  249 |     await page.reload()
  250 | 
  251 |     await page.getByRole('button', {
  252 |       name: 'Opções',
  253 |     }).click()
  254 | 
  255 |     await expect(
  256 |       inputs.nth(0),
> 257 |     ).toHaveValue('120')
      |       ^ Error: expect(locator).toHaveValue(expected) failed
  258 | 
  259 |     await expect(
  260 |       inputs.nth(1),
  261 |     ).toHaveValue('10')
  262 |   })
  263 | 
  264 |   test('Ranking deve abrir', async ({
  265 |     page,
  266 |   }) => {
  267 |     await page.goto(
  268 |       'http://localhost:5173/?testMode=true',
  269 |     )
  270 | 
  271 |     await page.getByRole('button', {
  272 |       name: 'Ranking',
  273 |     }).click()
  274 | 
  275 |     await expect(
  276 |       page.getByText('Ranking'),
  277 |     ).toBeVisible()
  278 |   })
  279 | 
  280 |   test('Ranking deve tratar resposta vazia', async ({
  281 |     page,
  282 |   }) => {
  283 |     await page.goto(
  284 |       'http://localhost:5173/?scenario=empty&testMode=true',
  285 |     )
  286 | 
  287 |     await page.getByRole('button', {
  288 |       name: 'Ranking',
  289 |     }).click()
  290 | 
  291 |     await expect(
  292 |       page.getByText(
  293 |         'Nenhum jogador encontrado.',
  294 |       ),
  295 |     ).toBeVisible()
  296 |   })
  297 | 
  298 |   test('Ranking deve tratar erro 400', async ({
  299 |     page,
  300 |   }) => {
  301 |     await page.goto(
  302 |       'http://localhost:5173/?scenario=client-error&testMode=true',
  303 |     )
  304 | 
  305 |     await page.getByRole('button', {
  306 |       name: 'Ranking',
  307 |     }).click()
  308 | 
  309 |     await expect(
  310 |       page.getByText(
  311 |         'Não foi possível carregar o ranking.',
  312 |       ),
  313 |     ).toBeVisible()
  314 |   })
  315 | 
  316 |   test('Histórico deve abrir', async ({
  317 |     page,
  318 |   }) => {
  319 |     await page.goto(
  320 |       'http://localhost:5173/?testMode=true',
  321 |     )
  322 | 
  323 |     await page.getByRole('button', {
  324 |       name: 'Histórico de Partidas',
  325 |     }).click()
  326 | 
  327 |     await expect(
  328 |       page.getByText(
  329 |         'Histórico de Partidas',
  330 |       ),
  331 |     ).toBeVisible()
  332 |   })
  333 | 
  334 |   test('Ranking deve mostrar jogadores', async ({
  335 |     page,
  336 |   }) => {
  337 |     await page.goto(
  338 |       'http://localhost:5173/?testMode=true',
  339 |     )
  340 | 
  341 |     await page.getByRole('button', {
  342 |       name: 'Ranking',
  343 |     }).click()
  344 | 
  345 |     await expect(
  346 |       page.getByText('Capitão Nemo'),
  347 |     ).toBeVisible()
  348 | 
  349 |     await expect(
  350 |       page.getByText('Barba Azul'),
  351 |     ).toBeVisible()
  352 |   })
  353 | 
  354 |   test('Ranking deve permitir paginação', async ({
  355 |     page,
  356 |   }) => {
  357 |     await page.goto(
```