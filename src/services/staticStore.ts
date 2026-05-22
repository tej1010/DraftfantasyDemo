import { INITIAL_MOCK_PLAYERS } from '../mockPlayers';
import { buildStaticH2HMatchups } from '../data/staticMatchups';
import { STATIC_SEED_CLAIMS, STATIC_WAIVER_PRIORITY } from '../data/staticWaiverData';
import {
  FWWB_STARTING_BUDGET,
  FWWB_MIN_BID,
  STATIC_FWWB_BUDGETS,
  STATIC_FWWB_SEED_BIDS,
} from '../data/staticFwwbData';
import { STATIC_FEED_UPDATES } from '../data/staticFeedUpdates';
import {
  League,
  Team,
  Player,
  PlayerPosition,
  DraftSession,
  DraftPick,
  WaiverClaim,
  FwwbBid,
  FwwbTeamBudget,
  Matchup,
  Notification,
  DEFAULT_SCORING_TEMPLATE,
  LeagueMember,
  Standings,
} from '../types';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

let globalPlayers: Player[] = clone(INITIAL_MOCK_PLAYERS);
let leagues: League[] = [];
let notifications: Notification[] = [];
let draftSessions: Record<string, DraftSession> = {};
let waiverClaims: WaiverClaim[] = [];
let fwwbBids: FwwbBid[] = [];
let fwwbBudgets: Record<string, FwwbTeamBudget[]> = {};
let matchups: Record<string, Matchup[]> = {};

let currentUser: {
  userId: string;
  username: string;
  email: string;
  phone: string;
  isAuthenticated: boolean;
} | null = null;

function updateOwnership(playerId: string, teamId?: string, teamName?: string) {
  const p = globalPlayers.find(x => x.id === playerId);
  if (p) {
    p.ownershipStatus = {
      isOwned: !!teamId,
      ownedByTeamId: teamId,
      ownedByTeamName: teamName,
    };
  }
}

function initFwwbBudgetsForLeague(league: League) {
  fwwbBudgets[league.id] = league.teams.map(t => ({
    teamId: t.id,
    teamName: t.name,
    managerName: t.username,
    totalBudget: FWWB_STARTING_BUDGET,
    remaining: FWWB_STARTING_BUDGET,
  }));
}

function getBudgetEntry(leagueId: string, teamId: string): FwwbTeamBudget | undefined {
  return fwwbBudgets[leagueId]?.find(b => b.teamId === teamId);
}

function applyRosterSwap(team: Team, dropId: string, addId: string, league: League): boolean {
  const dropPlayer = globalPlayers.find(p => p.id === dropId);
  const addPlayer = globalPlayers.find(p => p.id === addId);
  if (!dropPlayer || !addPlayer) return false;
  const inActive = team.activePlayerIds.includes(dropId);
  const inBench = team.benchPlayerIds.includes(dropId);
  if (!inActive && !inBench) return false;
  if (league.teams.some(t => t.activePlayerIds.includes(addId) || t.benchPlayerIds.includes(addId))) {
    return false;
  }
  if (inActive) {
    team.activePlayerIds = team.activePlayerIds.map(id => (id === dropId ? addId : id));
  } else {
    team.benchPlayerIds = team.benchPlayerIds.map(id => (id === dropId ? addId : id));
  }
  updateOwnership(dropId);
  updateOwnership(addId, team.id, team.name);
  return true;
}

function getSnakeDraftPickerId(session: DraftSession): string {
  const numTeams = session.order.length;
  const pickIndex = session.currentPickIndex;
  const round = Math.floor(pickIndex / numTeams) + 1;
  const isReverseRound = round % 2 === 0;
  const roundPickOffset = pickIndex % numTeams;
  return isReverseRound
    ? session.order[numTeams - 1 - roundPickOffset]
    : session.order[roundPickOffset];
}

