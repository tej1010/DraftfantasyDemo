import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_MOCK_PLAYERS } from './src/mockPlayers';
import { 
  League, Team, Player, DraftSession, DraftPick, 
  WaiverClaim, Matchup, Standings, Notification, ScoringTemplate, 
  DEFAULT_SCORING_TEMPLATE, PlayerPosition, LeagueMember
} from './src/types';
import { buildStaticH2HMatchups } from './src/data/staticMatchups';

const app = express();
const PORT = 3000;

app.use(express.json());

// IN-MEMORY DATABASE STORE
let globalPlayers: Player[] = JSON.parse(JSON.stringify(INITIAL_MOCK_PLAYERS));
let leagues: League[] = [];
let notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Draft Fantasy!',
    message: 'Set up your first league to host a live Snake Draft and compete head-to-head.',
    type: 'System',
    timestamp: new Date().toISOString(),
    read: false
  }
];

// Helper to update player ownership in a specific league
function updatePlayerOwnershipInState(playerId: string, teamId: string | undefined, teamName: string | undefined) {
  const p = globalPlayers.find(item => item.id === playerId);
  if (p) {
    p.ownershipStatus = {
      isOwned: teamId !== undefined,
      ownedByTeamId: teamId,
      ownedByTeamName: teamName
    };
  }
}

// SEED FIRST DEMO LEAGUE FOR USER CONVENIENCE
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
    {
      id: 'team-user',
      leagueId: demoLeagueId,
      userId: 'user-current',
      username: 'Gaffer_Tejpal',
      name: 'Tejpal FC',
      formation: '4-4-2',
      captainId: 'salah-11',
      viceCaptainId: 'palmer-20',
      activePlayerIds: userActiveIds,
      benchPlayerIds: userBenchIds
    },
    {
      id: 'team-bot-pep',
      leagueId: demoLeagueId,
      userId: 'bot-pep',
      username: 'Pep Guardiola Bot',
      name: 'Tiki Taka United',
      formation: '4-3-3',
      captainId: '',
      viceCaptainId: '',
      activePlayerIds: [],
      benchPlayerIds: []
    },
    {
      id: 'team-bot-klopp',
      leagueId: demoLeagueId,
      userId: 'bot-klopp',
      username: 'Jurgen Klopp Bot',
      name: 'Gegenpress City',
      formation: '3-5-2',
      captainId: '',
      viceCaptainId: '',
      activePlayerIds: [],
      benchPlayerIds: []
    },
    {
      id: 'team-bot-arteta',
      leagueId: demoLeagueId,
      userId: 'bot-arteta',
      username: 'Mikel Arteta Bot',
      name: 'The Arsenal Way',
      formation: '4-4-2',
      captainId: '',
      viceCaptainId: '',
      activePlayerIds: [],
      benchPlayerIds: []
    }
  ];

  const standings: Standings[] = [
    { teamId: 'team-user', teamName: 'Tejpal FC', managerName: 'Gaffer_Tejpal', wins: 0, draws: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, points: 0, waiverPriority: 1 },
    { teamId: 'team-bot-pep', teamName: 'Tiki Taka United', managerName: 'Pep Guardiola Bot', wins: 0, draws: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, points: 0, waiverPriority: 2 },
    { teamId: 'team-bot-klopp', teamName: 'Gegenpress City', managerName: 'Jurgen Klopp Bot', wins: 0, draws: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, points: 0, waiverPriority: 3 },
    { teamId: 'team-bot-arteta', teamName: 'The Arsenal Way', managerName: 'Mikel Arteta Bot', wins: 0, draws: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, points: 0, waiverPriority: 4 }
  ];

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
    standings
  };

  // Seed Draft Session for this demo
  draftSessions[demoLeagueId] = {
    leagueId: demoLeagueId,
    status: 'Upcoming',
    currentPickIndex: 0,
    timerDurationSeconds: 60,
    timerRemainingSeconds: 60,
    picks: [],
    order: ['team-user', 'team-bot-pep', 'team-bot-klopp', 'team-bot-arteta'],
    draftHistory: []
  };

  leagues.push(demoLeague);
  matchups[demoLeagueId] = buildStaticH2HMatchups(demoLeagueId, teams);

  [...userActiveIds, ...userBenchIds].forEach(id => {
    updatePlayerOwnershipInState(id, 'team-user', 'Tejpal FC');
  });

  waiverClaims.push({
    id: 'claim-seed-demo-1',
    leagueId: demoLeagueId,
    teamId: 'team-user',
    teamName: 'Tejpal FC',
    playerToDropId: 'bowen-20',
    playerToDropName: 'Jarrod Bowen',
    playerToAddId: 'isak-14',
    playerToAddName: 'Alexander Isak',
    status: 'Pending',
    priorityValue: 2,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  });
}

// Global store of Draft Sessions by leagueId
let draftSessions: { [leagueId: string]: DraftSession } = {};
// Global store of pending waiver claims
let waiverClaims: WaiverClaim[] = [];
// Global store of matchups by leagueId
let matchups: { [leagueId: string]: Matchup[] } = {};

function resetPlatformState() {
  globalPlayers = JSON.parse(JSON.stringify(INITIAL_MOCK_PLAYERS));
  leagues = [];
  waiverClaims = [];
  matchups = {};
  draftSessions = {};
  notifications = [
    {
      id: 'notif-1',
      title: 'Welcome to Draft Fantasy!',
      message: 'Set up your first league to host a live Snake Draft and compete head-to-head.',
      type: 'System',
      timestamp: new Date().toISOString(),
      read: false
    }
  ];
  seedDemoLeague();
}

// Invoke Seeder initial
seedDemoLeague();

// ==========================================
// DRAFT ENGINE TIMER & SERPENTINE GEN UTILS
// ==========================================
function getSnakeDraftPickerId(session: DraftSession, totalTeamSpots: number): string {
  const numTeams = session.order.length;
  const pickIndex = session.currentPickIndex;
  
  const round = Math.floor(pickIndex / numTeams) + 1;
  const isReverseRound = round % 2 === 0;
  
  const roundPickOffset = pickIndex % numTeams;
  
  if (isReverseRound) {
    // Serpentine reverse: (4 -> 3 -> 2 -> 1)
    return session.order[numTeams - 1 - roundPickOffset];
  } else {
    // Serpentine forward: (1 -> 2 -> 3 -> 4)
    return session.order[roundPickOffset];
  }
}

