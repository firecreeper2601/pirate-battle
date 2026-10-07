export interface GameplayConfig {
  matchDuration: number
  spawnInterval: number

  player: {
    startHealth: number
    speed: number
    rotationSpeed: number
    fireCooldown: number
    sideFireCooldown: number
  }

  projectile: {
    speed: number
    damage: number
    lifetime: number
  }

  enemy: {
    chaser: {
      speed: number
      damage: number
    }
    shooter: {
      speed: number
      attackRange: number
      minDistance: number
      shootCooldown: number
      projectileSpeed: number
      projectileDamage: number
    }
  }
}

export const DEFAULT_GAMEPLAY_CONFIG: Readonly<GameplayConfig> = {
  matchDuration: 60,
  spawnInterval: 5,
  player: {
    startHealth: 5,
    speed: 180,
    rotationSpeed: 2.5,
    fireCooldown: 0.25,
    sideFireCooldown: 0.5,
  },
  projectile: {
    speed: 300,
    damage: 1,
    lifetime: 4,
  },
  enemy: {
    chaser: {
      speed: 50,
      damage: 1,
    },
    shooter: {
      speed: 100,
      attackRange: 450,
      minDistance: 240,
      shootCooldown: 0.05,
      projectileSpeed: 300,
      projectileDamage: 1,
    },
  },
}

function cloneGameplayConfig(config: GameplayConfig): GameplayConfig {
  return {
    matchDuration: config.matchDuration,
    spawnInterval: config.spawnInterval,
    player: { ...config.player },
    projectile: { ...config.projectile },
    enemy: {
      chaser: { ...config.enemy.chaser },
      shooter: { ...config.enemy.shooter },
    },
  }
}

export function createGameplaySnapshot(
  config: GameplayConfig,
): Readonly<GameplayConfig> {
  const snapshot = cloneGameplayConfig(config)

  Object.freeze(snapshot.player)
  Object.freeze(snapshot.projectile)
  Object.freeze(snapshot.enemy.chaser)
  Object.freeze(snapshot.enemy.shooter)
  Object.freeze(snapshot.enemy)
  Object.freeze(snapshot)

  return snapshot
}