function seedDemoLeague() {
  const demoLeagueId = 'league-demo';
  const rules = { ...DEFAULT_SCORING_TEMPLATE };
  const members: LeagueMember[] = [
    { userId: 'user-current', username: 'Gaffer_Tejpal', teamId: 'team-user', teamName: 'Tejpal FC', isHost: true, isBot: false, waiverPriority: 1 },
    { userId: 'bot-pep', username: 'Pep Guardiola Bot', teamId: 'team-bot-pep', teamName: 'Tiki Taka United', isHost: false, isBot: true, waiverPriority: 2 },
    { userId: 'bot-klopp', username: 'Jurgen Klopp Bot', teamId: 'team-bot-klopp', teamName: 'Gegenpress City', isHost: false, isBot: true, waiverPriority: 3 },
    { userId: 'bot-arteta', username: 'Mikel Arteta Bot', teamId: 'team-bot-arteta', teamName: 'The Arsenal Way', isHost: false, isBot: true, waiverPriority: 4 },
  ];
  const userActiveIds = ['salah-11', 'palmer-20', 'saka-07', 'haaland-09', 'gabriel-06', 'saliba-02', 'vandijk-04', 'alexander-arnold-66'];
  const userBenchIds = ['watkins-11', 'bowen-20', 'martinez-23'];
  const teams: Team[] = [
    { id: 'team-user', leagueId: demoLeagueId, userId: 'user-current', username: 'Gaffer_Tejpal', name: 'Tejpal FC', formation: '4-4-2', captainId: 'salah-11', viceCaptainId: 'palmer-20', activePlayerIds: userActiveIds, benchPlayerIds: userBenchIds },
    { id: 'team-bot-pep', leagueId: demoLeagueId, userId: 'bot-pep', username: 'Pep Guardiola Bot', name: 'Tiki Taka United', formation: '4-3-3', captainId: '', viceCaptainId: '', activePlayerIds: [], benchPlayerIds: ['bowen-20'] },
    { id: 'team-bot-klopp', leagueId: demoLeagueId, userId: 'bot-klopp', username: 'Jurgen Klopp Bot', name: 'Gegenpress City', formation: '3-5-2', captainId: '', viceCaptainId: '', activePlayerIds: [], benchPlayerIds: ['mbeumo-19'] },
    { id: 'team-bot-arteta', leagueId: demoLeagueId, userId: 'bot-arteta', username: 'Mikel Arteta Bot', name: 'The Arsenal Way', formation: '4-4-2', captainId: '', viceCaptainId: '', activePlayerIds: [], benchPlayerIds: [] },
  ];
  const standings: Standings[] = teams.map((t, i) => ({
    teamId: t.id,
    teamName: t.name,
    managerName: t.username,
    wins: 0,
    draws: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    points: 0,
    waiverPriority: i + 1,
  }));
  const demoLeague: League = {
    id: demoLeagueId,
    name: 'Premier Exhibition League',
    logo: '🏆',
    inviteCode: 'EXHIBIT4',
    maxTeams: 4,
    status: 'Lobby',
    currentGameweek: 1,
    scoringRules: rules,
    members,
    teams,
    standings,
  };
  draftSessions[demoLeagueId] = {
    leagueId: demoLeagueId,
    status: 'Upcoming',
    currentPickIndex: 0,
    timerDurationSeconds: 60,
    timerRemainingSeconds: 60,
    picks: [],
    order: teams.map(t => t.id),
    draftHistory: [],
  };
  leagues.push(demoLeague);
  matchups[demoLeagueId] = buildStaticH2HMatchups(demoLeagueId, teams);
  [...userActiveIds, ...userBenchIds].forEach(id => updateOwnership(id, 'team-user', 'Tejpal FC'));
  waiverClaims.push(clone(STATIC_SEED_CLAIMS[0]));
  fwwbBudgets[demoLeagueId] = clone(STATIC_FWWB_BUDGETS);
  fwwbBids.push(...clone(STATIC_FWWB_SEED_BIDS));
}

export function resetPlatform() {
  globalPlayers = clone(INITIAL_MOCK_PLAYERS);
  leagues = [];
  waiverClaims = [];
  fwwbBids = [];
  fwwbBudgets = {};
  matchups = {};
  draftSessions = {};
  notifications = clone(STATIC_FEED_UPDATES);
  seedDemoLeague();
  currentUser = null;
}

resetPlatform();

export function getLeagues() {
  return clone(leagues);
}

export function getNotifications() {
  const list = notifications.length ? notifications : STATIC_FEED_UPDATES;
  return clone(list);
}

export function markNotificationRead(id: string) {
  const n = notifications.find(x => x.id === id);
  if (n) n.read = true;
}

export function getPlayers(search?: string, position?: string) {
  let pool = globalPlayers;
  if (search) {
    const q = search.toLowerCase();
    pool = pool.filter(p => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q));
  }
  if (position && position !== 'ALL') {
    pool = pool.filter(p => p.position === position);
  }
  return clone(pool);
}

