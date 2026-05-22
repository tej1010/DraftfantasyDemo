import { Matchup } from '../types';

export const STATIC_MATCHUP_LEAGUE_ID = 'league-demo';
export const STATIC_H2H_GAMEWEEKS = 6;

type MatchupTeamRef = { id: string; name: string; username: string };

const DEFAULT_TEAMS: MatchupTeamRef[] = [
  { id: 'team-user', name: 'Tejpal FC', username: 'Gaffer_Tejpal' },
  { id: 'team-bot-pep', name: 'Tiki Taka United', username: 'Pep Guardiola Bot' },
  { id: 'team-bot-klopp', name: 'Gegenpress City', username: 'Jurgen Klopp Bot' },
  { id: 'team-bot-arteta', name: 'The Arsenal Way', username: 'Mikel Arteta Bot' },
];

/** Double round-robin: each team plays every other team home & away */
const ROUND_ROBIN_SCHEDULE: { gw: number; home: number; away: number; slot: number }[] = [
  { gw: 1, home: 0, away: 1, slot: 0 },
  { gw: 1, home: 2, away: 3, slot: 1 },
  { gw: 2, home: 0, away: 2, slot: 0 },
  { gw: 2, home: 1, away: 3, slot: 1 },
  { gw: 3, home: 0, away: 3, slot: 0 },
  { gw: 3, home: 1, away: 2, slot: 1 },
  { gw: 4, home: 1, away: 0, slot: 0 },
  { gw: 4, home: 3, away: 2, slot: 1 },
  { gw: 5, home: 2, away: 0, slot: 0 },
  { gw: 5, home: 3, away: 1, slot: 1 },
  { gw: 6, home: 3, away: 0, slot: 0 },
  { gw: 6, home: 2, away: 1, slot: 1 },
];

const VENUES = [
  'Emirates Exhibition Ground',
  'Etihad Showcase Arena',
  'Anfield Demo Theatre',
  'Stamford Bridge Simulator',
  'Old Trafford Digital Pitch',
  'Tottenham Virtual Lane',
];

function daysFromNow(days: number, hour = 15, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function formatMatchupKickoff(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function kickoffForGameweek(gw: number, slot: number): Date {
  const baseDays = 2 + (gw - 1) * 7;
  const hour = slot === 0 ? 15 : 17;
  const minute = slot === 0 ? 0 : 30;
  return daysFromNow(baseDays, hour, minute);
}

export function buildStaticH2HMatchups(
  leagueId: string = STATIC_MATCHUP_LEAGUE_ID,
  teams?: MatchupTeamRef[]
): Matchup[] {
  const roster = teams && teams.length >= 4 ? teams : DEFAULT_TEAMS;

  return ROUND_ROBIN_SCHEDULE.map(({ gw, home, away, slot }) => {
    const teamA = roster[home];
    const teamB = roster[away];
    const kickoff = kickoffForGameweek(gw, slot);
    const isPastGw = gw === 1 && slot === 0;

    return {
      id: `m-gw${gw}-${slot + 1}-${leagueId}`,
      leagueId,
      gameweek: gw,
      teamAId: teamA.id,
      teamAName: teamA.name,
      teamAManager: teamA.username,
      teamAScore: isPastGw ? 52 : 0,
      teamAPlayerPoints: isPastGw
        ? { 'salah-11': 14, 'palmer-20': 8, 'haaland-09': 12, 'saka-07': 6, 'gabriel-06': 4, 'saliba-02': 3, 'vandijk-04': 3, 'alexander-arnold-66': 2 }
        : {},
      teamBId: teamB.id,
      teamBName: teamB.name,
      teamBManager: teamB.username,
      teamBScore: isPastGw ? 48 : 0,
      teamBPlayerPoints: isPastGw
        ? { 'foden-47': 10, 'gordon-10': 9, 'rice-41': 7, 'neto-07': 6, 'semenyo-24': 8, 'chalobah-27': 4, 'ederson-31': 2, 'pickford-01': 2 }
        : {},
      status: isPastGw ? 'Completed' : 'Upcoming',
      kickoffAt: kickoff.toISOString(),
      venue: `${VENUES[(gw + slot) % VENUES.length]} — GW${gw}`,
    };
  });
}

export const STATIC_H2H_MATCHUPS = buildStaticH2HMatchups();
