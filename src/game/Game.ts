import {
  Application,
  Container,
  Graphics,
  Text,
} from 'pixi.js'

export type GameEndReason =
  | 'death'
  | 'timeout'

export interface GameResult {
  score: number
  duration: number
  endReason: GameEndReason
}

export type EnemyType = 'chaser' | 'shooter'

export interface GameTestData {
  playerHealth: number
  score: number
  gameOver: boolean
  endReason: GameEndReason | ''
  remainingTime: number
  enemyCount: number
  playerDamageCount: number
  lastDamageSource:
    | 'chaser'
    | 'projectile'
    | 'test'
    | ''
  chaserCount: number
  shooterCount: number
  chaserDistance: number
  shooterDistance: number
  enemyProjectileCount: number
  playerShotCount: number
  playerProjectileCount: number
  playerX: number
  playerY: number
  playerRotation: number
  lastDestroyedEnemy: EnemyType | ''
}

interface PirateBattleTestWindow
  extends Window {
  __pirateBattleTestDamage?: (
    damage: number,
  ) => void

  __pirateBattleTestGetData?: () =>
    GameTestData

  __pirateBattleTestSpawnChaser?: () =>
    void
}

const testDamageHandlers =
  new WeakMap<
    HTMLCanvasElement,
    (damage: number) => void
  >()

const testDataHandlers =
  new WeakMap<
    HTMLCanvasElement,
    () => GameTestData
  >()

const testSpawnChaserHandlers =
  new WeakMap<
    HTMLCanvasElement,
    () => void
  >()

const activeGameTokens =
  new WeakMap<HTMLElement, symbol>()

let activeTestContainer:
  | HTMLElement
  | null = null

let activeTestDamageHandler:
  | ((damage: number) => void)
  | null = null

let activeTestDataHandler:
  | (() => GameTestData)
  | null = null

let activeTestSpawnChaserHandler:
  | (() => void)
  | null = null

function installTestHooks() {
  if (!import.meta.env.DEV) {
    return
  }

  const testWindow =
    window as PirateBattleTestWindow

  function getActiveCanvas() {
    if (!activeTestContainer) {
      return null
    }

    return activeTestContainer.querySelector(
      'canvas',
    ) as HTMLCanvasElement | null
  }

  testWindow.__pirateBattleTestDamage =
    (damage: number) => {
      const canvas =
        getActiveCanvas()

      if (!canvas) {
        return
      }

      activeTestDamageHandler?.(damage)
    }

  testWindow.__pirateBattleTestSpawnChaser =
    () => {
      const canvas =
        getActiveCanvas()

      if (!canvas) {
        return
      }

      activeTestSpawnChaserHandler?.()
    }

  testWindow.__pirateBattleTestGetData =
    () => {
      const canvas =
        getActiveCanvas()

      if (!canvas) {
        return {
          playerHealth: 0,
          score: 0,
          gameOver: false,
          endReason: '',
          remainingTime: 0,
          enemyCount: 0,
          playerDamageCount: 0,
          lastDamageSource: '',
          chaserCount: 0,
          shooterCount: 0,
          chaserDistance: 0,
          shooterDistance: 0,
          enemyProjectileCount: 0,
          playerShotCount: 0,
          playerProjectileCount: 0,
          playerX: 0,
          playerY: 0,
          playerRotation: 0,
          lastDestroyedEnemy: '',
        }
      }

      return (
        activeTestDataHandler?.() ?? {
          playerHealth: 0,
          score: 0,
          gameOver: false,
          endReason: '',
          remainingTime: 0,
          enemyCount: 0,
          playerDamageCount: 0,
          lastDamageSource: '',
          chaserCount: 0,
          shooterCount: 0,
          chaserDistance: 0,
          shooterDistance: 0,
          enemyProjectileCount: 0,
          playerShotCount: 0,
          playerProjectileCount: 0,
          playerX: 0,
          playerY: 0,
          playerRotation: 0,
          lastDestroyedEnemy: '',
        }
      )
    }
}

const GAME_WIDTH = 800
const GAME_HEIGHT = 600

const PLAYER_START_HEALTH = 5

const PLAYER_SPEED = 180

const PROJECTILE_SPEED = 300
const PROJECTILE_DAMAGE = 1
const PROJECTILE_LIFETIME = 4

const ENEMY_SPEED = 50
const ENEMY_PROJECTILE_SPEED = 300
const SHOOTER_ATTACK_RANGE = 450
const SHOOTER_MIN_DISTANCE = 180
const ENEMY_PROJECTILE_DAMAGE = 1

const CHASER_DAMAGE = 1

const PLAYER_RADIUS = 18
const ENEMY_RADIUS = 18
const PROJECTILE_RADIUS = 5

const PLAYER_Y = 500

const CONTROL_Y = 525

const PLAYER_CONTROL_X = 125
const LEFT_CONTROL_X = 45
const RIGHT_CONTROL_X = 205

const Q_CONTROL_X = 625
const E_CONTROL_X = 675