export function getAllPlayers() {
  return clone(globalPlayers);
}

export function getRoster(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return null;
  const team = league.teams.find(t => t.userId === 'user-current') || league.teams[0];
  if (!team) return null;
  const active = team.activePlayerIds.map(id => globalPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
  const bench = team.benchPlayerIds.map(id => globalPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
  return { team: clone(team), active: clone(active), bench: clone(bench) };
}

export function getDraftSession(leagueId: string) {
  const session = draftSessions[leagueId];
  if (!session) return null;
  const league = leagues.find(l => l.id === leagueId);
  const nextPickerId = session.status === 'Active' ? getSnakeDraftPickerId(session) : '';
  const nextPickerName = league?.members.find(m => m.teamId === nextPickerId)?.username || '';
  const nextTeamName = league?.teams.find(t => t.id === nextPickerId)?.name || '';
  return {
    ...clone(session),
    nextPickerId,
    nextPickerName,
    nextTeamName,
    round: Math.floor(session.currentPickIndex / session.order.length) + 1,
    direction: (Math.floor(session.currentPickIndex / session.order.length) + 1) % 2 === 0 ? 'Reverse ↩' : 'Forward ↪',
  };
}

export function getWaivers(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  const claims = waiverClaims.filter(c => c.leagueId === leagueId);
  return {
    claims: claims.length ? clone(claims) : clone(STATIC_SEED_CLAIMS.filter(c => c.leagueId === leagueId)),
    teamPriorityList: league?.standings
      .slice()
      .sort((a, b) => a.waiverPriority - b.waiverPriority)
      .map(s => ({ teamName: s.teamName, managerName: s.managerName, priority: s.waiverPriority })) || clone(STATIC_WAIVER_PRIORITY),
  };
}

export function getFwwb(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { budgets: clone(STATIC_FWWB_BUDGETS), bids: clone(STATIC_FWWB_SEED_BIDS) };
  if (!fwwbBudgets[leagueId]) initFwwbBudgetsForLeague(league);
  const bids = fwwbBids.filter(b => b.leagueId === leagueId);
  const userTeam = league.teams.find(t => t.userId === 'user-current');
  const myBudget = userTeam ? getBudgetEntry(leagueId, userTeam.id) : undefined;
  return {
    budgets: clone(fwwbBudgets[leagueId]),
    bids: bids.length ? clone(bids) : clone(STATIC_FWWB_SEED_BIDS.filter(b => b.leagueId === leagueId)),
    myRemaining: myBudget?.remaining ?? FWWB_STARTING_BUDGET,
    startingBudget: FWWB_STARTING_BUDGET,
    minBid: FWWB_MIN_BID,
  };
}

export function getMatchups(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  let fixtures = matchups[leagueId] || [];
  if (!fixtures.length && league && league.teams.length >= 4) {
    fixtures = buildStaticH2HMatchups(leagueId, league.teams);
    matchups[leagueId] = fixtures;
  }
  return clone(fixtures);
}

export function getSession() {
  return currentUser?.isAuthenticated ? { ...currentUser } : null;
}

export function logout() {
  resetPlatform();
}

export function sendOtp(phone: string) {
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length !== 10) return { error: 'Please enter a valid 10-digit US phone number.' };
  return { success: true, message: 'OTP sent (demo: use 123456)' };
}

export function verifyOtp(phone: string, otp: string, username?: string, email?: string, teamName?: string) {
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length !== 10) return { error: 'Valid 10-digit US phone number is required.' };
  if (otp !== '123456') return { error: 'Incorrect OTP. Use 123456 in demo mode.' };
  currentUser = {
    userId: 'user-current',
    username: username || 'Gaffer_Tejpal',
    email: email || 'demo@gafferdraft.com',
    phone: clean,
    isAuthenticated: true,
  };
  if (username && leagues[0]) {
    const m = leagues[0].members.find(x => x.userId === 'user-current');
    if (m) {
      m.username = username;
      if (teamName) m.teamName = teamName;
    }
    const t = leagues[0].teams.find(x => x.userId === 'user-current');
    if (t) {
      t.username = username;
      if (teamName) t.name = teamName;
    }
  }
  return { success: true, user: { ...currentUser } };
}

