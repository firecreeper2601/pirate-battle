# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\projectiles.spec.ts >> Projéteis e ataques do jogador >> ataque lateral Q deve respeitar cooldown
- Location: tests\projectiles.spec.ts:227:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 3
Received: 6
```

# Test source

```ts
  148 | 
  149 |     test(
  150 |       'disparo frontal deve respeitar cooldown',
  151 |       async ({ page }) => {
  152 |         await page.keyboard.press('Space')
  153 | 
  154 |         const first =
  155 |           await getCanvasData(page)
  156 | 
  157 |         expect(
  158 |           first.playerShotCount,
  159 |         ).toBe(1)
  160 | 
  161 |         await page.waitForTimeout(100)
  162 | 
  163 |         const second =
  164 |           await getCanvasData(page)
  165 | 
  166 |         expect(
  167 |           second.playerShotCount,
  168 |         ).toBe(1)
  169 | 
  170 |         await page.waitForTimeout(200)
  171 | 
  172 |         await page.keyboard.press('Space')
  173 | 
  174 |         const third =
  175 |           await getCanvasData(page)
  176 | 
  177 |         expect(
  178 |           third.playerShotCount,
  179 |         ).toBe(2)
  180 |       },
  181 |     )
  182 | 
  183 |     test(
  184 |       'ataque lateral Q deve criar três projéteis',
  185 |       async ({ page }) => {
  186 |         await page.keyboard.press('KeyQ')
  187 | 
  188 |         await expect
  189 |           .poll(
  190 |             async () => {
  191 |               const data =
  192 |                 await getCanvasData(page)
  193 | 
  194 |               return data.playerShotCount
  195 |             },
  196 |             {
  197 |               timeout: 2000,
  198 |               intervals: [50],
  199 |             },
  200 |           )
  201 |           .toBe(3)
  202 |       },
  203 |     )
  204 | 
  205 |     test(
  206 |       'ataque lateral E deve criar três projéteis',
  207 |       async ({ page }) => {
  208 |         await page.keyboard.press('KeyE')
  209 | 
  210 |         await expect
  211 |           .poll(
  212 |             async () => {
  213 |               const data =
  214 |                 await getCanvasData(page)
  215 | 
  216 |               return data.playerShotCount
  217 |             },
  218 |             {
  219 |               timeout: 2000,
  220 |               intervals: [50],
  221 |             },
  222 |           )
  223 |           .toBe(3)
  224 |       },
  225 |     )
  226 | 
  227 |     test(
  228 |       'ataque lateral Q deve respeitar cooldown',
  229 |       async ({ page }) => {
  230 |         await page.keyboard.press('KeyQ')
  231 | 
  232 |         const first =
  233 |           await getCanvasData(page)
  234 | 
  235 |         expect(
  236 |           first.playerShotCount,
  237 |         ).toBe(3)
  238 | 
  239 |         await page.waitForTimeout(200)
  240 | 
  241 |         await page.keyboard.press('KeyQ')
  242 | 
  243 |         const second =
  244 |           await getCanvasData(page)
  245 | 
  246 |         expect(
  247 |           second.playerShotCount,
> 248 |         ).toBe(3)
      |           ^ Error: expect(received).toBe(expected) // Object.is equality
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
  339 |           .toBeGreaterThan(0)
  340 | 
  341 |         await expect
  342 |           .poll(
  343 |             async () => {
  344 |               const data =
  345 |                 await getCanvasData(page)
  346 | 
  347 |               return data.projectileCount
  348 |             },
```