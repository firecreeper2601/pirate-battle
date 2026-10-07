# Architecture

## Responsibilities
- React owns menus, options and result UI.
- PixiJS owns the arena and per-frame visual rendering.
- `GameSimulation` owns continuous gameplay state and time-based rules.
- `gameConfig` owns typed balance parameters and local persistence.
- `api` is isolated from gameplay and is intended for Axios + TanStack Query + MSW.

## Simulation
The simulation advances using elapsed time (`dt`) rather than frame count. React does not render every gameplay frame.

## Next integration points
Add a `QueryClientProvider`, typed ranking/history hooks, MSW handlers/fixtures, pending submission persistence and idempotent match registration. Keep API failures isolated from combat.