const TOTAL_SPOTS = 11;

export function executeDraftPick(leagueId: string, teamId: string, playerId: string) {
  const session = draftSessions[leagueId];
  if (!session || session.status !== 'Active') return { success: false, message: 'Draft is not active.' };
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { success: false, message: 'League not found.' };
  const player = globalPlayers.find(p => p.id === playerId);
  if (!player) return { success: false, message: 'Player not found.' };
  if (league.teams.some(t => t.activePlayerIds.includes(playerId) || t.benchPlayerIds.includes(playerId))) {
    return { success: false, message: 'Player already drafted.' };
  }
  const team = league.teams.find(t => t.id === teamId);
  if (!team) return { success: false, message: 'Team not found.' };
  if (team.activePlayerIds.length + team.benchPlayerIds.length >= TOTAL_SPOTS) {
    return { success: false, message: 'Team roster is full.' };
  }
  const pick: DraftPick = {
    pickNumber: session.currentPickIndex + 1,
    round: Math.floor(session.currentPickIndex / session.order.length) + 1,
    teamId,
    teamName: team.name,
    playerId: player.id,
    playerName: player.name,
    position: player.position,
  };
  session.picks.push(pick);
  if (team.activePlayerIds.length < 8) team.activePlayerIds.push(player.id);
  else team.benchPlayerIds.push(player.id);
  if (!team.captainId) team.captainId = player.id;
  else if (!team.viceCaptainId) team.viceCaptainId = player.id;
  session.draftHistory.unshift({
    pickNumber: pick.pickNumber,
    teamName: team.name,
    playerName: player.name,
    timestamp: new Date().toLocaleTimeString(),
  });
  updateOwnership(player.id, team.id, team.name);
  session.currentPickIndex++;
  session.timerRemainingSeconds = session.timerDurationSeconds;
  if (session.currentPickIndex >= session.order.length * TOTAL_SPOTS) {
    session.status = 'Completed';
    league.status = 'Active';
    matchups[leagueId] = buildStaticH2HMatchups(leagueId, league.teams);
  }
  return { success: true, message: 'Draft pick recorded.', pick };
}

export function startDraft(leagueId: string) {
  const session = draftSessions[leagueId];
  const league = leagues.find(l => l.id === leagueId);
  if (!session || !league) return { error: 'Draft not found.' };
  session.status = 'Active';
  league.status = 'Drafting';
  session.currentPickIndex = 0;
  session.timerRemainingSeconds = session.timerDurationSeconds;
  return { success: true, session: getDraftSession(leagueId) };
}

export function autoDraftPick(leagueId: string) {
  const session = draftSessions[leagueId];
  const league = leagues.find(l => l.id === leagueId);
  if (!session || session.status !== 'Active' || !league) return { error: 'Draft inactive.' };
  const pickerId = getSnakeDraftPickerId(session);
  const available = globalPlayers.filter(
    p => !league.teams.some(t => t.activePlayerIds.includes(p.id) || t.benchPlayerIds.includes(p.id))
  );
  if (!available.length) return { error: 'No players available.' };
  const top = [...available].sort((a, b) => b.points - a.points)[0];
  return executeDraftPick(leagueId, pickerId, top.id);
}

export function createLeague(body: { name: string; maxTeams: number; goalPoints: number; assistPoints: number }) {
  const newLeagueId = `league-${Date.now()}`;
  const inviteCode = `LEAGUE${Math.floor(1000 + Math.random() * 9000)}`;
  const league: League = {
    id: newLeagueId,
    name: body.name || 'Custom League',
    logo: '🏆',
    inviteCode,
    maxTeams: Math.max(4, Math.min(16, body.maxTeams || 6)),
    status: 'Lobby',
    currentGameweek: 1,
    scoringRules: { ...DEFAULT_SCORING_TEMPLATE, assist: body.assistPoints || 3 },
    members: [{ userId: 'user-current', username: currentUser?.username || 'Gaffer_Tejpal', teamId: 'team-user', teamName: `${body.name} FC`, isHost: true, isBot: false, waiverPriority: 1 }],
    teams: [{ id: 'team-user', leagueId: newLeagueId, userId: 'user-current', username: currentUser?.username || 'Gaffer_Tejpal', name: `${body.name} FC`, formation: '4-4-2', captainId: '', viceCaptainId: '', activePlayerIds: [], benchPlayerIds: [] }],
    standings: [{ teamId: 'team-user', teamName: `${body.name} FC`, managerName: currentUser?.username || 'Gaffer', wins: 0, draws: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, points: 0, waiverPriority: 1 }],
  };
  leagues.push(league);
  initFwwbBudgetsForLeague(league);
  draftSessions[newLeagueId] = { leagueId: newLeagueId, status: 'Upcoming', currentPickIndex: 0, timerDurationSeconds: 60, timerRemainingSeconds: 60, picks: [], order: ['team-user'], draftHistory: [] };
  return clone(league);
}

