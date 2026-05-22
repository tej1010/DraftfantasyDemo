export type PlayerPosition = 'GKP' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string; // e.g. "haarland-09"
  name: string;
  club: string;
  position: PlayerPosition;
  avatarUrl?: string;
  injuryStatus: 'Available' | 'Doubtful' | 'Injured' | 'Suspended';
  injuryDetails?: string;
  news?: string;
  
  // Real world stats or gameweek stats
  goals: number;
  assists: number;
  cleanSheets: number;
  saves: number;
  penaltiesSaved: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  penaltiesMissed: number;
  
  // Calculated / live fantasy stats
  points: number;
  recentPoints: number[]; // Points over last 5 simulated gws
  ownershipStatus: {
    isOwned: boolean;
    ownedByTeamId?: string;
    ownedByTeamName?: string;
  };
}

export interface ScoringTemplate {
  goalGkpDef: number; // e.g. 6 pts
  goalMid: number;    // e.g. 5 pts
  goalFwd: number;    // e.g. 4 pts
  assist: number;     // e.g. 3 pts
  cleanSheetGkpDef: number; // e.g. 4 pts
  cleanSheetMid: number;    // e.g. 1 pt
  saveGkp: number;        // e.g. 1 pt per 3 saves
  penaltySave: number;    // e.g. 5 pts
  yellowCard: number;     // e.g. -1 pt
  redCard: number;        // e.g. -3 pts
  ownGoal: number;        // e.g. -2 pts
  penaltyMissed: number;  // e.g. -2 pts
}

export const DEFAULT_SCORING_TEMPLATE: ScoringTemplate = {
  goalGkpDef: 6,
  goalMid: 5,
  goalFwd: 4,
  assist: 3,
  cleanSheetGkpDef: 4,
  cleanSheetMid: 1,
  saveGkp: 1, // simplified to 1 pt per save in simulation or per 3 saves
  penaltySave: 5,
  yellowCard: -1,
  redCard: -3,
  ownGoal: -2,
  penaltyMissed: -2
};

export interface LeagueMember {
  userId: string;
  username: string;
  teamId: string;
  teamName: string;
  avatarUrl?: string;
  isHost: boolean;
  isBot: boolean;
  waiverPriority: number; // 1 is highest priority, higher numbers are lower priority
}

export interface Team {
  id: string;
  leagueId: string;
  userId: string;
  username: string; // Manager's name
  name: string; // Team name
  logoUrl?: string;
  
  formation: string; // e.g. "4-4-2", "4-3-3", "3-5-2", "3-4-3", "5-3-2"
  captainId: string; // Unique captain
  viceCaptainId: string;

  // Selected player IDs divided by active lineup vs bench
  activePlayerIds: string[]; // Length counts depend on formation
  benchPlayerIds: string[];  // Subbed out / reserves
}

export interface DraftPick {
  pickNumber: number; // 1 to (number of teams * teamSize)
  round: number;      // 1 to teamSize
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  position: PlayerPosition;
}

export interface DraftSession {
  leagueId: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  currentPickIndex: number; // Index in the sequence order
  timerDurationSeconds: number; // Time per pick (e.g., 60s)
  timerRemainingSeconds: number;
  picks: DraftPick[]; // List of executed picks
  order: string[]; // List of team IDs representing Round 1 snake ordering (1 -> 2 -> 3 -> 4)
  draftHistory: {
    pickNumber: number;
    teamName: string;
    playerName: string;
    timestamp: string;
  }[];
}

export interface WaiverClaim {
  id: string;
  leagueId: string;
  teamId: string;
  teamName: string;
  playerToDropId: string;
  playerToDropName: string;
  playerToAddId: string;
  playerToAddName: string;
  status: 'Pending' | 'Successful' | 'Failed' | 'Canceled';
  priorityValue: number; // Captured priority value of the team at submission
  timestamp: string;
  failureReason?: string;
}

export interface Matchup {
  id: string;
  leagueId: string;
  gameweek: number;
  teamAId: string;
  teamAName: string;
  teamAManager: string;
  teamAScore: number; // Simulated points scored by team A's active players
  teamAPlayerPoints: { [playerId: string]: number }; // Detailed players scores
  
  teamBId: string;
  teamBName: string;
  teamBManager: string;
  teamBScore: number; // Simulated points scored by team B's active players
  teamBPlayerPoints: { [playerId: string]: number }; // Detailed players scores
  
  status: 'Upcoming' | 'Live' | 'Completed';
}

export interface Standings {
  teamId: string;
  teamName: string;
  managerName: string;
  wins: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  points: number; // wins * 3 + draws * 1
  waiverPriority: number;
}

export interface League {
  id: string;
  name: string;
  logo: string;
  inviteCode: string;
  maxTeams: number; // 6 to 16
  status: 'Lobby' | 'Drafting' | 'Active' | 'Finished';
  currentGameweek: number;
  
  // Custom Scoring parameters
  scoringRules: ScoringTemplate;
  
  members: LeagueMember[];
  teams: Team[];
  standings: Standings[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Draft' | 'Waiver' | 'Matchup' | 'Injury' | 'System';
  timestamp: string;
  read: boolean;
}

export interface DashboardResponse {
  userLeagues: League[];
  upcomingMatchups: Matchup[];
  globalPlayers: Player[];
  notifications: Notification[];
}