// Bot auto drafting decision tree
function selectBotOptimalDraftPick(team: Team, playerPool: Player[]): Player {
  const currentRosterSize = team.activePlayerIds.length + team.benchPlayerIds.length;
  const rosterPositions = [...team.activePlayerIds, ...team.benchPlayerIds].map(id => {
    return INITIAL_MOCK_PLAYERS.find(p => p.id === id)?.position;
  });

  const numGkps = rosterPositions.filter(p => p === 'GKP').length;
  const numDefs = rosterPositions.filter(p => p === 'DEF').length;
  const numMids = rosterPositions.filter(p => p === 'MID').length;
  const numFwds = rosterPositions.filter(p => p === 'FWD').length;

  // Prioritize based on squad balance
  // Goalies: limit 1-2
  let targetPos: PlayerPosition[] = ['FWD', 'MID', 'DEF', 'GKP'];
  
  if (numGkps >= 1) {
    targetPos = targetPos.filter(p => p !== 'GKP');
  }
  if (numFwds >= 3) {
    targetPos = targetPos.filter(p => p !== 'FWD');
  }
  if (numMids >= 4) {
    targetPos = targetPos.filter(p => p !== 'MID');
  }
  if (numDefs >= 4) {
    targetPos = targetPos.filter(p => p !== 'DEF');
  }

  // If we overfiltered, reset to any
  if (targetPos.length === 0) {
    targetPos = ['FWD', 'MID', 'DEF', 'GKP'];
  }

  const sortedCandidates = playerPool
    .filter(p => targetPos.includes(p.position))
    .sort((a, b) => b.points - a.points); // Pick based on historical highest points first!

  if (sortedCandidates.length > 0) {
    return sortedCandidates[0];
  }
  return playerPool[0]; // fallback
}