export function joinLeague(code: string) {
  const league = leagues.find(l => l.inviteCode.toUpperCase() === code.trim().toUpperCase());
  if (!league) return { error: 'Invalid invite code.' };
  if (league.members.length >= league.maxTeams) return { error: 'League is full.' };
  return clone(league);
}

export function updateLineup(leagueId: string, body: { activePlayerIds?: string[]; benchPlayerIds?: string[]; formation?: string }) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  const team = league.teams.find(t => t.userId === 'user-current');
  if (!team) return { error: 'Team not found.' };
  if (body.activePlayerIds) team.activePlayerIds = body.activePlayerIds;
  if (body.benchPlayerIds) team.benchPlayerIds = body.benchPlayerIds;
  if (body.formation) team.formation = body.formation;
  return { success: true, team: clone(team) };
}

export function setCaptain(leagueId: string, captainId?: string, viceCaptainId?: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  const team = league.teams.find(t => t.userId === 'user-current');
  if (!team) return { error: 'Team not found.' };
  if (captainId) team.captainId = captainId;
  if (viceCaptainId) team.viceCaptainId = viceCaptainId;
  return { success: true, team: clone(team) };
}

export function submitWaiver(leagueId: string, playerToDropId: string, playerToAddId: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  const team = league.teams.find(t => t.userId === 'user-current');
  const toDrop = globalPlayers.find(p => p.id === playerToDropId);
  const toAdd = globalPlayers.find(p => p.id === playerToAddId);
  if (!team || !toDrop || !toAdd) return { error: 'Invalid players.' };
  const claim: WaiverClaim = {
    id: `claim-${Date.now()}`,
    leagueId,
    teamId: team.id,
    teamName: team.name,
    playerToDropId,
    playerToDropName: toDrop.name,
    playerToAddId,
    playerToAddName: toAdd.name,
    status: 'Pending',
    priorityValue: 2,
    timestamp: new Date().toISOString(),
  };
  waiverClaims.push(claim);
  return clone(claim);
}

export function deleteWaiver(leagueId: string, claimId: string) {
  waiverClaims = waiverClaims.filter(c => !(c.id === claimId && c.leagueId === leagueId));
  return { success: true };
}

export function processWaivers(leagueId: string) {
  const pending = waiverClaims.filter(c => c.leagueId === leagueId && c.status === 'Pending');
  pending.forEach(c => { c.status = 'Successful'; });
  return { success: true, processedCount: pending.length, logs: pending.map(c => `Processed ${c.playerToAddName}`) };
}

export function submitFwwbBid(
  leagueId: string,
  playerToDropId: string,
  playerToAddId: string,
  bidAmount: number
) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  const team = league.teams.find(t => t.userId === 'user-current');
  const toDrop = globalPlayers.find(p => p.id === playerToDropId);
  const toAdd = globalPlayers.find(p => p.id === playerToAddId);
  if (!team || !toDrop || !toAdd) return { error: 'Invalid players.' };
  const amount = Math.floor(Number(bidAmount));
  if (amount < FWWB_MIN_BID) return { error: `Minimum bid is $${FWWB_MIN_BID}.` };
  if (!fwwbBudgets[leagueId]) initFwwbBudgetsForLeague(league);
  const budget = getBudgetEntry(leagueId, team.id);
  if (!budget || budget.remaining < amount) {
    return { error: `Insufficient FWWB budget. Remaining: $${budget?.remaining ?? 0}.` };
  }
  const bid: FwwbBid = {
    id: `fwwb-${Date.now()}`,
    leagueId,
    teamId: team.id,
    teamName: team.name,
    playerToDropId,
    playerToDropName: toDrop.name,
    playerToAddId,
    playerToAddName: toAdd.name,
    bidAmount: amount,
    status: 'Pending',
    timestamp: new Date().toISOString(),
  };
  fwwbBids.push(bid);
  return clone(bid);
}

