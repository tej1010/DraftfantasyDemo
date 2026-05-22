import { Matchup } from '../types';

export const STATIC_MATCHUP_LEAGUE_ID = 'league-demo';

type MatchupTeamRef = { id: string; name: string; username: string };

const DEFAULT_TEAMS: MatchupTeamRef[] = [
  { id: 'team-user', name: 'Tejpal FC', username: 'Gaffer_Tejpal' },
  { id: 'team-bot-pep', name: 'Tiki Taka United', username: 'Pep Guardiola Bot' },
  { id: 'team-bot-klopp', name: 'Gegenpress City', username: 'Jurgen Klopp Bot' },
  { id: 'team-bot-arteta', name: 'The Arsenal Way', username: 'Mikel Arteta Bot' },
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

export function buildStaticH2HMatchups(
  leagueId: string = STATIC_MATCHUP_LEAGUE_ID,
  teams?: MatchupTeamRef[]
): Matchup[] {
  const [t0, t1, t2, t3] = teams && teams.length >= 4 ? teams : DEFAULT_TEAMS;
  const gw1a = daysFromNow(2, 15, 0);
  const gw1b = daysFromNow(2, 17, 30);
  const gw2a = daysFromNow(9, 14, 0);
  const gw2b = daysFromNow(9, 16, 30);
  const gw3a = daysFromNow(16, 15, 0);
  const gw3b = daysFromNow(16, 17, 30);

  return [
    {
      id: `m-gw1-1-${leagueId}`,
      leagueId,
      gameweek: 1,
      teamAId: t0.id,
      teamAName: t0.name,
      teamAManager: t0.username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: t1.id,
      teamBName: t1.name,
      teamBManager: t1.username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: gw1a.toISOString(),
      venue: 'Premier Exhibition — Matchday 1',
    },
    {
      id: `m-gw1-2-${leagueId}`,
      leagueId,
      gameweek: 1,
      teamAId: t2.id,
      teamAName: t2.name,
      teamAManager: t2.username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: t3.id,
      teamBName: t3.name,
      teamBManager: t3.username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: gw1b.toISOString(),
      venue: 'Premier Exhibition — Matchday 1',
    },
    {
      id: `m-gw2-1-${leagueId}`,
      leagueId,
      gameweek: 2,
      teamAId: t0.id,
      teamAName: t0.name,
      teamAManager: t0.username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: t2.id,
      teamBName: t2.name,
      teamBManager: t2.username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: gw2a.toISOString(),
      venue: 'Premier Exhibition — Matchday 2',
    },
    {
      id: `m-gw2-2-${leagueId}`,
      leagueId,
      gameweek: 2,
      teamAId: t1.id,
      teamAName: t1.name,
      teamAManager: t1.username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: t3.id,
      teamBName: t3.name,
      teamBManager: t3.username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: gw2b.toISOString(),
      venue: 'Premier Exhibition — Matchday 2',
    },
    {
      id: `m-gw3-1-${leagueId}`,
      leagueId,
      gameweek: 3,
      teamAId: t0.id,
      teamAName: t0.name,
      teamAManager: t0.username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: t3.id,
      teamBName: t3.name,
      teamBManager: t3.username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: gw3a.toISOString(),
      venue: 'Premier Exhibition — Matchday 3',
    },
    {
      id: `m-gw3-2-${leagueId}`,
      leagueId,
      gameweek: 3,
      teamAId: t1.id,
      teamAName: t1.name,
      teamAManager: t1.username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: t2.id,
      teamBName: t2.name,
      teamBManager: t2.username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: gw3b.toISOString(),
      venue: 'Premier Exhibition — Matchday 3',
    },
  ];
}

export const STATIC_H2H_MATCHUPS = buildStaticH2HMatchups();
