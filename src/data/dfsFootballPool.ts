import { INITIAL_MOCK_PLAYERS } from '../mockPlayers';
import { PlayerPosition } from '../types';

export type DfsFootballPosition = 'GKP' | 'DEF' | 'MID' | 'FWD';

/** Draft pool size per position (4 seats × 10 picks needs 4/12/12/12; 40 gives large margin). */
export const PLAYERS_PER_ROLE = 40;

export interface DfsFootballPlayer {
  id: string;
  name: string;
  position: DfsFootballPosition;
  team: string;
  rosterPct: string;
  opp: string;
  opRk: string;
  adp: number;
  adp90: number;
  proj: number;
  avg: number;
  starType?: 'Q' | 'P' | null;
}

export const FOOTBALL_POS_LIMITS: Record<DfsFootballPosition, number> = {
  GKP: 1,
  DEF: 3,
  MID: 3,
  FWD: 3,
};

export const FOOTBALL_DRAFT_SLOTS: { key: DfsFootballPosition | 'FWD2'; label: string; theme: string }[] = [
  { key: 'GKP', label: 'GKP', theme: 'border-sky-500/25 text-sky-400 bg-sky-500/5' },
  { key: 'DEF', label: 'DEF', theme: 'border-blue-500/25 text-blue-400 bg-blue-500/5' },
  { key: 'DEF', label: 'DEF', theme: 'border-blue-500/25 text-blue-400 bg-blue-500/5' },
  { key: 'DEF', label: 'DEF', theme: 'border-blue-500/25 text-blue-400 bg-blue-500/5' },
  { key: 'MID', label: 'MID', theme: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/5' },
  { key: 'MID', label: 'MID', theme: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/5' },
  { key: 'MID', label: 'MID', theme: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/5' },
  { key: 'FWD', label: 'FWD', theme: 'border-rose-500/25 text-rose-400 bg-rose-500/5' },
  { key: 'FWD', label: 'FWD', theme: 'border-rose-500/25 text-rose-400 bg-rose-500/5' },
  { key: 'FWD2', label: 'FWD', theme: 'border-rose-500/25 text-rose-400 bg-rose-500/5' },
];

const CLUB_CODES: Record<string, string> = {
  'Man City': 'MCI',
  Liverpool: 'LIV',
  Arsenal: 'ARS',
  Chelsea: 'CHE',
  Spurs: 'TOT',
  Newcastle: 'NEW',
  'Aston Villa': 'AVL',
  'West Ham': 'WHU',
  Brighton: 'BHA',
  Bournemouth: 'BOU',
  Brentford: 'BRE',
  Everton: 'EVE',
  Fulham: 'FUL',
  Wolves: 'WOL',
  'Man Utd': 'MUN',
  'Nottm Forest': 'NFO',
  'Crystal Palace': 'CRY',
  Leicester: 'LEI',
  Ipswich: 'IPS',
  Southampton: 'SOU',
};

const CLUB_NAMES = Object.keys(CLUB_CODES);
const OPPONENTS = ['ARS', 'LIV', 'MCI', 'CHE', 'TOT', 'NEW', 'AVL', 'WHU', 'BHA', 'BOU'];

const FIRST_NAMES = [
  'James', 'Oliver', 'Harry', 'Jack', 'George', 'Noah', 'Leo', 'Arthur', 'Lucas', 'Henry',
  'Mohamed', 'Marcus', 'Bukayo', 'Phil', 'Declan', 'Trent', 'Kyle', 'John', 'Ben', 'Reece',
  'Bruno', 'Martin', 'Rodrigo', 'Pedro', 'Gabriel', 'William', 'Virgil', 'Andrew', 'Nathan', 'Pau',
  'Dominic', 'Anthony', 'Jarrod', 'Callum', 'Evan', 'Alexander', 'Erling', 'Darwin', 'Nicolas', 'Matheus',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Robinson', 'Clark',
  'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker',
  'Adams', 'Nelson', 'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner',
];

export const PL_CLUB_NAMES: Record<string, string> = {
  MCI: 'Manchester City',
  LIV: 'Liverpool',
  ARS: 'Arsenal',
  CHE: 'Chelsea',
  TOT: 'Tottenham Hotspur',
  NEW: 'Newcastle United',
  AVL: 'Aston Villa',
  WHU: 'West Ham United',
  BHA: 'Brighton & Hove Albion',
  BOU: 'AFC Bournemouth',
  BRE: 'Brentford',
  EVE: 'Everton',
  FUL: 'Fulham',
  WOL: 'Wolverhampton Wanderers',
  MUN: 'Manchester United',
  NFO: 'Nottingham Forest',
  CRY: 'Crystal Palace',
  LEI: 'Leicester City',
  IPS: 'Ipswich Town',
  SOU: 'Southampton',
};

export const PL_CLUB_BG: Record<string, string> = {
  MCI: 'bg-sky-600 text-white',
  LIV: 'bg-red-600 text-white',
  ARS: 'bg-red-700 text-white',
  CHE: 'bg-blue-700 text-white',
  TOT: 'bg-slate-800 text-white',
  NEW: 'bg-slate-900 text-white',
  AVL: 'bg-violet-900 text-amber-200',
  WHU: 'bg-violet-950 text-cyan-200',
  BHA: 'bg-blue-500 text-white',
  BOU: 'bg-red-800 text-black',
  BRE: 'bg-red-900 text-white',
  EVE: 'bg-blue-600 text-white',
  FUL: 'bg-white text-black',
  WOL: 'bg-amber-500 text-black',
  MUN: 'bg-red-600 text-white',
  NFO: 'bg-red-700 text-white',
  CRY: 'bg-blue-500 text-red-200',
  LEI: 'bg-blue-800 text-white',
  IPS: 'bg-blue-600 text-white',
  SOU: 'bg-red-600 text-white',
};

function clubCode(club: string): string {
  return CLUB_CODES[club] || club.slice(0, 3).toUpperCase();
}

function fixtureFor(id: string): string {
  const idx = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const opp = OPPONENTS[idx % OPPONENTS.length];
  const home = idx % 2 === 0;
  return home ? `vs ${opp} (H)` : `@ ${opp} (A)`;
}

function fdrFromPoints(pts: number): string {
  if (pts >= 200) return '1st';
  if (pts >= 170) return '2nd';
  if (pts >= 140) return '3rd';
  if (pts >= 110) return '8th';
  return '12th';
}

function mapPosition(pos: PlayerPosition): DfsFootballPosition {
  return pos;
}

function pointsForRole(position: DfsFootballPosition, tier: number): number {
  const t = Math.min(39, Math.max(0, tier));
  const ranges: Record<DfsFootballPosition, [number, number]> = {
    GKP: [78, 128],
    DEF: [92, 178],
    MID: [98, 248],
    FWD: [95, 235],
  };
  const [lo, hi] = ranges[position];
  return Math.round(hi - ((hi - lo) * t) / 39);
}

function toDfsPlayer(
  source: { id: string; name: string; position: DfsFootballPosition; club: string; points: number },
  seed: number
): DfsFootballPlayer {
  const team = clubCode(source.club);
  const adp = Math.max(1.2, 12 - source.points / 22 + (seed % 5) * 0.3);
  const proj = Math.round((source.points / 8 + (seed % 7)) * 10) / 10;
  const avg = Math.round((source.points / 9) * 10) / 10;
  return {
    id: source.id,
    name: source.name,
    position: source.position,
    team,
    rosterPct: `${3 + (seed % 28)}%`,
    opp: fixtureFor(source.id),
    opRk: fdrFromPoints(source.points),
    adp: Math.round(adp * 10) / 10,
    adp90: Math.round((adp + 0.8) * 10) / 10,
    proj,
    avg,
    starType: (source.points >= 210 ? 'P' : source.points >= 190 ? 'Q' : null) as 'P' | 'Q' | null,
  };
}

function generatePlayer(position: DfsFootballPosition, index: number): DfsFootballPlayer {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const club = CLUB_NAMES[index % CLUB_NAMES.length];
  const points = pointsForRole(position, index);
  const id = `dfs-gen-${position.toLowerCase()}-${index}`;
  return toDfsPlayer({ id, name: `${first} ${last}`, position, club, points }, index + 200);
}

function buildPool(): DfsFootballPlayer[] {
  const buckets: Record<DfsFootballPosition, DfsFootballPlayer[]> = {
    GKP: [],
    DEF: [],
    MID: [],
    FWD: [],
  };
  const seenIds = new Set<string>();

  const add = (player: DfsFootballPlayer) => {
    if (seenIds.has(player.id)) return;
    seenIds.add(player.id);
    buckets[player.position].push(player);
  };

  INITIAL_MOCK_PLAYERS.forEach((p, i) => {
    add(
      toDfsPlayer(
        {
          id: p.id,
          name: p.name,
          position: mapPosition(p.position),
          club: p.club,
          points: p.points,
        },
        i
      )
    );
  });

  let genIndex = 0;
  (['GKP', 'DEF', 'MID', 'FWD'] as DfsFootballPosition[]).forEach(position => {
    while (buckets[position].length < PLAYERS_PER_ROLE) {
      add(generatePlayer(position, genIndex));
      genIndex += 1;
    }
    buckets[position] = buckets[position]
      .sort((a, b) => b.proj - a.proj)
      .slice(0, PLAYERS_PER_ROLE);
  });

  return [...buckets.GKP, ...buckets.DEF, ...buckets.MID, ...buckets.FWD];
}

export const DFS_FOOTBALL_POOL: DfsFootballPlayer[] = buildPool();

export const DRAFT_POOL_MIN_PER_ROLE = {
  GKP: DFS_FOOTBALL_POOL.filter(p => p.position === 'GKP').length,
  DEF: DFS_FOOTBALL_POOL.filter(p => p.position === 'DEF').length,
  MID: DFS_FOOTBALL_POOL.filter(p => p.position === 'MID').length,
  FWD: DFS_FOOTBALL_POOL.filter(p => p.position === 'FWD').length,
};

export function getRosterNeeds(picks: { position: string }[]): Record<DfsFootballPosition, number> {
  const counts = { GKP: 0, DEF: 0, MID: 0, FWD: 0 };
  picks.forEach(p => {
    if (p.position in counts) counts[p.position as DfsFootballPosition]++;
  });
  return {
    GKP: Math.max(0, FOOTBALL_POS_LIMITS.GKP - counts.GKP),
    DEF: Math.max(0, FOOTBALL_POS_LIMITS.DEF - counts.DEF),
    MID: Math.max(0, FOOTBALL_POS_LIMITS.MID - counts.MID),
    FWD: Math.max(0, FOOTBALL_POS_LIMITS.FWD - counts.FWD),
  };
}

export function formatRosterNeeds(needs: Record<DfsFootballPosition, number>): string {
  const parts = (['GKP', 'DEF', 'MID', 'FWD'] as DfsFootballPosition[])
    .filter(pos => needs[pos] > 0)
    .map(pos => `${needs[pos]} ${pos}`);
  return parts.length ? parts.join(', ') : 'Roster complete';
}

export function footballPositionClass(pos: string): string {
  switch (pos) {
    case 'GKP':
      return 'bg-sky-500/10 text-sky-400 border border-sky-500/25';
    case 'DEF':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    case 'MID':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
    case 'FWD':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
    default:
      return 'bg-white/10 text-slate-300 border border-white/10';
  }
}

export function pickFootballForSeat(available: DfsFootballPlayer[], picks: { position: string }[]): DfsFootballPlayer {
  const needs = getRosterNeeds(picks);
  const sorted = [...available].sort((a, b) => b.proj - a.proj);
  for (const pos of ['GKP', 'DEF', 'MID', 'FWD'] as DfsFootballPosition[]) {
    if (needs[pos] > 0) {
      const match = sorted.find(p => p.position === pos);
      if (match) return match;
    }
  }
  return sorted[0];
}

export const pickFootballBot = pickFootballForSeat;