export function deleteFwwbBid(leagueId: string, bidId: string) {
  fwwbBids = fwwbBids.filter(b => !(b.id === bidId && b.leagueId === leagueId));
  return { success: true };
}

export function processFwwbBids(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  if (!fwwbBudgets[leagueId]) initFwwbBudgetsForLeague(league);
  const pending = fwwbBids.filter(b => b.leagueId === leagueId && b.status === 'Pending');
  if (!pending.length) {
    return { success: true, processedCount: 0, logs: ['No pending FWWB bids.'] };
  }
  const logs: string[] = [];
  let processedCount = 0;
  const byTarget = new Map<string, FwwbBid[]>();
  pending.forEach(b => {
    const list = byTarget.get(b.playerToAddId) || [];
    list.push(b);
    byTarget.set(b.playerToAddId, list);
  });
  byTarget.forEach((bids, addId) => {
    const sorted = bids.slice().sort((a, b) => {
      if (b.bidAmount !== a.bidAmount) return b.bidAmount - a.bidAmount;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    let awarded = false;
    sorted.forEach(bid => {
      if (awarded) {
        bid.status = 'Failed';
        bid.failureReason = 'Outbid by higher FWWB offer.';
        return;
      }
      const team = league.teams.find(t => t.id === bid.teamId);
      const budget = team ? getBudgetEntry(leagueId, team.id) : undefined;
      if (!team || !budget || budget.remaining < bid.bidAmount) {
        bid.status = 'Failed';
        bid.failureReason = 'Insufficient remaining FWWB budget.';
        return;
      }
      if (!applyRosterSwap(team, bid.playerToDropId, addId, league)) {
        bid.status = 'Failed';
        bid.failureReason = 'Player unavailable or not on roster.';
        return;
      }
      budget.remaining -= bid.bidAmount;
      bid.status = 'Successful';
      awarded = true;
      processedCount++;
      logs.push(`${bid.teamName} won ${bid.playerToAddName} for $${bid.bidAmount}`);
    });
  });
  return { success: true, processedCount, logs };
}

export function fillWithBots(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  const numBotsNeeded = league.maxTeams - league.members.length;
  if (numBotsNeeded <= 0) return { error: 'League is already full.' };
  const botNames = [
    { user: 'Pep Guardiola Bot', team: 'Tiki Taka United' },
    { user: 'Jurgen Klopp Bot', team: 'Gegenpress City' },
    { user: 'Mikel Arteta Bot', team: 'The Arsenal Way' },
    { user: 'Carlo Ancelotti Bot', team: 'Real Football' },
  ];
  for (let i = 0; i < numBotsNeeded; i++) {
    const config = botNames[i % botNames.length];
    const botTeamId = `team-bot-${Date.now()}-${i}`;
    const botUserId = `user-bot-${Date.now()}-${i}`;
    league.members.push({
      userId: botUserId,
      username: config.user,
      teamId: botTeamId,
      teamName: config.team,
      isHost: false,
      isBot: true,
      waiverPriority: league.members.length + 1,
    });
    league.teams.push({
      id: botTeamId,
      leagueId: league.id,
      userId: botUserId,
      username: config.user,
      name: config.team,
      formation: '4-4-2',
      captainId: '',
      viceCaptainId: '',
      activePlayerIds: [],
      benchPlayerIds: [],
    });
    league.standings.push({
      teamId: botTeamId,
      teamName: config.team,
      managerName: config.user,
      wins: 0,
      draws: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      points: 0,
      waiverPriority: league.members.length,
    });
    const ds = draftSessions[league.id];
    if (ds) ds.order.push(botTeamId);
  }
  return clone(league);
}

export function simulateGameweek(leagueId: string) {
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { error: 'League not found.' };
  const gw = league.currentGameweek;
  const fixtures = (matchups[leagueId] || []).filter(m => m.gameweek === gw);
  fixtures.forEach(m => {
    m.teamAScore = Math.floor(Math.random() * 40) + 30;
    m.teamBScore = Math.floor(Math.random() * 40) + 30;
    m.status = 'Completed';
  });
  if (league.currentGameweek < 3) league.currentGameweek++;
  return { success: true, nextGameweek: league.currentGameweek, logs: ['Gameweek simulated (static mode)'] };
}