// Executes a draft pick
function executeDraftPick(leagueId: string, teamId: string, playerId: string): { success: boolean; message: string; pick?: DraftPick } {
  const session = draftSessions[leagueId];
  if (!session || session.status !== 'Active') {
    return { success: false, message: 'Draft is not active or not initialized.' };
  }

  const league = leagues.find(l => l.id === leagueId);
  if (!league) return { success: false, message: 'League not found.' };

  const player = globalPlayers.find(p => p.id === playerId);
  if (!player) return { success: false, message: 'Player not found.' };

  // Check unique ownership
  const isOwned = league.teams.some(t => 
    t.activePlayerIds.includes(playerId) || t.benchPlayerIds.includes(playerId)
  );
  if (isOwned) {
    return { success: false, message: 'Player is already drafted in this league.' };
  }

  const team = league.teams.find(t => t.id === teamId);
  if (!team) return { success: false, message: 'Team not found.' };

  // Drafting rules: 8 active + 3 bench = 11 players per team total
  const TOTAL_SPOTS_ALLOWED = 11;
  const currentTotal = team.activePlayerIds.length + team.benchPlayerIds.length;
  if (currentTotal >= TOTAL_SPOTS_ALLOWED) {
    return { success: false, message: `Team is fully stacked (max ${TOTAL_SPOTS_ALLOWED} players).` };
  }

  // Record the pick
  const pickNumber = session.currentPickIndex + 1;
  const round = Math.floor(session.currentPickIndex / session.order.length) + 1;
  
  const pick: DraftPick = {
    pickNumber,
    round,
    teamId,
    teamName: team.name,
    playerId: player.id,
    playerName: player.name,
    position: player.position
  };

  session.picks.push(pick);
  
  // Assign drafted player. Fit active pool first
  if (team.activePlayerIds.length < 8) {
    team.activePlayerIds.push(player.id);
  } else {
    team.benchPlayerIds.push(player.id);
  }

  // Auto captain assignment if empty
  if (!team.captainId) {
    team.captainId = player.id;
  } else if (!team.viceCaptainId) {
    team.viceCaptainId = player.id;
  }

  // Record in history log
  session.draftHistory.unshift({
    pickNumber,
    teamName: team.name,
    playerName: player.name,
    timestamp: new Date().toLocaleTimeString()
  });

  // Track on global players for availability
  updatePlayerOwnershipInState(player.id, team.id, team.name);

  // Inform of turn pick
  notifications.unshift({
    id: `notif-draft-${Date.now()}`,
    title: `Draft Pick #${pickNumber}`,
    message: `${team.name} drafted ${player.name} (${player.position}) in Round ${round}!`,
    type: 'Draft',
    timestamp: new Date().toISOString(),
    read: false
  });

  // Progress index
  session.currentPickIndex++;
  session.timerRemainingSeconds = session.timerDurationSeconds; // reset timer

  const totalPossiblePicks = session.order.length * TOTAL_SPOTS_ALLOWED;
  if (session.currentPickIndex >= totalPossiblePicks) {
    session.status = 'Completed';
    league.status = 'Active';
    
    // Setup initial Matchups for 3 Gameweeks!
    generateH2HFixtures(league);
    
    notifications.unshift({
      id: `notif-draft-comp-${Date.now()}`,
      title: 'Snake Draft Concluded!',
      message: `League ${league.name} is now ACTIVE! Manager squads are locked. Head-to-Head Matchups are scheduled.`,
      type: 'Draft',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  return { success: true, message: 'Draft pick recorded.', pick };
}

// Generate head-to-head fixtures with future kickoff dates
function generateH2HFixtures(league: League) {
  const teams = league.teams;
  const leagueId = league.id;

  if (teams.length >= 4) {
    matchups[leagueId] = buildStaticH2HMatchups(
      leagueId,
      teams.map(t => ({ id: t.id, name: t.name, username: t.username }))
    );
    return;
  }

  const listMatches: Matchup[] = [];
  if (teams.length >= 2) {
    listMatches.push({
      id: `m-gw1-1-${leagueId}`,
      leagueId,
      gameweek: 1,
      teamAId: teams[0].id,
      teamAName: teams[0].name,
      teamAManager: teams[0].username,
      teamAScore: 0,
      teamAPlayerPoints: {},
      teamBId: teams[1].id,
      teamBName: teams[1].name,
      teamBManager: teams[1].username,
      teamBScore: 0,
      teamBPlayerPoints: {},
      status: 'Upcoming',
      kickoffAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      venue: `Gameweek 1 — ${league.name}`,
    });
  }
  matchups[leagueId] = listMatches;
}

// Auto-run bot picks timer check endpoint or trigger loop
function runSimulatedBotPicksIfItsTheirTurn(leagueId: string) {
  const session = draftSessions[leagueId];
  if (!session || session.status !== 'Active') return;

  const currentPickerId = getSnakeDraftPickerId(session, 11);
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return;

  const currentMember = league.members.find(m => m.teamId === currentPickerId);
  if (currentMember && currentMember.isBot) {
    // Bot needs to pick!
    const availablePlayers = globalPlayers.filter(p => {
      return !league.teams.some(t => 
        t.activePlayerIds.includes(p.id) || t.benchPlayerIds.includes(p.id)
      );
    });

    if (availablePlayers.length > 0) {
      const team = league.teams.find(t => t.id === currentPickerId);
      if (team) {
        const selected = selectBotOptimalDraftPick(team, availablePlayers);
        executeDraftPick(leagueId, currentPickerId, selected.id);
        
        // Recurse to see if next picker is also a bot
        setTimeout(() => {
          runSimulatedBotPicksIfItsTheirTurn(leagueId);
        }, 100);
      }
    }
  }
}

// ==========================================
// DYNAMIC USER AUTHENTICATION STATE & SYNC
// ==========================================
let currentUser = {
  userId: 'user-current',
  username: 'Gaffer_Tejpal',
  email: 'tejpalsingh.rathore@yudiz.com',
  phone: '5551234567',
  isAuthenticated: true
};

function updateSeededUserIdentity(newUsername: string, newTeamName?: string) {
  currentUser.username = newUsername;
  currentUser.isAuthenticated = true;

  // Traverse leagues and update matching IDs
  leagues.forEach(league => {
    // 1. Update league member username
    const member = league.members.find(m => m.userId === 'user-current');
    if (member) {
      member.username = newUsername;
      if (newTeamName) {
        member.teamName = newTeamName;
      }
    }

    // 2. Update league team name and manager username
    const team = league.teams.find(t => t.userId === 'user-current');
    if (team) {
      team.username = newUsername;
      if (newTeamName) {
        team.name = newTeamName;
      }
    }

    // 3. Update standings team and manager name
    const standing = league.standings.find(s => s.teamId === 'team-user');
    if (standing) {
      standing.managerName = newUsername;
      if (newTeamName) {
        standing.teamName = newTeamName;
      }
    }
  });

  // Also update draft pick tracking records
  for (const session of Object.values(draftSessions)) {
    session.picks.forEach(p => {
      if (p.teamId === 'team-user' && newTeamName) {
        p.teamName = newTeamName;
      }
    });
    session.draftHistory.forEach(h => {
      if (h.teamName === 'Tejpal FC' && newTeamName) {
        h.teamName = newTeamName;
      }
    });
  }

  // Add system notification for brand new manager onboarding
  notifications.unshift({
    id: `notif-auth-${Date.now()}`,
    title: `Manager Profile Configured`,
    message: `${newUsername} successfully took charge${newTeamName ? ` of ${newTeamName}` : ''}!`,
    type: 'System',
    timestamp: new Date().toISOString(),
    read: false
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// GET current user state
app.get('/api/auth/me', (req, res) => {
  if (!currentUser.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  res.json(currentUser);
});

// POST send OTP (US 10-digit formats supported)
app.post('/api/auth/otp/send', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  
  // Format clean digts
  const cleanNum = phone.replace(/\D/g, '');
  // Since we require any US phone number of 10 digits:
  // e.g. +1 matches or any 10-digit number
  if (cleanNum.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit US phone number.' });
  }

  // Format phone output
  const formattedPhone = `+1 (${cleanNum.substring(0,3)}) ${cleanNum.substring(3,6)}-${cleanNum.substring(6)}`;

  // Log in-memory
  notifications.unshift({
    id: `notif-otp-${Date.now()}`,
    title: 'Security OTP Request',
    message: `A static verification code (123456) was dispatched to ${formattedPhone}`,
    type: 'System',
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json({
    success: true,
    message: `OTP successfully dispatched to ${formattedPhone}. Enter 123456 to verify.`,
    phone: formattedPhone
  });
});

// POST verify OTP & register or login
app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, otp, username, email, teamName } = req.body;
  
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone number and verification OTP are required.' });
  }

  const cleanNum = phone.replace(/\D/g, '');
  if (cleanNum.length !== 10) {
    return res.status(400).json({ error: 'Valid 10-digit US phone number is required.' });
  }

  if (otp !== '123456') {
    return res.status(400).json({ error: 'Incorrect OTP digit code. Use static fallback code: 123456' });
  }

  // Valid credentials: complete profile setup
  currentUser.phone = cleanNum;
  currentUser.isAuthenticated = true;

  if (username) {
    currentUser.username = username;
  }
  if (email) {
    currentUser.email = email;
  }

  // Trigger league database updates so dynamic user elements match custom profile
  updateSeededUserIdentity(currentUser.username, teamName);

  res.json({
    success: true,
    user: currentUser,
    message: 'Login session verified successfully.'
  });
});

// POST clear auth session and reset all platform data
app.post('/api/auth/logout', (req, res) => {
  resetPlatformState();
  currentUser = {
    userId: 'user-current',
    username: 'Gaffer_Tejpal',
    email: 'tejpalsingh.rathore@yudiz.com',
    phone: '5551234567',
    isAuthenticated: false
  };
  res.json({ success: true, message: 'Logged out successfully. All data reset to defaults.' });
});

// Legacy fallback handlers preserved for compatibility
app.post('/api/auth/login', (req, res) => {
  const { email, username } = req.body;
  const name = username || email.split('@')[0] || 'TejpalFC';
  updateSeededUserIdentity(name);
  res.json({
    token: 'mock-jwt-token-123456',
    userId: 'user-current',
    username: name,
    email: email || 'user@example.com'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, username } = req.body;
  const name = username || 'Gaffer_Tejpal';
  updateSeededUserIdentity(name);
  res.json({
    token: 'mock-jwt-token-registered',
    userId: 'user-current',
    username: name,
    email
  });
});

// GET notifications
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

// POST mark notif read
app.post('/api/notifications/:id/read', (req, res) => {
  const n = notifications.find(notif => notif.id === req.params.id);
  if (n) n.read = true;
  res.json({ success: true });
});

// GET global players
app.get('/api/players', (req, res) => {
  const { search, position, availableInLeagueId } = req.query;
  let pool = [...globalPlayers];

  if (availableInLeagueId) {
    const lg = leagues.find(l => l.id === availableInLeagueId);
    if (lg) {
      const ownedIds = new Set<string>();
      lg.teams.forEach(t => {
        t.activePlayerIds.forEach(id => ownedIds.add(id));
        t.benchPlayerIds.forEach(id => ownedIds.add(id));
      });
      pool = pool.filter(p => !ownedIds.has(p.id));
    }
  }

  if (search) {
    const q = String(search).toLowerCase();
    pool = pool.filter(p => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q));
  }

  if (position && position !== 'ALL') {
    pool = pool.filter(p => p.position === position);
  }

  res.json(pool);
});

// GET player details
app.get('/api/players/:id', (req, res) => {
  const player = globalPlayers.find(p => p.id === req.params.id);
  if (!player) {
    return res.status(404).json({ error: 'Player not found.' });
  }
  res.json(player);
});

// GET leagues
app.get('/api/leagues', (req, res) => {
  res.json(leagues);
});

// GET league details
app.get('/api/leagues/:id', (req, res) => {
  const lg = leagues.find(l => l.id === req.params.id);
  if (!lg) return res.status(404).json({ error: 'League not found.' });
  res.json(lg);
});

// POST Create League
app.post('/api/leagues', (req, res) => {
  const { name, maxTeams, goalPoints, assistPoints } = req.body;
  
  const creatorTeamId = 'team-user';
  const newLeagueId = `league-${Date.now()}`;
  const inviteCode = `LEAGUE${Math.floor(1000 + Math.random() * 9000)}`;

  const rules: ScoringTemplate = {
    ...DEFAULT_SCORING_TEMPLATE,
    goalGkpDef: Number(goalPoints) || 6,
    goalMid: Math.max(1, (Number(goalPoints) - 1)) || 5,
    goalFwd: Math.max(1, (Number(goalPoints) - 2)) || 4,
    assist: Number(assistPoints) || 3
  };

  const creatorMember: LeagueMember = {
    userId: 'user-current',
    username: 'Gaffer_Tejpal',
    teamId: creatorTeamId,
    teamName: `${name} United`,
    isHost: true,
    isBot: false,
    waiverPriority: 1
  };

  const newTeam: Team = {
    id: creatorTeamId,
    leagueId: newLeagueId,
    userId: 'user-current',
    username: 'Gaffer_Tejpal',
    name: `${name} United`,
    formation: '4-4-2',
    captainId: '',
    viceCaptainId: '',
    activePlayerIds: [],
    benchPlayerIds: []
  };

  const initialStandings: Standings = {
    teamId: creatorTeamId,
    teamName: `${name} United`,
    managerName: 'Gaffer_Tejpal',
    wins: 0,
    draws: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    points: 0,
    waiverPriority: 1
  };

  const league: League = {
    id: newLeagueId,
    name: name || 'The Elite League',
    logo: '🏆',
    inviteCode,
    maxTeams: Math.max(4, Math.min(16, Number(maxTeams) || 6)),
    status: 'Lobby',
    currentGameweek: 1,
    scoringRules: rules,
    members: [creatorMember],
    teams: [newTeam],
    standings: [initialStandings]
  };

  leagues.push(league);

  // Initial draft session placeholder
  draftSessions[newLeagueId] = {
    leagueId: newLeagueId,
    status: 'Upcoming',
    currentPickIndex: 0,
    timerDurationSeconds: 60,
    timerRemainingSeconds: 60,
    picks: [],
    order: [creatorTeamId],
    draftHistory: []
  };

  res.json(league);
});

// POST Join League via Invite Code
app.post('/api/leagues/join', (req, res) => {
  const { code } = req.body;
  const normalCode = String(code).trim().toUpperCase();
  const league = leagues.find(l => l.inviteCode === normalCode);
  
  if (!league) {
    return res.status(404).json({ error: 'Invalid invite code. League not found.' });
  }

  if (league.members.length >= league.maxTeams) {
    return res.status(400).json({ error: 'This league is already at maximum capacity.' });
  }

  // Generate randomized rival bots or names if required or join directly
  const joinerTeamId = `team-member-${Date.now()}`;
  const username = `Challenger_${league.members.length + 1}`;

  const joinerMember: LeagueMember = {
    userId: `user-joined-${Date.now()}`,
    username,
    teamId: joinerTeamId,
    teamName: `Royal ${username} FC`,
    isHost: false,
    isBot: false,
    waiverPriority: league.members.length + 1
  };

  const newTeam: Team = {
    id: joinerTeamId,
    leagueId: league.id,
    userId: joinerMember.userId,
    username,
    name: joinerMember.teamName,
    formation: '4-4-2',
    captainId: '',
    viceCaptainId: '',
    activePlayerIds: [],
    benchPlayerIds: []
  };

  league.members.push(joinerMember);
  league.teams.push(newTeam);
  league.standings.push({
    teamId: joinerTeamId,
    teamName: joinerMember.teamName,
    managerName: username,
    wins: 0,
    draws: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    points: 0,
    waiverPriority: league.members.length
  });

  // Sync draft order array to include joined user
  const ds = draftSessions[league.id];
  if (ds) {
    ds.order.push(joinerTeamId);
  }

  notifications.unshift({
    id: `notif-join-${Date.now()}`,
    title: 'New League Competitor!',
    message: `${username} joined your league "${league.name}"!`,
    type: 'System',
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json(league);
});

// POST Autofill League with Bots so user doesn't wait
app.post('/api/leagues/:id/members/bot', (req, res) => {
  const league = leagues.find(l => l.id === req.params.id);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  const numBotsNeeded = league.maxTeams - league.members.length;
  if (numBotsNeeded <= 0) {
    return res.status(400).json({ error: 'League is already full.' });
  }

  const botNames = [
    { user: 'Pep Guardiola Bot', team: 'Tiki Taka United' },
    { user: 'Jurgen Klopp Bot', team: 'Gegenpress City' },
    { user: 'Mikel Arteta Bot', team: 'The Arsenal Way' },
    { user: 'Carlo Ancelotti Bot', team: 'Real Football' },
    { user: 'Jose Mourinho Bot', team: 'Park The Bus' },
    { user: 'Unai Emery Bot', team: 'Good Ebening FC' }
  ];

  for (let i = 0; i < numBotsNeeded; i++) {
    const config = botNames[i % botNames.length];
    const uniqueSuffix = Math.floor(Math.random() * 90);
    const botUser = `${config.user} ${uniqueSuffix}`;
    const botTeamName = `${config.team} #${uniqueSuffix}`;
    const botTeamId = `team-bot-${Date.now()}-${i}`;
    const botUserId = `user-bot-${Date.now()}-${i}`;

    const member: LeagueMember = {
      userId: botUserId,
      username: botUser,
      teamId: botTeamId,
      teamName: botTeamName,
      isHost: false,
      isBot: true,
      waiverPriority: league.members.length + 1
    };

    const team: Team = {
      id: botTeamId,
      leagueId: league.id,
      userId: botUserId,
      username: botUser,
      name: botTeamName,
      formation: '4-4-2',
      captainId: '',
      viceCaptainId: '',
      activePlayerIds: [],
      benchPlayerIds: []
    };

    league.members.push(member);
    league.teams.push(team);
    league.standings.push({
      teamId: botTeamId,
      teamName: botTeamName,
      managerName: botUser,
      wins: 0,
      draws: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      points: 0,
      waiverPriority: league.members.length
    });

    const ds = draftSessions[league.id];
    if (ds) {
      ds.order.push(botTeamId);
    }
  }

  res.json(league);
});

// POST Update League Settings & Rules
app.post('/api/leagues/:id/settings', (req, res) => {
  const league = leagues.find(l => l.id === req.params.id);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  const { name, scoringRules } = req.body;
  if (name) league.name = name;
  if (scoringRules) {
    league.scoringRules = { ...league.scoringRules, ...scoringRules };
  }

  res.json(league);
});

// GET Draft session state
app.get('/api/leagues/:id/draft', (req, res) => {
  const session = draftSessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Draft session not found' });
  
  // Calculate who has the active pick based on snake draft index
  const nextPickerId = session.status === 'Active' ? getSnakeDraftPickerId(session, 11) : '';
  const league = leagues.find(l => l.id === req.params.id);
  const nextPickerName = league?.members.find(m => m.teamId === nextPickerId)?.username || '';
  const nextTeamName = league?.teams.find(t => t.id === nextPickerId)?.name || '';

  // Return augmented info helper
  res.json({
    ...session,
    nextPickerId,
    nextPickerName,
    nextTeamName,
    round: Math.floor(session.currentPickIndex / session.order.length) + 1,
    direction: (Math.floor(session.currentPickIndex / session.order.length) + 1) % 2 === 0 ? 'Reverse ↩' : 'Forward ↪'
  });
});

// POST Start drafting
app.post('/api/leagues/:id/draft/start', (req, res) => {
  const session = draftSessions[req.params.id];
  const league = leagues.find(l => l.id === req.params.id);
  if (!session || !league) return res.status(404).json({ error: 'Draft or League not found.' });

  session.status = 'Active';
  league.status = 'Drafting';
  session.currentPickIndex = 0;
  session.timerRemainingSeconds = session.timerDurationSeconds;

  notifications.unshift({
    id: `notif-start-${Date.now()}`,
    title: 'Snake Draft Commenced!',
    message: `Draft is now LIVE. ${league.name} is picking!`,
    type: 'Draft',
    timestamp: new Date().toISOString(),
    read: false
  });

  // Run initial trigger check in case bot or similar
  setTimeout(() => {
    runSimulatedBotPicksIfItsTheirTurn(league.id);
  }, 100);

  res.json({ success: true, session });
});

// POST Pick a player (User pick)
app.post('/api/leagues/:id/draft/pick', (req, res) => {
  const { teamId, playerId } = req.body;
  const leagueId = req.params.id;

  const result = executeDraftPick(leagueId, teamId, playerId);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  // Trigger bot simulation for any subsequent bot pick sequence
  setTimeout(() => {
    runSimulatedBotPicksIfItsTheirTurn(leagueId);
  }, 500);

  res.json(result);
});

// POST Auto-pick on timeout
app.post('/api/leagues/:id/draft/auto-pick', (req, res) => {
  const leagueId = req.params.id;
  const session = draftSessions[leagueId];
  if (!session || session.status !== 'Active') {
    return res.status(400).json({ error: 'Draft is inactive.' });
  }

  const currentPickerId = getSnakeDraftPickerId(session, 11);
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return res.status(404).json({ error: 'League not found' });

  // Get un-drafted players
  const available = globalPlayers.filter(p => {
    return !league.teams.some(t => 
      t.activePlayerIds.includes(p.id) || t.benchPlayerIds.includes(p.id)
    );
  });

  if (available.length > 0) {
    // Select goalie if team has none, or top available
    const team = league.teams.find(t => t.id === currentPickerId);
    const selected = team ? selectBotOptimalDraftPick(team, available) : available[0];
    const result = executeDraftPick(leagueId, currentPickerId, selected.id);

    // Trigger subsequent bot sequence
    setTimeout(() => {
      runSimulatedBotPicksIfItsTheirTurn(leagueId);
    }, 500);

    return res.json(result);
  }

  res.status(400).json({ error: 'No players available to draft.' });
});

// GET user team bench & lineups
app.get('/api/leagues/:id/team', (req, res) => {
  const league = leagues.find(l => l.id === req.params.id);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  // Return the team of current user
  const team = league.teams.find(t => t.userId === 'user-current') || league.teams[0];
  if (!team) return res.status(404).json({ error: 'Team roster not initialized.' });

  // Populate actual Player details
  const active = team.activePlayerIds.map(id => globalPlayers.find(p => p.id === id)).filter(Boolean);
  const bench = team.benchPlayerIds.map(id => globalPlayers.find(p => p.id === id)).filter(Boolean);

  res.json({
    team,
    active,
    bench
  });
});

// POST save lineup substitution
app.post('/api/leagues/:id/team/lineup', (req, res) => {
  const league = leagues.find(l => l.id === req.params.id);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  const team = league.teams.find(t => t.userId === 'user-current') || league.teams[0];
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  const { activePlayerIds, benchPlayerIds, formation } = req.body;

  if (activePlayerIds) team.activePlayerIds = activePlayerIds;
  if (benchPlayerIds) team.benchPlayerIds = benchPlayerIds;
  if (formation) team.formation = formation;

  res.json({ success: true, team });
});

// POST save captain / vice-captain
app.post('/api/leagues/:id/team/captain', (req, res) => {
  const league = leagues.find(l => l.id === req.params.id);
  if (!league) return res.status(404).json({ error: 'League not found' });

  const team = league.teams.find(t => t.userId === 'user-current') || league.teams[0];
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  const { captainId, viceCaptainId } = req.body;
  if (captainId) team.captainId = captainId;
  if (viceCaptainId) team.viceCaptainId = viceCaptainId;

  res.json({ success: true, team });
});

// GET Waivers status
app.get('/api/leagues/:id/waivers', (req, res) => {
  const leagueId = req.params.id;
  const claims = waiverClaims.filter(c => c.leagueId === leagueId);
  const league = leagues.find(l => l.id === leagueId);

  // Sorting columns
  res.json({
    claims,
    teamPriorityList: league?.standings
      .slice()
      .sort((a, b) => a.waiverPriority - b.waiverPriority)
      .map(s => ({
        teamName: s.teamName,
        managerName: s.managerName,
        priority: s.waiverPriority
      })) || []
  });
});

// POST propose Waiver Claim
app.post('/api/leagues/:id/waivers/submit', (req, res) => {
  const leagueId = req.params.id;
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  const { playerToDropId, playerToAddId } = req.body;

  const team = league.teams.find(t => t.userId === 'user-current') || league.teams[0];
  if (!team) return res.status(400).json({ error: 'Team not set up.' });

  const toDrop = globalPlayers.find(p => p.id === playerToDropId);
  const toAdd = globalPlayers.find(p => p.id === playerToAddId);

  if (!toDrop || !toAdd) {
    return res.status(400).json({ error: 'Invalid player choices for waiver drop/add.' });
  }

  // Find standings priority
  const scoreCard = league.standings.find(s => s.teamId === team.id);
  const currentPriority = scoreCard ? scoreCard.waiverPriority : 99;

  const newClaim: WaiverClaim = {
    id: `claim-${Date.now()}`,
    leagueId,
    teamId: team.id,
    teamName: team.name,
    playerToDropId: toDrop.id,
    playerToDropName: toDrop.name,
    playerToAddId: toAdd.id,
    playerToAddName: toAdd.name,
    status: 'Pending',
    priorityValue: currentPriority,
    timestamp: new Date().toISOString()
  };

  waiverClaims.push(newClaim);

  notifications.unshift({
    id: `notif-waiver-sub-${Date.now()}`,
    title: 'Waiver Claim Proposed',
    message: `${team.name} requested to claim ${toAdd.name} and drop ${toDrop.name}.`,
    type: 'Waiver',
    timestamp: new Date().toISOString(),
    read: false
  });

  res.json(newClaim);
});

// DELETE Cancel Waiver
app.delete('/api/leagues/:id/waivers/:claimId', (req, res) => {
  waiverClaims = waiverClaims.filter(c => c.id !== req.params.claimId);
  res.json({ success: true });
});

// POST Resolve Reverse-Order Waivers
app.post('/api/leagues/:id/waivers/process', (req, res) => {
  const leagueId = req.params.id;
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  // Filter pending claims
  const claims = waiverClaims.filter(c => c.leagueId === leagueId && c.status === 'Pending');
  if (claims.length === 0) {
    return res.json({ success: true, processedCount: 0, logs: ['No pending waiver requests to process.'] });
  }

  // Sort claims based on the team's standing waiver priority
  // Lower standing points = higher priority (value 1 is top, 2 is next, etc.)
  const teamPriorityMap: { [teamId: string]: number } = {};
  league.standings.forEach(s => {
    teamPriorityMap[s.teamId] = s.waiverPriority;
  });

  claims.sort((a, b) => {
    const priorityA = teamPriorityMap[a.teamId] || 99;
    const priorityB = teamPriorityMap[b.teamId] || 99;
    return priorityA - priorityB; // 1 resolves before 4
  });

  const logs: string[] = [];
  let processedCount = 0;

  for (const claim of claims) {
    const currentPriority = teamPriorityMap[claim.teamId] || 99;
    
    // Check if player to add is currently in-draft and not owned by anyone else
    const isPlayerToAddOwned = league.teams.some(team => 
      team.activePlayerIds.includes(claim.playerToAddId) || 
      team.benchPlayerIds.includes(claim.playerToAddId)
    );

    if (isPlayerToAddOwned) {
      claim.status = 'Failed';
      claim.failureReason = 'Requested player was already acquired by another manager.';
      logs.push(`Claim #${claim.id} Failed: ${claim.playerToAddName} was already snapped up.`);
      continue;
    }

    const team = league.teams.find(t => t.id === claim.teamId);
    if (!team) {
      claim.status = 'Failed';
      claim.failureReason = 'Team roster not configured.';
      continue;
    }

    // Verify team actually owns the drop player
    const activeIdx = team.activePlayerIds.indexOf(claim.playerToDropId);
    const benchIdx = team.benchPlayerIds.indexOf(claim.playerToDropId);

    if (activeIdx === -1 && benchIdx === -1) {
      claim.status = 'Failed';
      claim.failureReason = 'Drafted player to drop is no longer on team.';
      logs.push(`Claim #${claim.id} Failed: Drop candidate ${claim.playerToDropName} not on roster.`);
      continue;
    }

    // Swap players!
    if (activeIdx !== -1) {
      team.activePlayerIds[activeIdx] = claim.playerToAddId;
    } else if (benchIdx !== -1) {
      team.benchPlayerIds[benchIdx] = claim.playerToAddId;
    }

    // Assign captain safety
    if (team.captainId === claim.playerToDropId) {
      team.captainId = claim.playerToAddId;
    }
    if (team.viceCaptainId === claim.playerToDropId) {
      team.viceCaptainId = claim.playerToAddId;
    }

    // Mark previous as un-owned, and new as owned
    updatePlayerOwnershipInState(claim.playerToDropId, undefined, undefined);
    updatePlayerOwnershipInState(claim.playerToAddId, team.id, team.name);

    claim.status = 'Successful';
    processedCount++;
    logs.push(`Claim SUCCESSFUL: ${claim.teamName} acquired ${claim.playerToAddName} and released ${claim.playerToDropName}.`);

    notifications.unshift({
      id: `notif-waiver-ok-${Date.now()}`,
      title: 'Waiver Claim Successful!',
      message: `${claim.teamName} has successfully acquired ${claim.playerToAddName} off waivers.`,
      type: 'Waiver',
      timestamp: new Date().toISOString(),
      read: false
    });

    // Move successful team to lowest priority (which is count of teams)
    const originalPriority = teamPriorityMap[claim.teamId];
    const maxPriority = league.members.length;

    league.standings.forEach(s => {
      if (s.teamId === claim.teamId) {
        s.waiverPriority = maxPriority;
      } else if (s.waiverPriority > originalPriority) {
        s.waiverPriority = s.waiverPriority - 1;
      }
    });

    // Refresh priority cache for remaining claims in iteration
    league.standings.forEach(s => {
      teamPriorityMap[s.teamId] = s.waiverPriority;
    });
  }

  res.json({ success: true, processedCount, logs });
});

// GET Matchups list
app.get('/api/leagues/:id/matchups', (req, res) => {
  const leagueId = req.params.id;
  let fixtures = matchups[leagueId] || [];
  if (fixtures.length === 0) {
    const league = leagues.find(l => l.id === leagueId);
    if (league && league.teams.length >= 4) {
      fixtures = buildStaticH2HMatchups(
        leagueId,
        league.teams.map(t => ({ id: t.id, name: t.name, username: t.username }))
      );
      matchups[leagueId] = fixtures;
    }
  }
  res.json(fixtures);
});

// POST SIMULATE FANTASY GAMEWEEK
app.post('/api/leagues/:id/simulate-gw', (req, res) => {
  const leagueId = req.params.id;
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return res.status(404).json({ error: 'League not found.' });

  const activeFixtures = matchups[leagueId]?.filter(m => m.gameweek === league.currentGameweek);
  if (!activeFixtures || activeFixtures.length === 0) {
    return res.status(400).json({ error: `No scheduled matchups found for Gameweek ${league.currentGameweek}.` });
  }

  const logs: string[] = [];

  // Generate simulated stats for all players active in the league's teams
  // We'll update players' stats and calculate their raw scores
  const scoring = league.scoringRules;
  const gameweekScorecard: { [playerId: string]: number } = {};

  // Gather all players drafted in this league
  const leaguePlayerIds = new Set<string>();
  league.teams.forEach(t => {
    t.activePlayerIds.forEach(id => leaguePlayerIds.add(id));
    t.benchPlayerIds.forEach(id => leaguePlayerIds.add(id));
  });

  // Calculate scores for each active player
  globalPlayers.forEach(p => {
    if (!leaguePlayerIds.has(p.id)) return;

    if (p.injuryStatus === 'Injured' || p.injuryStatus === 'Suspended') {
      // 0 minutes played / 0 points
      gameweekScorecard[p.id] = 0;
      p.recentPoints.unshift(0);
      return;
    }

    // Simulate standard base scoring events
    let simulatedGoals = 0;
    let simulatedAssists = 0;
    let simulatedCleanSheet = Math.random() > 0.4 ? 1 : 0;
    let simulatedSaves = p.position === 'GKP' ? Math.floor(Math.random() * 6) + 1 : 0;
    let simulatedYellow = Math.random() > 0.8 ? 1 : 0;
    let simulatedRed = Math.random() > 0.96 ? 1 : 0;

    if (p.position === 'FWD') {
      simulatedGoals = Math.random() > 0.5 ? (Math.random() > 0.8 ? 2 : 1) : 0;
      simulatedAssists = Math.random() > 0.6 ? 1 : 0;
      simulatedCleanSheet = 0;
    } else if (p.position === 'MID') {
      simulatedGoals = Math.random() > 0.65 ? 1 : 0;
      simulatedAssists = Math.random() > 0.5 ? (Math.random() > 0.85 ? 2 : 1) : 0;
    } else if (p.position === 'DEF') {
      simulatedGoals = Math.random() > 0.9 ? 1 : 0;
      simulatedAssists = Math.random() > 0.8 ? 1 : 0;
    }

    // Sum points using standard rules configuration
    let ptSum = 2; // Appearance points (2 pts playing 60+ minutes)
    
    if (simulatedGoals > 0) {
      const perGoal = p.position === 'FWD' ? scoring.goalFwd : (p.position === 'MID' ? scoring.goalMid : scoring.goalGkpDef);
      ptSum += simulatedGoals * perGoal;
    }
    ptSum += simulatedAssists * scoring.assist;
    
    if (simulatedCleanSheet > 0) {
      if (p.position === 'DEF' || p.position === 'GKP') {
        ptSum += scoring.cleanSheetGkpDef;
      } else if (p.position === 'MID') {
        ptSum += scoring.cleanSheetMid;
      }
    }

    if (p.position === 'GKP') {
      ptSum += Math.floor(simulatedSaves / 3) * scoring.saveGkp;
      if (Math.random() > 0.95) ptSum += scoring.penaltySave; // rare goalie penalty save!
    }

    ptSum += simulatedYellow * scoring.yellowCard;
    ptSum += simulatedRed * scoring.redCard;

    // Save back to player state
    p.goals += simulatedGoals;
    p.assists += simulatedAssists;
    p.cleanSheets += (p.position !== 'FWD') ? simulatedCleanSheet : 0;
    p.saves += simulatedSaves;
    p.yellowCards += simulatedYellow;
    p.redCards += simulatedRed;
    p.points += ptSum;
    
    // Track recent performance over history
    p.recentPoints.unshift(ptSum);
    if (p.recentPoints.length > 5) p.recentPoints.pop();

    gameweekScorecard[p.id] = ptSum;

    if (simulatedGoals > 0 || simulatedAssists > 0) {
      logs.push(`${p.name} (${p.club}): Simulated ${simulatedGoals} goals, ${simulatedAssists} assists → ${ptSum} pts.`);
    }
  });

  // Score Matchups
  activeFixtures.forEach(m => {
    const teamA = league.teams.find(t => t.id === m.teamAId);
    const teamB = league.teams.find(t => t.id === m.teamBId);

    if (teamA && teamB) {
      let teamAScore = 0;
      const teamAPoints: { [id: string]: number } = {};
      
      teamA.activePlayerIds.forEach(id => {
        let pScore = gameweekScorecard[id] || 0;
        // Double points if Captain!
        if (id === teamA.captainId) {
          pScore = pScore * 2;
        }
        teamAScore += pScore;
        teamAPoints[id] = pScore;
      });

      let teamBScore = 0;
      const teamBPoints: { [id: string]: number } = {};
      
      teamB.activePlayerIds.forEach(id => {
        let pScore = gameweekScorecard[id] || 0;
        if (id === teamB.captainId) {
          pScore = pScore * 2;
        }
        teamBScore += pScore;
        teamBPoints[id] = pScore;
      });

      m.teamAScore = teamAScore;
      m.teamAPlayerPoints = teamAPoints;
      m.teamBScore = teamBScore;
      m.teamBPlayerPoints = teamBPoints;
      m.status = 'Completed';

      // Update league standings
      const stdA = league.standings.find(s => s.teamId === m.teamAId);
      const stdB = league.standings.find(s => s.teamId === m.teamBId);

      if (stdA && stdB) {
        stdA.pointsFor += teamAScore;
        stdA.pointsAgainst += teamBScore;
        stdB.pointsFor += teamBScore;
        stdB.pointsAgainst += teamAScore;

        if (teamAScore > teamBScore) {
          stdA.wins += 1;
          stdA.points += 3;
          stdB.losses += 1;
        } else if (teamBScore > teamAScore) {
          stdB.wins += 1;
          stdB.points += 3;
          stdA.losses += 1;
        } else {
          stdA.draws += 1;
          stdA.points += 1;
          stdB.draws += 1;
          stdB.points += 1;
        }
      }
    }
  });

  // Calculate Reverse-Order Waiver Priority based on current bottom-up standings points
  // Lowest ranked team (lowest points, or lowest pointsFor as tiebreaker) secures highest priority (priority = 1)
  const standingsRef = [...league.standings];
  
  // Sort standings to find bottom team to top team
  // Standings sort order is normally: Points DESC, PointsFor DESC.
  // Standings prioritized in waivers is reverse of standings hierarchy!
  standingsRef.sort((a, b) => {
    if (a.points !== b.points) {
      return a.points - b.points; // ascending (lowest points is bottom)
    }
    return a.pointsFor - b.pointsFor; // ascending (lowest pointsFor is bottom tiebreaker)
  });

  // Assign waiver priority from bottom to top
  // standingsRef[0] is the absolute lowest team → gets waiver priority 1
  standingsRef.forEach((std, index) => {
    const origStandings = league.standings.find(s => s.teamId === std.teamId);
    if (origStandings) {
      origStandings.waiverPriority = index + 1; // 1 to length
    }
  });

  notifications.unshift({
    id: `notif-match-${Date.now()}`,
    title: `Gameweek ${league.currentGameweek} Concluded!`,
    message: `Gameweek results have been calculated. Standings and waiver priorities have been dynamically adjusted. Check matchups to view performance details.`,
    type: 'Matchup',
    timestamp: new Date().toISOString(),
    read: false
  });

  // Advance gameweek
  league.currentGameweek += 1;

  res.json({
    success: true,
    nextGameweek: league.currentGameweek,
    logs
  });
});

// POST reset state back to fresh seeder
app.post('/api/admin/reset', (req, res) => {
  resetPlatformState();
  notifications.unshift({
    id: 'notif-reset',
    title: 'Database Reset Successfully',
    message: 'All custom drafts, waiver logs, and standings have been reset back to seeded standards.',
    type: 'System',
    timestamp: new Date().toISOString(),
    read: false
  });
  currentUser.isAuthenticated = false;
  res.json({ success: true, message: 'Platform data format reset to default initial seed.' });
});


// ==========================================
// STATIC FRONTEND ROUTING & VITE MIDDLEWARE
// ==========================================
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for lightning-fast frontend bundling
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled output inside container
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Premier League Draft Fantasy Server listining on http://0.0.0.0:${PORT}`);
  });
}

runServer();