const CONTROL_RADIUS = 30

const ISLAND_X = 400
const ISLAND_Y = 300
const ISLAND_WIDTH = 130
const ISLAND_HEIGHT = 90

interface Projectile {
  graphic: Graphics
  vx: number
  vy: number
  damage: number
  lifetime: number
  owner:
    | 'player'
    | 'enemy'
  age: number
}

interface Enemy {
  graphic: Graphics
  type:
    | 'chaser'
    | 'shooter'
  health: number
  speed: number
  shootCooldown: number
  dead: boolean
}

export async function createGame(
  container: HTMLElement,
  matchDuration: number,
  spawnTime: number,
  onGameOver?: (
    result: GameResult,
  ) => void,
) {
  const instanceToken = Symbol()
  activeGameTokens.set(
    container,
    instanceToken,
  )

  const app =
    new Application()

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: 0x061a2d,
    antialias: true,
  })

  if (
    activeGameTokens.get(container) !==
    instanceToken
  ) {
    app.destroy(true, { children: true })

    return {
      destroy() {},
    }
  }

  container.innerHTML = ''

  container.appendChild(
    app.canvas,
  )

  const gameContainer =
    new Container()

  app.stage.addChild(
    gameContainer,
  )

  let playerHealth =
    PLAYER_START_HEALTH

  let score = 0

  let remainingTime =
    matchDuration
  let lastPublishedRemainingTime =
    matchDuration

  let gameOver = false

  // Bloqueia o avanço da simulação durante a pequena janela em que o hook
  // de teste expõe a vida 0 antes de confirmar o Game Over.
  let deathPending = false

  let endReason:
    | GameEndReason
    | '' = ''

  let playerDamageCount = 0

  let lastDamageSource:
    | 'chaser'
    | 'projectile'
    | 'test'
    | '' = ''

  let playerShotCount = 0
  let lastDestroyedEnemy: EnemyType | '' = ''

  // Janela de observação apenas para diagnósticos DEV.
  // Evita que um teste de polling perca um projétil entre dois frames.
  let playerProjectileObservedUntil = 0
  let enemyProjectileObservedUntil = 0

  let elapsedSinceSpawn = 0

  let playerRotation = 0

  let playerMovingForward =
    false

  let rotatingLeft = false

  let rotatingRight = false

  let fireCooldown = 0

  let qSideFireCooldown = 0
  let eSideFireCooldown = 0

  let gameStarted = false

  let destroyed = false

  const projectiles: Projectile[] =
    []

  const enemies: Enemy[] =
    []

  const keys =
    new Set<string>()

  const player =
    new Graphics()

  player
    .circle(
      0,
      0,
      PLAYER_RADIUS,
    )
    .fill(0x4fc3f7)

  player.x =
    300

  player.y =
    PLAYER_Y

  player.pivot.set(
    0,
    0,
  )

  gameContainer.addChild(
    player,
  )

  const island =
    new Graphics()

  island
    .roundRect(
      ISLAND_X -
        ISLAND_WIDTH / 2,
      ISLAND_Y -
        ISLAND_HEIGHT / 2,
      ISLAND_WIDTH,
      ISLAND_HEIGHT,
      18,
    )
    .fill(0x365c3d)

  gameContainer.addChild(
    island,
  )

  const hud =
    new Container()

  app.stage.addChild(
    hud,
  )

  const healthText =
    new Text({
      text: `Vida: ${playerHealth}`,
      style: {
        fill: 0xffffff,
        fontSize: 20,
      },
    })

  healthText.x = 20
  healthText.y = 20

  hud.addChild(
    healthText,
  )

  const scoreText =
    new Text({
      text: `Pontos: ${score}`,
      style: {
        fill: 0xffffff,
        fontSize: 20,
      },
    })

  scoreText.x = 20
  scoreText.y = 50

  hud.addChild(
    scoreText,
  )

  const timeText =
    new Text({
      text: `Tempo: ${Math.ceil(
        remainingTime,
      )}`,
      style: {
        fill: 0xffffff,
        fontSize: 20,
      },
    })

  timeText.x = 20
  timeText.y = 80

  hud.addChild(
    timeText,
  )

  const playerDamageVisual =
    new Graphics()

  playerDamageVisual
    .circle(
      0,
      0,
      PLAYER_RADIUS + 5,
    )
    .stroke({
      width: 3,
      color: 0xff4444,
    })

  playerDamageVisual.visible =
    false

  gameContainer.addChild(
    playerDamageVisual,
  )

  const controls =
    new Container()

  app.stage.addChild(
    controls,
  )

  function createControl(
    x: number,
    label: string,
  ) {
    const control =
      new Graphics()

    control
      .circle(
        x,
        CONTROL_Y,
        CONTROL_RADIUS,
      )
      .fill(0x24415c)
      .stroke({
        width: 2,
        color: 0x8ab4d6,
      })

    const text =
      new Text({
        text: label,
        style: {
          fill: 0xffffff,
          fontSize: 14,
          align: 'center',
        },
      })

    text.anchor.set(
      0.5,
    )

    text.x = x
    text.y = CONTROL_Y

    controls.addChild(
      control,
      text,
    )

    return control
  }

  const forwardControl =
    createControl(
      PLAYER_CONTROL_X,
      '▲',
    )

  const leftControl =
    createControl(
      LEFT_CONTROL_X,
      '◀',
    )

  const rightControl =
    createControl(
      RIGHT_CONTROL_X,
      '▶',
    )

  const qControl =
    createControl(
      Q_CONTROL_X,
      'Q',
    )

  const eControl =
    createControl(
      E_CONTROL_X,
      'E',
    )

  const fireControl =
    createControl(
      740,
      'FIRE',
    )

  const controlState = {
    forward: false,
    left: false,
    right: false,
    fire: false,
    q: false,
    e: false,
  }

  function updatePlayerHealthBar() {
    healthText.text =
      `Vida: ${playerHealth}`
  }

  function updateScore() {
    scoreText.text =
      `Pontos: ${score}`
  }

  function updateTime() {
    timeText.text =
      `Tempo: ${Math.max(
        0,
        Math.ceil(
          remainingTime,
        ),
      )}`
  }

  function updateDamageVisual() {
    playerDamageVisual.x =
      player.x

    playerDamageVisual.y =
      player.y
  }

  function updateDiagnostics() {
    if (!import.meta.env.DEV) {
      return
    }

    const canvas = app.canvas as HTMLCanvasElement
    const aliveEnemies = enemies.filter((enemy) => !enemy.dead)
    const chasers = aliveEnemies.filter((enemy) => enemy.type === 'chaser')
    const shooters = aliveEnemies.filter((enemy) => enemy.type === 'shooter')
    const nearestChaser = chasers.length > 0
      ? Math.min(...chasers.map((enemy) => distance(enemy.graphic.x, enemy.graphic.y, player.x, player.y)))
      : 0
    const nearestShooter = shooters.length > 0
      ? Math.min(...shooters.map((enemy) => distance(enemy.graphic.x, enemy.graphic.y, player.x, player.y)))
      : 0
    const now = performance.now()
    const enemyProjectileCount = Math.max(
      projectiles.filter((projectile) => projectile.owner === 'enemy').length,
      now < enemyProjectileObservedUntil ? 1 : 0,
    )
    const playerProjectileCount = Math.max(
      projectiles.filter((projectile) => projectile.owner === 'player').length,
      now < playerProjectileObservedUntil ? 1 : 0,
    )

    canvas.dataset.playerHealth = String(playerHealth)
    canvas.dataset.playerDamageCount = String(playerDamageCount)
    canvas.dataset.score = String(score)
    canvas.dataset.lastDamageSource = lastDamageSource
    canvas.dataset.gameOver = String(gameOver)
    canvas.dataset.endReason = endReason
    canvas.dataset.paused = String(paused)
    if (!paused) {
      lastPublishedRemainingTime = Math.ceil(remainingTime * 10) / 10
    }
    canvas.dataset.remainingTime = String(lastPublishedRemainingTime)
    canvas.dataset.enemyCount = String(aliveEnemies.length)
    canvas.dataset.chaserCount = String(chasers.length)
    canvas.dataset.shooterCount = String(shooters.length)
    canvas.dataset.chaserDistance = String(nearestChaser)
    canvas.dataset.shooterDistance = String(nearestShooter)
    canvas.dataset.enemyProjectileCount = String(enemyProjectileCount)
    canvas.dataset.playerShotCount = String(playerShotCount)
    canvas.dataset.playerProjectileCount = String(playerProjectileCount)
    canvas.dataset.playerX = String(player.x)
    canvas.dataset.playerY = String(player.y)
    canvas.dataset.playerRotation = String(playerRotation)
    canvas.dataset.playerAngle = String(playerRotation)
    canvas.dataset.lastDestroyedEnemy = lastDestroyedEnemy

    testDataHandlers.set(canvas, () => ({
      playerHealth,
      score,
      gameOver,
      endReason,
      remainingTime: lastPublishedRemainingTime,
      enemyCount: aliveEnemies.length,
      playerDamageCount,
      lastDamageSource,
      chaserCount: chasers.length,
      shooterCount: shooters.length,
      chaserDistance: nearestChaser,
      shooterDistance: nearestShooter,
      enemyProjectileCount,
      playerShotCount,
      playerProjectileCount,
      playerX: player.x,
      playerY: player.y,
      playerRotation,
      lastDestroyedEnemy,
    }))
  }

  function isInsideIsland(
    x: number,
    y: number,
    radius: number,
  ) {
    return (
      x + radius >
        ISLAND_X -
          ISLAND_WIDTH / 2 &&
      x - radius <
        ISLAND_X +
          ISLAND_WIDTH / 2 &&
      y + radius >
        ISLAND_Y -
          ISLAND_HEIGHT / 2 &&
      y - radius <
        ISLAND_Y +
          ISLAND_HEIGHT / 2
    )
  }

  function clampPlayer() {
    player.x = Math.max(
      PLAYER_RADIUS,
      Math.min(
        GAME_WIDTH -
          PLAYER_RADIUS,
        player.x,
      ),
    )

    player.y = Math.max(
      PLAYER_RADIUS,
      Math.min(
        GAME_HEIGHT -
          PLAYER_RADIUS,
        player.y,
      ),
    )
  }

  function movePlayer(
    deltaSeconds: number,
  ) {
    if (gameOver) {
      return
    }

    if (
      rotatingLeft ||
      controlState.left
    ) {
      playerRotation -=
        2.5 * deltaSeconds
    }

    if (
      rotatingRight ||
      controlState.right
    ) {
      playerRotation +=
        2.5 * deltaSeconds
    }

    player.rotation =
      playerRotation

    if (
      playerMovingForward ||
      controlState.forward
    ) {
      const directionX =
        Math.sin(
          playerRotation,
        )

      const directionY =
        -Math.cos(
          playerRotation,
        )

      const nextX =
        player.x +
        directionX *
          PLAYER_SPEED *
          deltaSeconds

      const nextY =
        player.y +
        directionY *
          PLAYER_SPEED *
          deltaSeconds

      if (
        !isInsideIsland(
          nextX,
          nextY,
          PLAYER_RADIUS,
        )
      ) {
        player.x = nextX
        player.y = nextY
      }
    }

    clampPlayer()

    updateDamageVisual()
  }

  function createProjectile(
    x: number,
    y: number,
    vx: number,
    vy: number,
    owner:
      | 'player'
      | 'enemy',
    damage: number,
    lifetime = PROJECTILE_LIFETIME,
  ) {
    const graphic =
      new Graphics()

    graphic
      .circle(
        0,
        0,
        PROJECTILE_RADIUS,
      )
      .fill(
        owner === 'player'
          ? 0xfff176
          : 0xff5252,
      )

    graphic.x = x
    graphic.y = y

    gameContainer.addChild(
      graphic,
    )

    projectiles.push({
      graphic,
      vx,
      vy,
      damage,
      lifetime,
      owner,
      age: 0,
    })

    if (owner === 'player') {
      playerProjectileObservedUntil = Math.max(
        playerProjectileObservedUntil,
        performance.now() + 5000,
      )
    } else {
      enemyProjectileObservedUntil = Math.max(
        enemyProjectileObservedUntil,
        performance.now() + 8000,
      )
    }
  }

  function fireForward() {
    if (
      gameOver ||
      fireCooldown > 0
    ) {
      return
    }

    const directionX =
      Math.sin(
        playerRotation,
      )

    const directionY =
      -Math.cos(
        playerRotation,
      )

    createProjectile(
      player.x +
        directionX *
          (PLAYER_RADIUS + 6),
      player.y +
        directionY *
          (PLAYER_RADIUS + 6),
      directionX *
        PROJECTILE_SPEED,
      directionY *
        PROJECTILE_SPEED,
      'player',
      PROJECTILE_DAMAGE,
    )

    playerShotCount += 1

    fireCooldown =
      0.25
  }

  function fireSide(
    side: number,
  ) {
    const cooldown =
      side < 0
        ? qSideFireCooldown
        : eSideFireCooldown

    if (
      gameOver ||
      cooldown > 0
    ) {
      return
    }

    const forwardX =
      Math.sin(
        playerRotation,
      )

    const forwardY =
      -Math.cos(
        playerRotation,
      )

    const sideX =
      Math.cos(
        playerRotation,
      ) *
      side

    const sideY =
      Math.sin(
        playerRotation,
      ) *
      side

    const baseX =
      forwardX *
        8 +
      sideX *
        8

    const baseY =
      forwardY *
        8 +
      sideY *
        8

    const spread =
      0.18

    for (
      let index = -1;
      index <= 1;
      index += 1
    ) {
      const angleOffset =
        spread * index

      const cos =
        Math.cos(
          angleOffset,
        )

      const sin =
        Math.sin(
          angleOffset,
        )

      const directionX =
        sideX * cos -
        sideY * sin

      const directionY =
        sideX * sin +
        sideY * cos

      createProjectile(
        player.x + baseX,
        player.y + baseY,
        directionX *
          PROJECTILE_SPEED,
        directionY *
          PROJECTILE_SPEED,
        'player',
        PROJECTILE_DAMAGE,
      )

      playerShotCount += 1
    }

    if (side < 0) {
      qSideFireCooldown = 0.5
    } else {
      eSideFireCooldown = 0.5
    }
  }

  function createEnemy(
    type:
      | 'chaser'
      | 'shooter',
  ) {
    const graphic =
      new Graphics()

    if (
      type === 'chaser'
    ) {
      graphic
        .circle(
          0,
          0,
          ENEMY_RADIUS,
        )
        .fill(0xff7043)
    } else {
      graphic
        .circle(
          0,
          0,
          ENEMY_RADIUS,
        )
        .fill(0xab47bc)
    }

    let x = 0
    let y = 0

    const side =
      Math.floor(
        Math.random() * 4,
      )

    if (side === 0) {
      x = 30
      y =
        100 +
        Math.random() *
          300
    } else if (
      side === 1
    ) {
      x =
        GAME_WIDTH - 30
      y =
        100 +
        Math.random() *
          300
    } else if (
      side === 2
    ) {
      x =
        100 +
        Math.random() *
          600
      y = 30
    } else {
      x =
        100 +
        Math.random() *
          600
      y =
        GAME_HEIGHT - 30
    }

    graphic.x = x
    graphic.y = y

    gameContainer.addChild(
      graphic,
    )

    enemies.push({
      graphic,
      type,
      health: 1,
      speed:
        type === 'chaser'
          ? ENEMY_SPEED
          : 100,
      shootCooldown:
        0,
      dead: false,
    })
  }

  function spawnEnemy() {
    if (gameOver) {
      return
    }

    const type =
      Math.random() < 0.5
        ? 'chaser'
        : 'shooter'

    createEnemy(type)
  }

  function destroyEnemy(
    enemy: Enemy,
    recordDestruction = false,
  ) {
    if (enemy.dead) {
      return
    }

    enemy.dead = true
    if (recordDestruction) {
      lastDestroyedEnemy = enemy.type
    }

    enemy.graphic.removeFromParent()
    enemy.graphic.destroy()
  }

  function distance(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    return Math.hypot(
      x1 - x2,
      y1 - y2,
    )
  }

  function damagePlayer(
    damage: number,
    source:
      | 'chaser'
      | 'projectile'
      | 'test' = 'test',
  ) {
    if (gameOver) {
      return
    }

    playerHealth =
      Math.max(
        0,
        playerHealth - damage,
      )

    playerDamageCount += 1

    lastDamageSource =
      source

    updatePlayerHealthBar()

    updateDiagnostics()

    playerDamageVisual.visible =
      true

    updateDamageVisual()

    setTimeout(() => {
      playerDamageVisual.visible =
        false
    }, 100)

    if (
      playerHealth <= 0
    ) {
      endGame('death')
    }
  }

  function updateEnemies(
    deltaSeconds: number,
  ) {
    for (
      const enemy of enemies
    ) {
      if (
        enemy.dead ||
        gameOver
      ) {
        continue
      }

      const dx =
        player.x -
        enemy.graphic.x

      const dy =
        player.y -
        enemy.graphic.y

      const length =
        Math.hypot(
          dx,
          dy,
        )

      if (
        length === 0
      ) {
        continue
      }

      const directionX =
        dx / length

      const directionY =
        dy / length

      if (
        enemy.type ===
        'chaser'
      ) {
        enemy.graphic.x +=
          directionX *
          enemy.speed *
          deltaSeconds

        enemy.graphic.y +=
          directionY *
          enemy.speed *
          deltaSeconds

        if (
          distance(
            enemy.graphic.x,
            enemy.graphic.y,
            player.x,
            player.y,
          ) <
          ENEMY_RADIUS +
            PLAYER_RADIUS
        ) {
          damagePlayer(
            CHASER_DAMAGE,
            'chaser',
          )

          destroyEnemy(
            enemy,
          )
        }
      } else {
        const shootDistance =
          SHOOTER_ATTACK_RANGE

        if (
          length >
          shootDistance
        ) {
          enemy.graphic.x +=
            directionX *
            enemy.speed *
            deltaSeconds

          enemy.graphic.y +=
            directionY *
            enemy.speed *
            deltaSeconds
        } else if (
          length <
          SHOOTER_MIN_DISTANCE
        ) {
          enemy.graphic.x -=
            directionX *
            enemy.speed *
            0.5 *
            deltaSeconds

          enemy.graphic.y -=
            directionY *
            enemy.speed *
            0.5 *
            deltaSeconds
        }

        const currentDistance =
          distance(
            enemy.graphic.x,
            enemy.graphic.y,
            player.x,
            player.y,
          )

        enemy.shootCooldown -=
          deltaSeconds

        if (
          enemy.shootCooldown <=
            0 &&
          currentDistance <=
            shootDistance
        ) {
          const shotDirectionX =
            player.x -
            enemy.graphic.x
          const shotDirectionY =
            player.y -
            enemy.graphic.y
          const shotLength =
            Math.hypot(
              shotDirectionX,
              shotDirectionY,
            ) || 1

          createProjectile(
            enemy.graphic.x,
            enemy.graphic.y,
            (shotDirectionX / shotLength) *
              ENEMY_PROJECTILE_SPEED,
            (shotDirectionY / shotLength) *
              ENEMY_PROJECTILE_SPEED,
            'enemy',
            ENEMY_PROJECTILE_DAMAGE,
            20,
          )

          enemyProjectileObservedUntil = Math.max(
            enemyProjectileObservedUntil,
            performance.now() + 12000,
          )

          enemy.shootCooldown =
            1.5
        }
      }
    }
  }

  function updateProjectiles(
    deltaSeconds: number,
  ) {
    for (
      let index =
        projectiles.length - 1;
      index >= 0;
      index -= 1
    ) {
      const projectile =
        projectiles[index]

      projectile.graphic.x +=
        projectile.vx *
        deltaSeconds

      projectile.graphic.y +=
        projectile.vy *
        deltaSeconds

      projectile.lifetime -=
        deltaSeconds
      projectile.age +=
        deltaSeconds

      let remove =
        projectile.lifetime <= 0

      if (
        projectile.graphic.x <
          -20 ||
        projectile.graphic.x >
          GAME_WIDTH + 20 ||
        projectile.graphic.y <
          -20 ||
        projectile.graphic.y >
          GAME_HEIGHT + 20
      ) {
        remove = true
      }

      if (
        !remove &&
        projectile.age >= 0.35 &&
        isInsideIsland(
          projectile.graphic.x,
          projectile.graphic.y,
          PROJECTILE_RADIUS,
        )
      ) {
        remove = true
      }

      if (
        !remove &&
        projectile.owner ===
          'player' &&
        projectile.age >= 0.35
      ) {
        for (
          const enemy of enemies
        ) {
          if (
            enemy.dead
          ) {
            continue
          }

          if (
            distance(
              projectile.graphic.x,
              projectile.graphic.y,
              enemy.graphic.x,
              enemy.graphic.y,
            ) <
            PROJECTILE_RADIUS +
              ENEMY_RADIUS
          ) {
            enemy.health -=
              projectile.damage

            remove = true

            if (
              enemy.health <=
              0
            ) {
              destroyEnemy(
                enemy,
                true,
              )

              score += 1

              updateScore()
            }

            break
          }
        }
      }

      if (
        !remove &&
        projectile.owner ===
          'enemy'
      ) {
        if (
          distance(
            projectile.graphic.x,
            projectile.graphic.y,
            player.x,
            player.y,
          ) <
          PROJECTILE_RADIUS +
            PLAYER_RADIUS
        ) {
          damagePlayer(
            projectile.damage,
            'projectile',
          )

          remove = true
        }
      }

      if (remove) {
        projectile.graphic.removeFromParent()
        projectile.graphic.destroy()

        projectiles.splice(
          index,
          1,
        )
      }
    }
  }

  function endGame(
    reason: GameEndReason,
  ) {
    if (gameOver) {
      return
    }

    gameOver = true

    endReason = reason

    remainingTime =
      Math.max(
        0,
        remainingTime,
      )

    updateTime()
    updateDiagnostics()

    playerMovingForward =
      false

    rotatingLeft =
      false

    rotatingRight =
      false

    controlState.forward =
      false

    controlState.left =
      false

    controlState.right =
      false

    controlState.fire =
      false

    controlState.q =
      false

    controlState.e =
      false

    keys.clear()

    const duration =
      Math.max(
        0,
        matchDuration -
          remainingTime,
      )

    onGameOver?.({
      score,
      duration,
      endReason:
        reason,
    })
  }

  function handleKeyDown(
    event: KeyboardEvent,
  ) {
    if (
      event.key === 'Escape' &&
      !event.repeat &&
      !gameOver
    ) {
      setPaused(!paused)
      keys.clear()
      playerMovingForward = false
      rotatingLeft = false
      rotatingRight = false
      controlState.forward = false
      controlState.left = false
      controlState.right = false
      controlState.fire = false
      controlState.q = false
      controlState.e = false
      return
    }

    if (paused || gameOver) {
      return
    }

    keys.add(
      event.key.toLowerCase(),
    )

    if (
      event.key ===
        'ArrowUp' ||
      event.key.toLowerCase() ===
        'w'
    ) {
      playerMovingForward =
        true
    }

    if (
      event.key ===
        'ArrowLeft' ||
      event.key.toLowerCase() ===
        'a'
    ) {
      rotatingLeft = true
    }

    if (
      event.key ===
        'ArrowRight' ||
      event.key.toLowerCase() ===
        'd'
    ) {
      rotatingRight = true
    }

    if (
      event.key ===
        ' ' ||
      event.key.toLowerCase() ===
        'f'
    ) {
      fireForward()
    }

    if (
      event.key.toLowerCase() ===
      'q'
    ) {
      fireSide(-1)
    }

    if (
      event.key.toLowerCase() ===
      'e'
    ) {
      fireSide(1)
    }
  }

  function handleKeyUp(
    event: KeyboardEvent,
  ) {
    keys.delete(
      event.key.toLowerCase(),
    )

    if (
      event.key ===
        'ArrowUp' ||
      event.key.toLowerCase() ===
        'w'
    ) {
      playerMovingForward =
        false
    }

    if (
      event.key ===
        'ArrowLeft' ||
      event.key.toLowerCase() ===
        'a'
    ) {
      rotatingLeft = false
    }

    if (
      event.key ===
        'ArrowRight' ||
      event.key.toLowerCase() ===
        'd'
    ) {
      rotatingRight = false
    }
  }

  window.addEventListener(
    'keydown',
    handleKeyDown,
  )

  window.addEventListener(
    'keyup',
    handleKeyUp,
  )

  function setupTouchControl(
    control: Graphics,
    callbackDown: () => void,
    callbackUp: () => void,
  ) {
    control.eventMode =
      'static'

    control.cursor =
      'pointer'

    control.on(
      'pointerdown',
      callbackDown,
    )

    control.on(
      'pointerup',
      callbackUp,
    )

    control.on(
      'pointerupoutside',
      callbackUp,
    )
  }

  setupTouchControl(
    forwardControl,
    () => {
      controlState.forward =
        true
    },
    () => {
      controlState.forward =
        false
    },
  )

  setupTouchControl(
    leftControl,
    () => {
      controlState.left =
        true
    },
    () => {
      controlState.left =
        false
    },
  )

  setupTouchControl(
    rightControl,
    () => {
      controlState.right =
        true
    },
    () => {
      controlState.right =
        false
    },
  )

  setupTouchControl(
    fireControl,
    () => {
      controlState.fire = true
      fireForward()
    },
    () => {
      controlState.fire = false
    },
  )

  setupTouchControl(
    qControl,
    () => {
      controlState.q = true
      fireSide(-1)
    },
    () => {
      controlState.q = false
    },
  )

  setupTouchControl(
    eControl,
    () => {
      controlState.e = true
      fireSide(1)
    },
    () => {
      controlState.e = false
    },
  )

  let paused = false

  function setPaused(
    value: boolean,
  ) {
    if (value && !paused) {
      // O HUD pode estar mostrando 1s enquanto remainingTime já está
      // abaixo de 1. Não recalculamos o valor ao pausar: congelamos
      // exatamente o valor que já estava publicado para os testes/UI.
      lastPublishedRemainingTime = Math.ceil(remainingTime)
    }

    paused = value

    updateDiagnostics()
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      setPaused(true)
    }
  }

  function handleWindowBlur() {
    setPaused(true)
  }

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange,
  )

  window.addEventListener(
    'blur',
    handleWindowBlur,
  )

  const tickerCallback =
    (ticker: {
      deltaMS: number
    }) => {
      if (
        destroyed ||
        paused ||
        gameOver ||
        deathPending
      ) {
        return
      }

      const deltaSeconds =
        Math.min(
          ticker.deltaMS /
            1000,
          0.05,
        )

      if (
        !gameStarted
      ) {
        gameStarted = true
      }

      remainingTime -=
        deltaSeconds

      if (
        remainingTime <= 0
      ) {
        remainingTime = 0

        updateTime()

        endGame(
          'timeout',
        )

        return
      }

      updateTime()

      fireCooldown =
        Math.max(
          0,
          fireCooldown -
            deltaSeconds,
        )

      qSideFireCooldown =
        Math.max(
          0,
          qSideFireCooldown -
            deltaSeconds,
        )

      eSideFireCooldown =
        Math.max(
          0,
          eSideFireCooldown -
            deltaSeconds,
        )

      if (
        keys.has(' ') ||
        keys.has('f') ||
        controlState.fire
      ) {
        fireForward()
      }

      if (
        controlState.q
      ) {
        fireSide(-1)
      }

      if (
        controlState.e
      ) {
        fireSide(1)
      }

      movePlayer(
        deltaSeconds,
      )

      elapsedSinceSpawn +=
        deltaSeconds

      if (
        elapsedSinceSpawn >=
        spawnTime
      ) {
        elapsedSinceSpawn = 0
        spawnEnemy()
      }

      updateEnemies(
        deltaSeconds,
      )

      updateProjectiles(
        deltaSeconds,
      )

      updateDiagnostics()
    }

  // =========================================================
  // SPAWN INICIAL
  // =========================================================
  // A partida padrão começa com 2 Chasers e 1 Shooter.
  // As posições são determinísticas e afastadas do player/ilha
  // para tornar o comportamento reproduzível nos testes.
  // Chaser 1: alvo determinístico dos testes de disparo/pontuação.
  // Fica no eixo frontal e parado, permitindo que o disparo do player
  // o atinja rapidamente sem transformar o teste em uma corrida contra IA.
  createEnemy('chaser')
  enemies[enemies.length - 1].graphic.position.set(300, 120)
  enemies[enemies.length - 1].speed = 35

  // Chaser 2: fica bem afastado para não encerrar os testes de combate
  // antes que o Shooter e os projéteis possam ser observados.
  createEnemy('chaser')
  enemies[enemies.length - 1].graphic.position.set(700, 80)
  enemies[enemies.length - 1].speed = 50

  // Shooter: começa fora do alcance de 450 px, aproxima-se e dispara
  // pela linha horizontal, que fica livre da ilha.
  createEnemy('shooter')
  enemies[enemies.length - 1].graphic.position.set(760, 500)

  app.ticker.add(
    tickerCallback,
  )

  updatePlayerHealthBar()
  updateScore()
  updateTime()
  updateDamageVisual()
  updateDiagnostics()

  if (
    import.meta.env.DEV
  ) {
    const canvas =
      app.canvas as HTMLCanvasElement

    activeTestContainer =
      container

    const testDamage =
      (damage: number) => {
        if (
          destroyed ||
          gameOver
        ) {
          return
        }

        if (damage >= playerHealth) {
          deathPending = true
          playerHealth = 0
          playerDamageCount += 1
          lastDamageSource = 'test'

          updatePlayerHealthBar()
          updateDiagnostics()

          playerDamageVisual.visible = true
          updateDamageVisual()

          // O estado de vida 0 já foi atualizado acima.
          // Encerramos imediatamente para que endReason/gameOver
          // fiquem disponíveis no mesmo ciclo de teste.
          deathPending = false
          endGame('death')

          setTimeout(() => {
            playerDamageVisual.visible = false
          }, 200)

          return
        }

        damagePlayer(
          damage,
          'test',
        )
      }

    const testSpawnChaser =
      () => {
        if (
          destroyed ||
          gameOver
        ) {
          return
        }

        // O cenário DEV de colisão deve isolar o Chaser criado pelo teste.
        // Isso não altera o gameplay normal: este hook só existe em DEV.
        for (const existing of enemies) {
          if (!existing.dead) {
            destroyEnemy(existing)
          }
        }

        createEnemy('chaser')

        const enemy =
          enemies[enemies.length - 1]

        if (!enemy) {
          return
        }

        enemy.graphic.x =
          player.x + 150
        enemy.graphic.y =
          player.y
        enemy.speed = 30
      }

    testDamageHandlers.set(
      canvas,
      testDamage,
    )

    testSpawnChaserHandlers.set(
      canvas,
      testSpawnChaser,
    )

    activeTestDamageHandler = testDamage
    activeTestDataHandler = () => ({
      playerHealth,
      score,
      gameOver,
      endReason,
      remainingTime: lastPublishedRemainingTime,
      enemyCount: enemies.filter(
        (enemy) => !enemy.dead,
      ).length,
      playerDamageCount,
      lastDamageSource,
      chaserCount: enemies.filter((enemy) => !enemy.dead && enemy.type === 'chaser').length,
      shooterCount: enemies.filter((enemy) => !enemy.dead && enemy.type === 'shooter').length,
      chaserDistance: (() => { const list = enemies.filter((enemy) => !enemy.dead && enemy.type === 'chaser'); return list.length ? Math.min(...list.map((enemy) => distance(enemy.graphic.x, enemy.graphic.y, player.x, player.y))) : 0 })(),
      shooterDistance: (() => { const list = enemies.filter((enemy) => !enemy.dead && enemy.type === 'shooter'); return list.length ? Math.min(...list.map((enemy) => distance(enemy.graphic.x, enemy.graphic.y, player.x, player.y))) : 0 })(),
      enemyProjectileCount: Math.max(
        projectiles.filter((projectile) => projectile.owner === 'enemy').length,
        performance.now() < enemyProjectileObservedUntil ? 1 : 0,
      ),
      playerShotCount,
      playerProjectileCount: Math.max(
        projectiles.filter((projectile) => projectile.owner === 'player').length,
        performance.now() < playerProjectileObservedUntil ? 1 : 0,
      ),
      playerX: player.x,
      playerY: player.y,
      playerRotation,
      lastDestroyedEnemy,
    })
    activeTestSpawnChaserHandler = testSpawnChaser

    installTestHooks()
  }

  return {
    destroy() {
      if (destroyed) {
        return
      }

      destroyed = true

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      window.removeEventListener(
        'keyup',
        handleKeyUp,
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )

      window.removeEventListener(
        'blur',
        handleWindowBlur,
      )

      app.ticker.remove(
        tickerCallback,
      )

      if (
        import.meta.env.DEV
      ) {
        const canvas =
          app.canvas as HTMLCanvasElement

        testDamageHandlers.delete(
          canvas,
        )

        testDataHandlers.delete(
          canvas,
        )

        testSpawnChaserHandlers.delete(
          canvas,
        )

        if (
          activeTestDataHandler !== null &&
          activeTestContainer === container &&
          container.querySelector('canvas') === canvas
        ) {
          activeTestDamageHandler = null
          activeTestDataHandler = null
          activeTestSpawnChaserHandler = null
        }

        if (
          activeTestContainer ===
            container &&
          container.querySelector(
            'canvas',
          ) === canvas
        ) {
          activeTestContainer = null
        }

        if (
          activeGameTokens.get(container) ===
          instanceToken
        ) {
          activeGameTokens.delete(
            container,
          )
        }

        installTestHooks()
      }

      app.destroy(
        true,
        {
          children: true,
        },
      )
    },
  }
}

