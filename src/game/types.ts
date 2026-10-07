export type EnemyType='chaser'|'shooter'; export type EndReason='time'|'death'|'abandoned';
export interface Vec2{x:number;y:number} export interface Entity{id:number;position:Vec2;rotation:number;health:number;maxHealth:number;radius:number;alive:boolean}
export interface MatchResult{id:string;playerId:string;date:string;score:number;duration:number;reason:EndReason;config:Record<string,unknown>}
