import { FwwbBid, FwwbTeamBudget } from '../types';
import { STATIC_WAIVER_LEAGUE_ID } from './staticWaiverData';

export const FWWB_STARTING_BUDGET = 100;
export const FWWB_MIN_BID = 1;

export const STATIC_FWWB_BUDGETS: FwwbTeamBudget[] = [
  { teamId: 'team-user', teamName: 'Tejpal FC', managerName: 'Gaffer_Tejpal', totalBudget: FWWB_STARTING_BUDGET, remaining: 72 },
  { teamId: 'team-bot-pep', teamName: 'Tiki Taka United', managerName: 'Pep Guardiola Bot', totalBudget: FWWB_STARTING_BUDGET, remaining: 85 },
  { teamId: 'team-bot-klopp', teamName: 'Gegenpress City', managerName: 'Jurgen Klopp Bot', totalBudget: FWWB_STARTING_BUDGET, remaining: 91 },
  { teamId: 'team-bot-arteta', teamName: 'The Arsenal Way', managerName: 'Mikel Arteta Bot', totalBudget: FWWB_STARTING_BUDGET, remaining: 78 },
];

export const STATIC_FWWB_SEED_BIDS: FwwbBid[] = [
  {
    id: 'fwwb-seed-klopp-gordon',
    leagueId: STATIC_WAIVER_LEAGUE_ID,
    teamId: 'team-bot-klopp',
    teamName: 'Gegenpress City',
    playerToDropId: 'mbeumo-19',
    playerToDropName: 'Bryan Mbeumo',
    playerToAddId: 'gordon-10',
    playerToAddName: 'Anthony Gordon',
    bidAmount: 28,
    status: 'Pending',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'fwwb-seed-pep-jackson',
    leagueId: STATIC_WAIVER_LEAGUE_ID,
    teamId: 'team-bot-pep',
    teamName: 'Tiki Taka United',
    playerToDropId: 'bowen-20',
    playerToDropName: 'Jarrod Bowen',
    playerToAddId: 'jackson-15',
    playerToAddName: 'Nicolas Jackson',
    bidAmount: 15,
    status: 'Pending',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
  },
];

export function buildStaticFwwbBid(
  dropId: string,
  dropName: string,
  addId: string,
  addName: string,
  bidAmount: number,
  leagueId: string,
  teamName = 'Tejpal FC'
): FwwbBid {
  return {
    id: `fwwb-${Date.now()}`,
    leagueId,
    teamId: 'team-user',
    teamName,
    playerToDropId: dropId,
    playerToDropName: dropName,
    playerToAddId: addId,
    playerToAddName: addName,
    bidAmount,
    status: 'Pending',
    timestamp: new Date().toISOString(),
  };
}
