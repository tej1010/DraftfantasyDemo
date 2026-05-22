import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Trophy, Users, Calendar, ArrowLeftRight, Search, Sparkles, 
  Bell, Play, RotateCcw, AlertTriangle, ShieldCheck, 
  HelpCircle, LogIn, ChevronRight, CheckCircle2, User, 
  Plus, Minus, RefreshCw, Star, Info, ListFilter, Trash2, Send, DollarSign, Wallet,
  Newspaper, Activity, ChevronLeft, Pause, Clock, Lock, X
} from 'lucide-react';
import { 
  Player, League, Team, DraftPick, DraftSession, 
  WaiverClaim, FwwbBid, FwwbTeamBudget, Matchup, Standings, Notification, ScoringTemplate, 
  PlayerPosition, LeagueMember, DEFAULT_SCORING_TEMPLATE 
} from './types';
import DfsPlayerStatsModal from './components/DfsPlayerStatsModal';
import DfsLineupConfirmationScreen from './components/DfsLineupConfirmationScreen';
import TacticalSquadPitch from './components/TacticalSquadPitch';
import PremierLeagueLogosBackdrop from './components/PremierLeagueLogosBackdrop';
import {
  STATIC_DROP_PLAYERS,
  STATIC_ADD_PLAYERS,
  STATIC_WAIVER_PRIORITY,
  STATIC_SEED_CLAIMS,
  buildStaticWaiverClaim,
} from './data/staticWaiverData';
import { buildStaticH2HMatchups, formatMatchupKickoff } from './data/staticMatchups';
import { FWWB_MIN_BID, STATIC_FWWB_BUDGETS, STATIC_FWWB_SEED_BIDS, buildStaticFwwbBid } from './data/staticFwwbData';
import { STATIC_FEED_UPDATES } from './data/staticFeedUpdates';
import * as staticStore from './services/staticStore';

interface RealWorldFixture {
  id: string;
  gameweek: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode: string;
  awayTeamCode: string;
  date: string;
  time: string;
  venue: string;
  hotAssets: { name: string; position: string; points: number }[];
}

const REAL_WORLD_FIXTURES: RealWorldFixture[] = [
  // GW 1
  {
    id: 'rw-1',
    gameweek: 1,
    homeTeam: 'Liverpool',
    awayTeam: 'Man United',
    homeTeamCode: 'LIV',
    awayTeamCode: 'MUN',
    date: 'Saturday, May 23, 2026',
    time: '12:30 BST',
    venue: 'Anfield',
    hotAssets: [
      { name: 'Mohamed Salah', position: 'MID', points: 211 },
      { name: 'Bruno Fernandes', position: 'MID', points: 154 }
    ]
  },
  {
    id: 'rw-2',
    gameweek: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeTeamCode: 'ARS',
    awayTeamCode: 'CHE',
    date: 'Saturday, May 23, 2026',
    time: '15:00 BST',
    venue: 'Emirates Stadium',
    hotAssets: [
      { name: 'Bukayo Saka', position: 'MID', points: 198 },
      { name: 'Cole Palmer', position: 'MID', points: 184 }
    ]
  },
  {
    id: 'rw-3',
    gameweek: 1,
    homeTeam: 'Man City',
    awayTeam: 'Tottenham',
    homeTeamCode: 'MCI',
    awayTeamCode: 'TOT',
    date: 'Sunday, May 24, 2026',
    time: '16:30 BST',
    venue: 'Etihad Stadium',
    hotAssets: [
      { name: 'Erling Haaland', position: 'FWD', points: 217 },
      { name: 'Son Heung-min', position: 'MID', points: 148 }
    ]
  },
  // GW 2
  {
    id: 'rw-4',
    gameweek: 2,
    homeTeam: 'Chelsea',
    awayTeam: 'Liverpool',
    homeTeamCode: 'CHE',
    awayTeamCode: 'LIV',
    date: 'Saturday, May 30, 2026',
    time: '17:30 BST',
    venue: 'Stamford Bridge',
    hotAssets: [
      { name: 'Cole Palmer', position: 'MID', points: 184 },
      { name: 'Mohamed Salah', position: 'MID', points: 211 }
    ]
  },
  {
    id: 'rw-5',
    gameweek: 2,
    homeTeam: 'Man United',
    awayTeam: 'Man City',
    homeTeamCode: 'MUN',
    awayTeamCode: 'MCI',
    date: 'Sunday, May 31, 2026',
    time: '14:00 BST',
    venue: 'Old Trafford',
    hotAssets: [
      { name: 'Bruno Fernandes', position: 'MID', points: 154 },
      { name: 'Erling Haaland', position: 'FWD', points: 217 }
    ]
  },
  {
    id: 'rw-6',
    gameweek: 2,
    homeTeam: 'Tottenham',
    awayTeam: 'Aston Villa',
    homeTeamCode: 'TOT',
    awayTeamCode: 'AVL',
    date: 'Sunday, May 31, 2026',
    time: '16:30 BST',
    venue: 'Tottenham Hotspur Stadium',
    hotAssets: [
      { name: 'Son Heung-min', position: 'MID', points: 148 },
      { name: 'Ollie Watkins', position: 'FWD', points: 159 }
    ]
  },
  // GW 3
  {
    id: 'rw-7',
    gameweek: 3,
    homeTeam: 'Arsenal',
    awayTeam: 'Man City',
    homeTeamCode: 'ARS',
    awayTeamCode: 'MCI',
    date: 'Saturday, June 6, 2026',
    time: '12:30 BST',
    venue: 'Emirates Stadium',
    hotAssets: [
      { name: 'Bukayo Saka', position: 'MID', points: 198 },
      { name: 'Erling Haaland', position: 'FWD', points: 217 }
    ]
  },
  {
    id: 'rw-8',
    gameweek: 3,
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    homeTeamCode: 'LIV',
    awayTeamCode: 'CHE',
    date: 'Sunday, June 7, 2026',
    time: '16:30 BST',
    venue: 'Anfield',
    hotAssets: [
      { name: 'Mohamed Salah', position: 'MID', points: 211 },
      { name: 'Cole Palmer', position: 'MID', points: 184 }
    ]
  }
];

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'injury' | 'transfer' | 'stats' | 'general';
  team: string;
  teamCode: string;
  playerRelated?: string;
  statusBadge?: string;
  publishedAt: string;
  severity: 'high' | 'medium' | 'low';
}

export const REAL_WORLD_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Cole Palmer Hamstring Injury Tweak in Training',
    summary: 'Maresca issues cautious assessment on Palmer’s fitness check ahead of Arsenal showdown.',
    content: 'Chelsea medical officers reported minor hamstring soreness following Thursday’s session. Enzo Maresca explained: "Cole is extremely elite, but we cannot risk long-term tier strains. A late fitness exam on Saturday morning will decide if he starts on the wing." This news sends draft managers into high alert.',
    category: 'injury',
    team: 'Chelsea',
    teamCode: 'CHE',
    playerRelated: 'Cole Palmer',
    statusBadge: '⚠️ Doubtful (75% Fit)',
    publishedAt: '2 hours ago',
    severity: 'high'
  },
  {
    id: 'news-2',
    title: 'Mohamed Salah Position Transition: Slot’s Tactical Centerpiece',
    summary: 'Arne Slot plans to deploy Salah as a direct vanguard striker rather than traditional winger.',
    content: 'Liverpool Manager Arne Slot intends to overload Manchester United’s defensive line by moving Mohamed Salah into the central number nine channel on Saturday. "Salah has superior precision in the box," Slot mentioned. Fantasy scout statistics indicate his points-per-minute value triples when deployed centrally.',
    category: 'general',
    team: 'Liverpool',
    teamCode: 'LIV',
    playerRelated: 'Mohamed Salah',
    statusBadge: '🔥 In-Form',
    publishedAt: '4 hours ago',
    severity: 'medium'
  },
  {
    id: 'news-3',
    title: 'Bukayo Saka Fully Cleared After Knee Bruise Scare',
    summary: 'Great news for Gunners fans as Bukayo Saka participates in complete high-intensity training.',
    content: 'Saka has returned to full, unrestricted squad drills at London Colney. After a precautionary scan on his left meniscus came back completely clear, Mikel Arteta confirmed: "Bukayo is hungry and 100% prepared to host Chelsea." Expect Saka to occupy the starting XI.',
    category: 'injury',
    team: 'Arsenal',
    teamCode: 'ARS',
    playerRelated: 'Bukayo Saka',
    statusBadge: '✅ Cleared Fit',
    publishedAt: '5 hours ago',
    severity: 'low'
  },
  {
    id: 'news-4',
    title: 'Erling Haaland Record Battle: Simulated Scouting Metrics Sparkle',
    summary: 'City forward logs standard-breaking fitness outputs in the pre-gameweek drill protocols.',
    content: 'According to City’s local scouting metrics, Erling Haaland has maintained peak performance scores, averaging 1.4 xG per simulated 90-minute session. Spacing analysts suggest Tottenham’s aggressive high-line defensive strategy is extremely vulnerable to Haaland’s direct runs.',
    category: 'stats',
    team: 'Man City',
    teamCode: 'MCI',
    playerRelated: 'Erling Haaland',
    statusBadge: '⚡ Peak Form',
    publishedAt: 'Yesterday',
    severity: 'medium'
  },
  {
    id: 'news-5',
    title: 'Bruno Fernandes Contract Extension Talks Verified',
    summary: 'Manchester United locks Portuguese talisman into long-term system strategies.',
    content: 'The board at Old Trafford has finalized a long-term contract renewal for Bruno Fernandes. Captain Bruno expressed high dedication: "We are building something exceptional under this draft cycle. Our duty is to return United key silverware." Scout analysts expect Fernandes to play 100% of league minutes.',
    category: 'transfer',
    team: 'Man United',
    teamCode: 'MUN',
    playerRelated: 'Bruno Fernandes',
    statusBadge: '✍️ Signed Deal',
    publishedAt: 'Yesterday',
    severity: 'low'
  },
  {
    id: 'news-6',
    title: 'Son Heung-min Hamstring Strain Recovery Protocol',
    summary: 'Ange Postecoglou indicates Son is on a strict half-session restriction to prevent relapse.',
    content: 'Spurs captain Son Heung-min is undergoing customized acceleration tests. Postecoglou noted: "Son is vital, but we have to manage his mechanical workload. He might start on the bench or play a restricted 60 minutes." Draft picks owners should evaluate substitutions.',
    category: 'injury',
    team: 'Tottenham',
    teamCode: 'TOT',
    playerRelated: 'Son Heung-min',
    statusBadge: '⚠️ Monitored',
    publishedAt: '2 days ago',
    severity: 'medium'
  }
];

export interface FantasyContest {
  id: string;
  title: string;
  description: string;
  entryFee: string;
  prizePool: string;
  winningAmount: string;
  prizes: string;
  gameweek: number;
  participants: number;
  maxParticipants: number;
  joined: boolean;
  tag: 'Cup' | 'Sprint' | 'Survival' | 'Classic';
  status?: 'Upcoming' | 'Live' | 'Completed';
  finalRoster?: any[];
}

export const INITIAL_CONTESTS: FantasyContest[] = [
  {
    id: 'contest-completed-1',
    title: '🏆 Underdog Mega Championship [GW1]',
    description: 'A completed 10-round tournament draft where you assembled a high-power roster against BotAlpha, BotBeta, and others. Detailed daily score breakdown matches are live below!',
    entryFee: '$10',
    prizePool: '$5,000',
    winningAmount: '$2,500',
    prizes: 'Cash payouts · Top 3 paid',
    gameweek: 1,
    participants: 8,
    maxParticipants: 8,
    joined: true,
    tag: 'Classic',
    status: 'Completed',
    finalRoster: [
      { id: 'nfl-1', name: 'Joe Burrow', position: 'QB', team: 'CIN', points: 32.4, salary: 9800 },
      { id: 'nfl-2', name: 'Christian McCaffrey', position: 'RB', team: 'SF', points: 29.8, salary: 12000 },
      { id: 'nfl-3', name: 'Tyreek Hill', position: 'WR', team: 'MIA', points: 26.6, salary: 11500 },
      { id: 'nfl-4', name: 'Justin Jefferson', position: 'WR', team: 'MIN', points: 28.2, salary: 11200 },
      { id: 'nfl-5', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', points: 25.4, salary: 11000 },
      { id: 'nfl-8', name: 'Travis Kelce', position: 'TE', team: 'KC', points: 19.4, salary: 8400 },
      { id: 'nfl-10', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', points: 21.3, salary: 10200 },
      { id: 'nfl-13', name: 'Breece Hall', position: 'RB', team: 'NYJ', points: 22.4, salary: 9600 },
      { id: 'nfl-14', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', points: 20.1, salary: 9200 },
      { id: 'nfl-20', name: 'George Kittle', position: 'TE', team: 'SF', points: 17.8, salary: 7600 }
    ]
  },
  {
    id: 'contest-1',
    title: '🏆 Gaffer Gold Cup Challenge',
    description: 'Enlist your drafted roster in the main Opening Cup. Beat fellow managers to claim the early-season silverware crown!',
    entryFee: 'Free',
    prizePool: '50,000 XP',
    winningAmount: '500 XP + Winner Badge',
    prizes: 'Bonus XP for top 10',
    gameweek: 1,
    participants: 142,
    maxParticipants: 500,
    joined: false,
    tag: 'Cup',
    status: 'Upcoming'
  },
  {
    id: 'contest-2',
    title: '⚡ Weekend Survival Sprint',
    description: 'Avoid finishing in the bottom 25% of scoring managers in this gameweek. Failure results in relegation elimination.',
    entryFee: '50 Coins',
    prizePool: '10,000 Coins',
    winningAmount: '2,500 Coins',
    prizes: 'Double XP + Survival Streak +1',
    gameweek: 1,
    participants: 89,
    maxParticipants: 200,
    joined: false,
    tag: 'Survival',
    status: 'Upcoming'
  },
  {
    id: 'contest-3',
    title: '📊 Midweek Playmaker Shootout',
    description: 'A tactical data-heavy shootout where playmaker midfielder assist contributions earn 1.5x points. Ideal for creative structures.',
    entryFee: 'Free',
    prizePool: '25,000 XP',
    winningAmount: 'Mastermind Banner + 800 XP',
    prizes: 'Exclusive cosmetic unlocks',
    gameweek: 2,
    participants: 45,
    maxParticipants: 100,
    joined: false,
    tag: 'Classic',
    status: 'Upcoming'
  },
  {
    id: 'contest-4',
    title: '🛡️ Clean Sheet Vanguard Trophy',
    description: 'A defensive contest where clean sheet points achieved by defensive structures are boosted by additional custom points.',
    entryFee: '10 Coins',
    prizePool: '5,000 Gaffer Gold',
    winningAmount: '1,200 Gaffer Gold',
    prizes: '300 Gaffer Gold + Shield Customizer',
    gameweek: 1,
    participants: 112,
    maxParticipants: 250,
    joined: false,
    tag: 'Cup',
    status: 'Upcoming'
  }
];

function ContestPrizeMetrics({ contest }: { contest: FantasyContest }) {
  const pool = contest.prizePool ?? contest.prizes;
  const win = contest.winningAmount ?? '—';
  return (
    <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] border-t border-white/5">
      <div className="flex flex-col min-w-0">
        <span className="text-slate-500 font-semibold uppercase tracking-wide">Prize Pool</span>
        <span className="text-brand-neon font-black font-mono text-sm truncate">{pool}</span>
      </div>
      <div className="flex flex-col text-right min-w-0">
        <span className="text-slate-500 font-semibold uppercase tracking-wide">Winning Amount</span>
        <span className="text-amber-300 font-black font-mono text-sm truncate">{win}</span>
      </div>
      {contest.prizes && contest.prizePool && (
        <div className="col-span-2 flex flex-col border-t border-white/5 pt-1.5 min-w-0">
          <span className="text-slate-500 font-semibold uppercase tracking-wide">Bonus Rewards</span>
          <span className="text-slate-400 font-medium truncate">{contest.prizes}</span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-slate-500 font-semibold uppercase tracking-wide">Capacity</span>
        <span className="text-slate-300 font-mono">{contest.participants} / {contest.maxParticipants}</span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-slate-500 font-semibold uppercase tracking-wide">Entry Fee</span>
        <span className="text-slate-300 font-bold">{contest.entryFee}</span>
      </div>
    </div>
  );
}

export interface DfsNflPlayer {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
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

export const DFS_NFL_POOL: DfsNflPlayer[] = [
  {
    id: 'nfl-1',
    name: 'Joe Burrow',
    position: 'QB',
    team: 'CIN',
    rosterPct: '6%',
    opp: '@BAL',
    opRk: '26th',
    adp: 3.6,
    adp90: 4.1,
    proj: 32.4,
    avg: 28.6
  },
  {
    id: 'nfl-2',
    name: 'Christian McCaffrey',
    position: 'RB',
    team: 'SF',
    rosterPct: '22%',
    opp: 'TB',
    opRk: '3rd',
    adp: 2.6,
    adp90: 5.3,
    proj: 29.8,
    avg: 26.6,
    starType: 'Q'
  },
  {
    id: 'nfl-3',
    name: 'Tyreek Hill',
    position: 'WR',
    team: 'MIA',
    rosterPct: '18%',
    opp: 'SF',
    opRk: '11th',
    adp: 4.3,
    adp90: 4.3,
    proj: 25.3,
    avg: 32.6,
    starType: 'P'
  },
  {
    id: 'nfl-4',
    name: 'Tua Tagovailoa',
    position: 'QB',
    team: 'MIA',
    rosterPct: '31%',
    opp: '@GB',
    opRk: '14th',
    adp: 2.4,
    adp90: 7.6,
    proj: 23.1,
    avg: 48.6
  },
  {
    id: 'nfl-5',
    name: 'Ja\'Marr Chase',
    position: 'WR',
    team: 'CIN',
    rosterPct: '15%',
    opp: '@BAL',
    opRk: '5th',
    adp: 4.0,
    adp90: 3.8,
    proj: 27.2,
    avg: 24.1
  },
  {
    id: 'nfl-6',
    name: 'Patrick Mahomes',
    position: 'QB',
    team: 'KC',
    rosterPct: '42%',
    opp: 'LV',
    opRk: '10th',
    adp: 3.1,
    adp90: 6.2,
    proj: 25.8,
    avg: 29.9
  },
  {
    id: 'nfl-7',
    name: 'Travis Kelce',
    position: 'TE',
    team: 'KC',
    rosterPct: '38%',
    opp: 'LV',
    opRk: '8th',
    adp: 5.2,
    adp90: 5.0,
    proj: 18.4,
    avg: 19.1
  },
  {
    id: 'nfl-8',
    name: 'Justin Jefferson',
    position: 'WR',
    team: 'MIN',
    rosterPct: '28%',
    opp: '@DET',
    opRk: '2nd',
    adp: 2.8,
    adp90: 3.2,
    proj: 31.9,
    avg: 28.3
  },
  {
    id: 'nfl-9',
    name: 'CeeDee Lamb',
    position: 'WR',
    team: 'DAL',
    rosterPct: '25%',
    opp: 'NYG',
    opRk: '4th',
    adp: 2.9,
    adp90: 3.5,
    proj: 30.5,
    avg: 27.4
  },
  {
    id: 'nfl-10',
    name: 'Saquon Barkley',
    position: 'RB',
    team: 'PHI',
    rosterPct: '19%',
    opp: '@DAL',
    opRk: '7th',
    adp: 3.5,
    adp90: 4.8,
    proj: 24.9,
    avg: 22.1
  },
  {
    id: 'nfl-11',
    name: 'Derrick Henry',
    position: 'RB',
    team: 'BAL',
    rosterPct: '16%',
    opp: 'CLE',
    opRk: '9th',
    adp: 4.2,
    adp90: 4.5,
    proj: 22.3,
    avg: 20.8
  },
  {
    id: 'nfl-12',
    name: 'Amon-Ra St. Brown',
    position: 'WR',
    team: 'DET',
    rosterPct: '17%',
    opp: 'CHI',
    opRk: '12th',
    adp: 3.9,
    adp90: 4.1,
    proj: 24.1,
    avg: 23.5
  },
  {
    id: 'nfl-13',
    name: 'Josh Allen',
    position: 'QB',
    team: 'BUF',
    rosterPct: '45%',
    opp: 'IND',
    opRk: '15th',
    adp: 1.8,
    adp90: 2.1,
    proj: 28.5,
    avg: 26.9
  },
  {
    id: 'nfl-14',
    name: 'Lamar Jackson',
    position: 'QB',
    team: 'BAL',
    rosterPct: '40%',
    opp: 'CIN',
    opRk: '18th',
    adp: 2.2,
    adp90: 2.5,
    proj: 27.8,
    avg: 25.4
  },
  {
    id: 'nfl-15',
    name: 'Jalen Hurts',
    position: 'QB',
    team: 'PHI',
    rosterPct: '35%',
    opp: '@DAL',
    opRk: '14th',
    adp: 2.5,
    adp90: 3.1,
    proj: 26.4,
    avg: 24.8
  },
  {
    id: 'nfl-16',
    name: 'Dak Prescott',
    position: 'QB',
    team: 'DAL',
    rosterPct: '15%',
    opp: 'NYG',
    opRk: '11th',
    adp: 5.6,
    adp90: 6.2,
    proj: 20.1,
    avg: 19.5
  },
  {
    id: 'nfl-17',
    name: 'C.J. Stroud',
    position: 'QB',
    team: 'HOU',
    rosterPct: '20%',
    opp: '@TEN',
    opRk: '21st',
    adp: 4.8,
    adp90: 5.2,
    proj: 21.3,
    avg: 20.1
  },
  {
    id: 'nfl-18',
    name: 'Breece Hall',
    position: 'RB',
    team: 'NYJ',
    rosterPct: '38%',
    opp: '@NE',
    opRk: '13th',
    adp: 1.5,
    adp90: 1.9,
    proj: 23.4,
    avg: 21.0
  },
  {
    id: 'nfl-19',
    name: 'Bijan Robinson',
    position: 'RB',
    team: 'ATL',
    rosterPct: '36%',
    opp: 'CAR',
    opRk: '19th',
    adp: 1.6,
    adp90: 2.0,
    proj: 22.8,
    avg: 20.5
  },
  {
    id: 'nfl-20',
    name: 'Jonathan Taylor',
    position: 'RB',
    team: 'IND',
    rosterPct: '22%',
    opp: 'BUF',
    opRk: '16th',
    adp: 2.9,
    adp90: 3.3,
    proj: 19.5,
    avg: 18.2
  },
  {
    id: 'nfl-21',
    name: 'Jahmyr Gibbs',
    position: 'RB',
    team: 'DET',
    rosterPct: '25%',
    opp: 'CHI',
    opRk: '12th',
    adp: 3.2,
    adp90: 3.7,
    proj: 20.1,
    avg: 18.9
  },
  {
    id: 'nfl-22',
    name: 'Kyren Williams',
    position: 'RB',
    team: 'LAR',
    rosterPct: '28%',
    opp: '@SEA',
    opRk: '22nd',
    adp: 3.1,
    adp90: 3.5,
    proj: 21.4,
    avg: 19.8
  },
  {
    id: 'nfl-23',
    name: 'Travis Etienne Jr.',
    position: 'RB',
    team: 'JAX',
    rosterPct: '18%',
    opp: 'MIN',
    opRk: '14th',
    adp: 4.5,
    adp90: 5.1,
    proj: 17.2,
    avg: 16.5
  },
  {
    id: 'nfl-24',
    name: 'James Cook',
    position: 'RB',
    team: 'BUF',
    rosterPct: '16%',
    opp: 'IND',
    opRk: '15th',
    adp: 5.1,
    adp90: 5.8,
    proj: 16.8,
    avg: 15.9
  },
  {
    id: 'nfl-25',
    name: 'Isiah Pacheco',
    position: 'RB',
    team: 'KC',
    rosterPct: '20%',
    opp: 'LV',
    opRk: '10th',
    adp: 4.9,
    adp90: 5.5,
    proj: 18.1,
    avg: 17.2
  },
  {
    id: 'nfl-26',
    name: 'Josh Jacobs',
    position: 'RB',
    team: 'GB',
    rosterPct: '15%',
    opp: 'MIA',
    opRk: '11th',
    adp: 5.3,
    adp90: 5.9,
    proj: 17.5,
    avg: 16.7
  },
  {
    id: 'nfl-27',
    name: 'De\'Von Achane',
    position: 'RB',
    team: 'MIA',
    rosterPct: '24%',
    opp: '@GB',
    opRk: '14th',
    adp: 3.8,
    adp90: 4.4,
    proj: 19.2,
    avg: 18.4
  },
  {
    id: 'nfl-28',
    name: 'A.J. Brown',
    position: 'WR',
    team: 'PHI',
    rosterPct: '26%',
    opp: '@DAL',
    opRk: '7th',
    adp: 2.1,
    adp90: 2.4,
    proj: 23.5,
    avg: 21.8
  },
  {
    id: 'nfl-29',
    name: 'Puka Nacua',
    position: 'WR',
    team: 'LAR',
    rosterPct: '22%',
    opp: '@SEA',
    opRk: '22nd',
    adp: 2.5,
    adp90: 2.9,
    proj: 22.1,
    avg: 21.4
  },
  {
    id: 'nfl-30',
    name: 'Garrett Wilson',
    position: 'WR',
    team: 'NYJ',
    rosterPct: '18%',
    opp: '@NE',
    opRk: '13th',
    adp: 3.4,
    adp90: 3.9,
    proj: 20.8,
    avg: 19.5
  },
  {
    id: 'nfl-31',
    name: 'Marvin Harrison Jr.',
    position: 'WR',
    team: 'ARI',
    rosterPct: '17%',
    opp: 'LAC',
    opRk: '25th',
    adp: 3.6,
    adp90: 4.2,
    proj: 19.9,
    avg: 18.5
  },
  {
    id: 'nfl-32',
    name: 'Davante Adams',
    position: 'WR',
    team: 'LV',
    rosterPct: '19%',
    opp: '@KC',
    opRk: '10th',
    adp: 4.1,
    adp90: 4.7,
    proj: 18.6,
    avg: 18.1
  },
  {
    id: 'nfl-33',
    name: 'Chris Olave',
    position: 'WR',
    team: 'NO',
    rosterPct: '14%',
    opp: '@ATL',
    opRk: '19th',
    adp: 4.5,
    adp90: 5.1,
    proj: 17.9,
    avg: 17.2
  },
  {
    id: 'nfl-34',
    name: 'Drake London',
    position: 'WR',
    team: 'ATL',
    rosterPct: '16%',
    opp: 'CAR',
    opRk: '19th',
    adp: 4.8,
    adp90: 5.4,
    proj: 18.4,
    avg: 17.6
  },
  {
    id: 'nfl-35',
    name: 'Nico Collins',
    position: 'WR',
    team: 'HOU',
    rosterPct: '23%',
    opp: '@TEN',
    opRk: '21st',
    adp: 3.2,
    adp90: 3.6,
    proj: 21.5,
    avg: 20.3
  },
  {
    id: 'nfl-36',
    name: 'Deebo Samuel Sr.',
    position: 'WR',
    team: 'SF',
    rosterPct: '20%',
    opp: 'TB',
    opRk: '3rd',
    adp: 3.8,
    adp90: 4.3,
    proj: 19.1,
    avg: 18.7
  },
  {
    id: 'nfl-37',
    name: 'Brandon Aiyuk',
    position: 'WR',
    team: 'SF',
    rosterPct: '15%',
    opp: 'TB',
    opRk: '3rd',
    adp: 4.0,
    adp90: 4.5,
    proj: 18.5,
    avg: 18.0
  },
  {
    id: 'nfl-38',
    name: 'Mike Evans',
    position: 'WR',
    team: 'TB',
    rosterPct: '12%',
    opp: '@SF',
    opRk: '3rd',
    adp: 5.2,
    adp90: 5.8,
    proj: 16.9,
    avg: 16.3
  },
  {
    id: 'nfl-39',
    name: 'DJ Moore',
    position: 'WR',
    team: 'CHI',
    rosterPct: '11%',
    opp: '@DET',
    opRk: '12th',
    adp: 5.5,
    adp90: 6.1,
    proj: 16.2,
    avg: 15.8
  },
  {
    id: 'nfl-40',
    name: 'DK Metcalf',
    position: 'WR',
    team: 'SEA',
    rosterPct: '13%',
    opp: 'LAR',
    opRk: '22nd',
    adp: 5.0,
    adp90: 5.6,
    proj: 17.0,
    avg: 16.4
  },
  {
    id: 'nfl-41',
    name: 'Sam LaPorta',
    position: 'TE',
    team: 'DET',
    rosterPct: '32%',
    opp: 'CHI',
    opRk: '12th',
    adp: 4.5,
    adp90: 4.8,
    proj: 16.5,
    avg: 15.9
  },
  {
    id: 'nfl-42',
    name: 'Trey McBride',
    position: 'TE',
    team: 'ARI',
    rosterPct: '28%',
    opp: 'LAC',
    opRk: '25th',
    adp: 4.8,
    adp90: 5.2,
    proj: 16.2,
    avg: 15.4
  },
  {
    id: 'nfl-43',
    name: 'Mark Andrews',
    position: 'TE',
    team: 'BAL',
    rosterPct: '22%',
    opp: 'CLE',
    opRk: '9th',
    adp: 6.1,
    adp90: 6.8,
    proj: 14.8,
    avg: 14.1
  },
  {
    id: 'nfl-44',
    name: 'Dalton Kincaid',
    position: 'TE',
    team: 'BUF',
    rosterPct: '20%',
    opp: 'IND',
    opRk: '15th',
    adp: 6.5,
    adp90: 7.1,
    proj: 14.1,
    avg: 13.5
  },
  {
    id: 'nfl-45',
    name: 'George Kittle',
    position: 'TE',
    team: 'SF',
    rosterPct: '24%',
    opp: 'TB',
    opRk: '3rd',
    adp: 5.8,
    adp90: 6.3,
    proj: 15.5,
    avg: 14.8
  },
  {
    id: 'nfl-46',
    name: 'Kyle Pitts',
    position: 'TE',
    team: 'ATL',
    rosterPct: '18%',
    opp: 'CAR',
    opRk: '19th',
    adp: 7.2,
    adp90: 7.8,
    proj: 13.2,
    avg: 12.6
  },
  {
    id: 'nfl-47',
    name: 'Evan Engram',
    position: 'TE',
    team: 'JAX',
    rosterPct: '16%',
    opp: 'MIN',
    opRk: '14th',
    adp: 7.5,
    adp90: 8.1,
    proj: 12.9,
    avg: 12.2
  },
  {
    id: 'nfl-48',
    name: 'Jake Ferguson',
    position: 'TE',
    team: 'DAL',
    rosterPct: '15%',
    opp: 'NYG',
    opRk: '4th',
    adp: 7.9,
    adp90: 8.5,
    proj: 13.5,
    avg: 12.9
  },
  {
    id: 'nfl-49',
    name: 'Dallas Goedert',
    position: 'TE',
    team: 'PHI',
    rosterPct: '12%',
    opp: '@DAL',
    opRk: '7th',
    adp: 8.1,
    adp90: 8.9,
    proj: 13.0,
    avg: 12.4
  },
  {
    id: 'nfl-50',
    name: 'Baker Mayfield',
    position: 'QB',
    team: 'TB',
    rosterPct: '10%',
    opp: '@SF',
    opRk: '3rd',
    adp: 8.2,
    adp90: 9.0,
    proj: 17.8,
    avg: 18.2
  },
  {
    id: 'nfl-51',
    name: 'Kenneth Walker III',
    position: 'RB',
    team: 'SEA',
    rosterPct: '14%',
    opp: 'LAR',
    opRk: '22nd',
    adp: 6.2,
    adp90: 6.8,
    proj: 16.4,
    avg: 15.9
  },
  {
    id: 'nfl-52',
    name: 'Rachaad White',
    position: 'RB',
    team: 'TB',
    rosterPct: '16%',
    opp: '@SF',
    opRk: '3rd',
    adp: 6.0,
    adp90: 6.6,
    proj: 15.8,
    avg: 15.3
  },
  {
    id: 'nfl-53',
    name: 'Stefon Diggs',
    position: 'WR',
    team: 'HOU',
    rosterPct: '14%',
    opp: '@TEN',
    opRk: '21st',
    adp: 5.1,
    adp90: 5.7,
    proj: 16.5,
    avg: 16.0
  },
  {
    id: 'nfl-54',
    name: 'Cooper Kupp',
    position: 'WR',
    team: 'LAR',
    rosterPct: '18%',
    opp: '@SEA',
    opRk: '22nd',
    adp: 4.9,
    adp90: 5.4,
    proj: 17.8,
    avg: 17.1
  },
  {
    id: 'nfl-55',
    name: 'Jaylen Waddle',
    position: 'WR',
    team: 'MIA',
    rosterPct: '13%',
    opp: '@GB',
    opRk: '14th',
    adp: 5.8,
    adp90: 6.4,
    proj: 15.9,
    avg: 15.5
  },
  {
    id: 'nfl-56',
    name: 'Zay Flowers',
    position: 'WR',
    team: 'BAL',
    rosterPct: '16%',
    opp: 'CLE',
    opRk: '9th',
    adp: 6.4,
    adp90: 7.0,
    proj: 15.2,
    avg: 14.8
  },
  {
    id: 'nfl-57',
    name: 'David Montgomery',
    position: 'RB',
    team: 'DET',
    rosterPct: '15%',
    opp: 'CHI',
    opRk: '12th',
    adp: 6.8,
    adp90: 7.4,
    proj: 15.5,
    avg: 15.0
  },
  {
    id: 'nfl-58',
    name: 'Alvin Kamara',
    position: 'RB',
    team: 'NO',
    rosterPct: '18%',
    opp: '@ATL',
    opRk: '19th',
    adp: 5.9,
    adp90: 6.5,
    proj: 16.8,
    avg: 16.1
  },
  {
    id: 'nfl-59',
    name: 'George Pickens',
    position: 'WR',
    team: 'PIT',
    rosterPct: '12%',
    opp: '@WAS',
    opRk: '8th',
    adp: 7.0,
    adp90: 7.6,
    proj: 14.5,
    avg: 14.1
  },
  {
    id: 'nfl-60',
    name: 'Terry McLaurin',
    position: 'WR',
    team: 'WAS',
    rosterPct: '14%',
    opp: 'PIT',
    opRk: '11th',
    adp: 7.2,
    adp90: 7.8,
    proj: 14.8,
    avg: 14.3
  }
];

export default function App() {
  // Page Navigation Tabs & State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'draft-room' | 'my-squad' | 'waivers' | 'players' | 'matchups'>('dashboard');
  const [userProfile, setUserProfile] = useState<{ userId: string; username: string; email: string; phone?: string } | null>(null);

  // Authentication & OTP State Configuration
  const [authPhone, setAuthPhone] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authOtpSent, setAuthOtpSent] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupTeamName, setSignupTeamName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Global Leagues & Active League tracker
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('league-demo');
  const [activeLeague, setActiveLeague] = useState<League | null>(null);

  // Core Module Sub-States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayersPool, setAllPlayersPool] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<PlayerPosition | 'ALL'>('ALL');
  
  // Roster squad details
  const [myRoster, setMyRoster] = useState<{ team: Team; active: Player[]; bench: Player[] } | null>(null);

  // Draft room state
  const [draftSession, setDraftSession] = useState<any>(null);
  const [draftPlayerSearch, setDraftPlayerSearch] = useState('');
  const [draftPositionFilter, setDraftPositionFilter] = useState<PlayerPosition | 'ALL'>('ALL');

  // Waiver Claim state
  const [waiverModule, setWaiverModule] = useState<'priority' | 'fwwb'>('priority');
  const [waiverInfo, setWaiverInfo] = useState<{ claims: WaiverClaim[]; teamPriorityList: any[] }>({ claims: [], teamPriorityList: [] });
  const [fwwbInfo, setFwwbInfo] = useState<{
    budgets: FwwbTeamBudget[];
    bids: FwwbBid[];
    myRemaining: number;
    startingBudget: number;
    minBid: number;
  }>({ budgets: [], bids: [], myRemaining: 100, startingBudget: 100, minBid: FWWB_MIN_BID });
  const [selectedDropPlayer, setSelectedDropPlayer] = useState<Player | null>(null);
  const [selectedAddPlayer, setSelectedAddPlayer] = useState<Player | null>(null);
  const [fwwbBidAmount, setFwwbBidAmount] = useState(15);

  // Matchups & Fixtures
  const [matchupsList, setMatchupsList] = useState<Matchup[]>([]);
  const [activeGameweek, setActiveGameweek] = useState<number>(1);

  // New League Form
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueSize, setNewLeagueSize] = useState(4);
  const [customGoalPoints, setCustomGoalPoints] = useState(6);
  const [customAssistPoints, setCustomAssistPoints] = useState(3);
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  // Real-world gameweek and predictions states
  const [predictions, setPredictions] = useState<Record<string, 'HOME' | 'DRAW' | 'AWAY'>>({});
  const [rwGameweek, setRwGameweek] = useState<number>(1);
  const [draftCountdown, setDraftCountdown] = useState('1d 04h 12m 30s');
  
  // News and scout intelligence states
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<'all' | 'injury' | 'transfer' | 'stats' | 'general'>('all');
  const [newsSearch, setNewsSearch] = useState('');

  useEffect(() => {
    const target = new Date('2026-05-23T11:30:00Z');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setDraftCountdown('Draft is imminent or live!');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      let str = '';
      if (days > 0) {
        str += `${days}d `;
      }
      str += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      setDraftCountdown(str);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // UI Action Feedback / Toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [selectedPlayerDetail, setSelectedPlayerDetail] = useState<Player | null>(null);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const [isFwwbModalOpen, setIsFwwbModalOpen] = useState(false);
  const [isDraftTimerActive, setIsDraftTimerActive] = useState(false);

  // DFS Draft Arena interactive states
  const [activeContestDraft, setActiveContestDraft] = useState<FantasyContest | null>(null);
  const [dfsDraftTimer, setDfsDraftTimer] = useState<number>(10);
  const [dfsDraftPaused, setDfsDraftPaused] = useState<boolean>(false);
  const [dfsDraftSpeed, setDfsDraftSpeed] = useState<number>(10);
  const [dfsConfirmPicks, setDfsConfirmPicks] = useState<boolean>(false);
  const [dfsSearchText, setDfsSearchText] = useState<string>('');
  const [dfsPositionFilter, setDfsPositionFilter] = useState<'ALL' | 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX'>('ALL');
  const [dfsRemoveUnavailable, setDfsRemoveUnavailable] = useState<boolean>(false);
  const [dfsQueueIds, setDfsQueueIds] = useState<string[]>([]);
  const [dfsActiveSeatIndex, setDfsActiveSeatIndex] = useState<number>(3); // User corresponds to Seat #4 (index 3)
  const [dfsCountdown, setDfsCountdown] = useState<number | null>(null);
  const [selectedDfsPlayer, setSelectedDfsPlayer] = useState<DfsNflPlayer | null>(null);
  const [dfsModalTab, setDfsModalTab] = useState<'news' | 'stats' | 'gamelog'>('stats');
  const [submittedDfsRoster, setSubmittedDfsRoster] = useState<{ contest: FantasyContest; picks: any[] } | null>(null);
  const [dfsContestFilter, setDfsContestFilter] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [selectedCompletedContest, setSelectedCompletedContest] = useState<FantasyContest | null>(null);
  const [selectedDfsDay, setSelectedDfsDay] = useState<1 | 2 | 3>(1);
  const [activeLeaderboardManager, setActiveLeaderboardManager] = useState<string>('Pooja Doshi');
  
  // Custom drafted players specifically for the current active DFS Contest Campaign
  const [dfsDraftedPlayers, setDfsDraftedPlayers] = useState<Array<{
    id: string;
    name: string;
    position: string;
    team: string;
    points: number;
    opp: string;
    opRk: string;
    adp: number;
    avg: number;
  }>>([]);

  // Contest Listing state and registration handler
  const [contests, setContests] = useState<FantasyContest[]>(INITIAL_CONTESTS);

  const featuredUpcomingContest = useMemo(
    () =>
      contests.find(
        c => c.status !== 'Completed' && (c.status === 'Upcoming' || !c.joined)
      ) ?? null,
    [contests]
  );

  const getSeatIndexForPick = (pickIndex: number): number => {
    const round = Math.floor(pickIndex / 4) + 1;
    const isRoundOdd = round % 2 !== 0;
    const indexInRound = pickIndex % 4;
    return isRoundOdd ? indexInRound : 3 - indexInRound;
  };

  const getDfsTournamentStandings = (contest: FantasyContest, day: 1 | 2 | 3) => {
    const managers = [
      { name: userProfile?.username || 'Pooja Doshi', isUser: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { name: 'BotAlpha', isUser: false, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
      { name: 'BotBeta', isUser: false, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
      { name: 'BotGamma', isUser: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' }
    ];

    return managers.map((m, idx) => {
      const day1Points = 45.3 + (idx * 3.4) + (idx % 2 === 0 ? 12.2 : 4.1);
      const day2Points = day >= 2 ? (52.6 + (idx * 2.1) + (idx % 3 === 0 ? 15.5 : 2.5)) : 0;
      const day3Points = day >= 3 ? (48.1 + (idx * 4.2) - (idx % 4 === 0 ? 9.8 : 1.2)) : 0;
      
      let actualRosterBase = 145.0;
      if (m.isUser && contest.finalRoster) {
        actualRosterBase = contest.finalRoster.reduce((sum, p) => sum + (p.points || p.proj || 20), 0);
      }
      
      const u1 = m.isUser ? (actualRosterBase * 0.32) : day1Points;
      const u2 = m.isUser ? (day >= 2 ? (actualRosterBase * 0.36) : 0) : day2Points;
      const u3 = m.isUser ? (day >= 3 ? (actualRosterBase * 0.32) : 0) : day3Points;

      const total = Number((u1 + u2 + u3).toFixed(1));

      const roster = m.isUser && contest.finalRoster ? contest.finalRoster : [
        { id: 'm-1', name: 'Patrick Mahomes', position: 'QB', team: 'KC', points: 26.5 },
        { id: 'm-2', name: 'Saquon Barkley', position: 'RB', team: 'PHI', points: 19.8 },
        { id: 'm-3', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', points: 21.3 },
        { id: 'm-4', name: 'George Kittle', position: 'TE', team: 'SF', points: 16.2 },
        { id: 'm-5', name: 'DK Metcalf', position: 'WR', team: 'SEA', points: 18.4 },
        { id: 'm-6', name: 'Jared Goff', position: 'QB', team: 'DET', points: 22.1 },
        { id: 'm-7', name: 'Kenneth Walker', position: 'RB', team: 'SEA', points: 15.4 },
        { id: 'm-8', name: 'Zay Flowers', position: 'WR', team: 'BAL', points: 14.2 },
        { id: 'm-9', name: 'Dalton Kincaid', position: 'TE', team: 'BUF', points: 11.8 },
        { id: 'm-10', name: 'Kyren Williams', position: 'RB', team: 'LAR', points: 17.6 },
      ];

      const playerScores = roster.map((p, pIdx) => {
        const pTotal = p.points || p.proj || p.points || 20;
        const d1 = Number((pTotal * 0.32 + (pIdx % 3 === 0 ? 3.5 : -1.2)).toFixed(1));
        const d2 = Number((pTotal * 0.36 + (pIdx % 2 === 0 ? 2.1 : -2.3)).toFixed(1));
        const d3 = Number((pTotal * 0.32 + (pIdx % 4 === 0 ? 1.8 : -1.5)).toFixed(1));
        return {
          ...p,
          day1: d1,
          day2: d2,
          day3: d3,
          activeDayScore: day === 1 ? d1 : day === 2 ? d2 : d3
        };
      });

      return {
        ...m,
        day1Points: Number(u1.toFixed(1)),
        day2Points: Number(u2.toFixed(1)),
        day3Points: Number(u3.toFixed(1)),
        totalPoints: total,
        playerScores,
        status: day === 3 ? 'Final' : 'Live'
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const handleJoinContest = (contestId: string) => {
    const targetContest = contests.find(c => c.id === contestId);
    if (!targetContest) return;

    if (targetContest.joined) {
      setCurrentTab('draft-room');
      setActiveContestDraft(targetContest);
      setSubmittedDfsRoster(null);
      addToast(`Entering Draft Room for ${targetContest.title}...`, 'info');
      setDfsCountdown(5);
      setDfsDraftPaused(true);
      setDfsDraftTimer(10);
      setDfsActiveSeatIndex(0); // Start on BotAlpha (seat 1) and snake through correctly
      setDfsDraftedPlayers([]);
      setDfsQueueIds([]);
      return;
    }

    setContests(prev => prev.map(c => {
      if (c.id === contestId) {
        return {
          ...c,
          joined: true,
          status: 'Live' as const,
          participants: c.participants + 1
        };
      }
      return c;
    }));

    const updatedContest = { ...targetContest, joined: true, status: 'Live' as const, participants: targetContest.participants + 1 };
    
    // Auto-navigate to Draft Room and activate the specific contest's Draft DFS Arena
    setCurrentTab('draft-room');
    setActiveContestDraft(updatedContest);
    setSubmittedDfsRoster(null);
    
    // Reset DFS draft attributes
    setDfsDraftTimer(10);
    setDfsDraftPaused(true);
    setDfsDraftSpeed(10);
    setDfsActiveSeatIndex(0); // Start on BotAlpha (seat 1) and snake through correctly
    setDfsDraftedPlayers([]);
    setDfsQueueIds([]);
    setDfsCountdown(5);
    
    addToast(`Successfully joined ${targetContest.title}! Roster registered in Draft Arena.`, 'success');
  };

  // DFS Draft Arena simulation logic
  const handleDfsAutoPick = () => {
    const seatNames = ['BotAlpha', 'BotBeta', 'BotGamma', userProfile?.username || 'Pooja Doshi'];
    const activeSeatName = seatNames[dfsActiveSeatIndex];
    
    // Check if draft is already over
    if (dfsDraftedPlayers.length >= 40) {
      addToast("The Underdog Draft is complete! Click Submit Lineup below to finalize your tournament squad.", "success");
      setDfsDraftPaused(true);
      return;
    }

    // Find undrafted candidates
    const draftedIds = dfsDraftedPlayers.map(dp => dp.id);
    const availablePlayers = DFS_NFL_POOL.filter(p => !draftedIds.includes(p.id));
    
    if (availablePlayers.length === 0) {
      addToast("The draft is complete! All rosters are fully assembled. Click Submit Lineup below!", "success");
      setDfsDraftPaused(true);
      return;
    }

    // Pick top available candidate
    let chosenPlayer = availablePlayers[0];

    // If it's a Bot's turn, let's optimize their position selection if they already have plenty
    if (dfsActiveSeatIndex !== 3) {
      // Find what they already drafted
      const botPicks = dfsDraftedPlayers.filter(dp => (dp as any).draftedBySeatIndex === dfsActiveSeatIndex);
      const botQbs = botPicks.filter(p => p.position === 'QB').length;
      const botRbs = botPicks.filter(p => p.position === 'RB').length;

      // Try to maintain a balanced roster
      if (botQbs >= 1) {
        const nonQb = availablePlayers.find(p => p.position !== 'QB');
        if (nonQb) chosenPlayer = nonQb;
      }
      if (botRbs >= 2) {
        const nonRbAndQb = availablePlayers.find(p => p.position !== 'RB' && p.position !== 'QB');
        if (nonRbAndQb) chosenPlayer = nonRbAndQb;
      }
    } else {
      // User's turn! Check Priority Queue first
      if (dfsQueueIds.length > 0) {
        const queuedId = dfsQueueIds[0];
        const queuedFound = availablePlayers.find(p => p.id === queuedId);
        if (queuedFound) {
          chosenPlayer = queuedFound;
          // Pull from queue
          setDfsQueueIds(prev => prev.filter(id => id !== queuedId));
          addToast(`🎯 Drafted ${chosenPlayer.name} (${chosenPlayer.position}) from your Priority Queue!`, 'success');
        } else {
          // If queued player was already drafted somehow
          setDfsQueueIds(prev => prev.filter(id => id !== queuedId));
        }
      } else {
        addToast(`⏰ Pick timer expired! System auto-drafted ${chosenPlayer.name} (${chosenPlayer.position}) for your lineup.`, 'info');
      }
    }

    // Register selection
    const finalizedSelection = {
      id: chosenPlayer.id,
      name: chosenPlayer.name,
      position: chosenPlayer.position,
      team: chosenPlayer.team,
      points: chosenPlayer.proj,
      opp: chosenPlayer.opp,
      opRk: chosenPlayer.opRk,
      adp: chosenPlayer.adp,
      avg: chosenPlayer.avg,
      draftedBySeatIndex: dfsActiveSeatIndex
    };

    const newPicksList = [...dfsDraftedPlayers, finalizedSelection];
    setDfsDraftedPlayers(newPicksList);
    
    if (dfsActiveSeatIndex !== 3) {
      addToast(`⚡ Seat ${dfsActiveSeatIndex + 1} (${activeSeatName}) drafted ${chosenPlayer.name} (${chosenPlayer.position})`, 'info');
    }

    // Calculate next turn using snake draft formula
    if (newPicksList.length >= 40) {
      addToast("🏆 Underdog Snake Draft is complete! Click Submit Lineup to view your roster page.", "success");
      setDfsDraftPaused(true);
    } else {
      const nextSeat = getSeatIndexForPick(newPicksList.length);
      setDfsActiveSeatIndex(nextSeat);
      setDfsDraftTimer(dfsDraftSpeed);
    }
  };

  // 1. Countdown timer decrementer for initial 5 seconds setup
  useEffect(() => {
    if (dfsCountdown === null) return;
    if (dfsCountdown > 0) {
      const timer = setTimeout(() => {
        setDfsCountdown(dfsCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDfsCountdown(null);
      setDfsDraftPaused(false);
      addToast("🟢 The Draft has officially started! Draft your first player!", "success");
    }
  }, [dfsCountdown]);

  // 2. Draft Arena simulation loop
  useEffect(() => {
    if (!activeContestDraft || dfsDraftPaused || dfsCountdown !== null) return;

    if (dfsActiveSeatIndex !== 3) {
      // Fast-paced Bot Selection: Non-user turns execute draft with 1-sec delay each
      const timer = setTimeout(() => {
        handleDfsAutoPick();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // User's turn: Countdown timer ticks down second by second
      const interval = setInterval(() => {
        setDfsDraftTimer(prev => {
          if (prev > 1) {
            return prev - 1;
          }
          handleDfsAutoPick();
          return dfsDraftSpeed;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeContestDraft, dfsDraftPaused, dfsCountdown, dfsDraftSpeed, dfsActiveSeatIndex, dfsDraftedPlayers, dfsQueueIds]);

  const handleDfsManualDraft = (player: DfsNflPlayer) => {
    if (!activeContestDraft) return;

    // Check if player is already drafted
    const isTaken = dfsDraftedPlayers.some(p => p.id === player.id);
    if (isTaken) {
      addToast(`${player.name} has already been drafted!`, 'error');
      return;
    }

    // Check if user already filled up the specific slot
    const userPicks = dfsDraftedPlayers.filter(p => p.draftedBySeatIndex === 3);
    const existingPosCount = userPicks.filter(p => p.position === player.position).length;
    
    let isFull = false;
    if (player.position === 'QB' && existingPosCount >= 2) isFull = true;
    if (player.position === 'RB' && existingPosCount >= 4) isFull = true;
    if (player.position === 'WR' && existingPosCount >= 5) isFull = true;
    if (player.position === 'TE' && existingPosCount >= 2) isFull = true;

    if (isFull) {
      addToast(`Slot count of ${existingPosCount} is full for position ${player.position}! Select a different position to diversify your lineup.`, 'error');
      return;
    }

    // Register selection for User
    const finalizedSelection = {
      id: player.id,
      name: player.name,
      position: player.position,
      team: player.team,
      points: player.proj,
      opp: player.opp,
      opRk: player.opRk,
      adp: player.adp,
      avg: player.avg,
      draftedBySeatIndex: 3 // Assure it is marked as user's draft pick!
    };

    const newPicksList = [...dfsDraftedPlayers, finalizedSelection];
    setDfsDraftedPlayers(newPicksList);
    
    // Remove if also in Priority Queue
    setDfsQueueIds(prev => prev.filter(id => id !== player.id));

    addToast(`🎉 Successfully drafted ${player.name} (${player.position}) to your roster!`, 'success');

    // Calculate next turn using snake draft formula
    if (newPicksList.length >= 40) {
      addToast("🏆 Underdog Snake Draft is complete! Click Submit Lineup to view your roster page.", "success");
      setDfsDraftPaused(true);
    } else {
      const nextSeat = getSeatIndexForPick(newPicksList.length);
      setDfsActiveSeatIndex(nextSeat);
      setDfsDraftTimer(dfsDraftSpeed);
    }
  };

  const handleToggleDfsQueue = (playerId: string) => {
    if (dfsQueueIds.includes(playerId)) {
      setDfsQueueIds(prev => prev.filter(id => id !== playerId));
      addToast(`Removed player from Priority Queue`, 'info');
    } else {
      if (dfsQueueIds.length >= 5) {
        addToast(`Queue is full! (Max 5)`, 'error');
        return;
      }
      setDfsQueueIds(prev => [...prev, playerId]);
      addToast(`Added player to Priority Queue!`, 'success');
    }
  };

  // API base loaders
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    // Replace toasts state with only the newest toast, effectively closing all previous ones instantly
    setToasts([{ id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const API = {
    async fetchLeagues() {
      const data = staticStore.getLeagues();
      setLeagues(data);
      let match = data.find((l: League) => l.id === selectedLeagueId);
      if (!match && data.length > 0) {
        match = data[0];
        setSelectedLeagueId(match.id);
      }
      setActiveLeague(match || null);
    },

    async fetchNotifications() {
      const data = staticStore.getNotifications();
      setNotifications(data.length ? data : STATIC_FEED_UPDATES);
    },

    async fetchPlayers() {
      setPlayers(staticStore.getPlayers(searchQuery, positionFilter));
      setAllPlayersPool(staticStore.getAllPlayers());
    },

    async fetchRoster() {
      if (!selectedLeagueId) return;
      const data = staticStore.getRoster(selectedLeagueId);
      if (data) setMyRoster(data);
    },

    async fetchDraftSession() {
      if (!selectedLeagueId) return;
      const data = staticStore.getDraftSession(selectedLeagueId);
      if (data) setDraftSession(data);
    },

    async fetchWaivers() {
      if (!selectedLeagueId) return;
      const data = staticStore.getWaivers(selectedLeagueId);
      setWaiverInfo({
        claims: data.claims?.length ? data.claims : STATIC_SEED_CLAIMS.filter(c => c.leagueId === selectedLeagueId),
        teamPriorityList: data.teamPriorityList?.length ? data.teamPriorityList : STATIC_WAIVER_PRIORITY,
      });
    },

    async fetchFwwb() {
      if (!selectedLeagueId) return;
      const data = staticStore.getFwwb(selectedLeagueId);
      setFwwbInfo({
        budgets: data.budgets?.length ? data.budgets : STATIC_FWWB_BUDGETS,
        bids: data.bids?.length ? data.bids : STATIC_FWWB_SEED_BIDS.filter(b => b.leagueId === selectedLeagueId),
        myRemaining: data.myRemaining ?? 100,
        startingBudget: data.startingBudget ?? 100,
        minBid: data.minBid ?? FWWB_MIN_BID,
      });
    },

    async fetchMatchups() {
      if (!selectedLeagueId) return;
      const data = staticStore.getMatchups(selectedLeagueId);
      setMatchupsList(data.length > 0 ? data : buildStaticH2HMatchups(selectedLeagueId));
    },

    async fetchSession() {
      const data = staticStore.getSession();
      if (data) {
        setUserProfile(data);
        return true;
      }
      setUserProfile(null);
      return false;
    },
  };

  const resetAppState = () => {
    setCurrentTab('dashboard');
    setUserProfile(null);
    setAuthPhone('');
    setAuthOtp('');
    setAuthOtpSent(false);
    setAuthMode('login');
    setSignupUsername('');
    setSignupTeamName('');
    setSignupEmail('');
    setIsLoadingAuth(false);
    setLeagues([]);
    setSelectedLeagueId('league-demo');
    setActiveLeague(null);
    setNotifications([]);
    setPlayers([]);
    setAllPlayersPool([]);
    setSearchQuery('');
    setPositionFilter('ALL');
    setMyRoster(null);
    setDraftSession(null);
    setDraftPlayerSearch('');
    setDraftPositionFilter('ALL');
    setWaiverModule('priority');
    setWaiverInfo({ claims: [], teamPriorityList: [] });
    setFwwbInfo({ budgets: [], bids: [], myRemaining: 100, startingBudget: 100, minBid: FWWB_MIN_BID });
    setSelectedDropPlayer(null);
    setSelectedAddPlayer(null);
    setFwwbBidAmount(15);
    setMatchupsList([]);
    setActiveGameweek(1);
    setNewLeagueName('');
    setNewLeagueSize(4);
    setCustomGoalPoints(6);
    setCustomAssistPoints(3);
    setInviteCodeInput('');
    setPredictions({});
    setRwGameweek(1);
    setSelectedNewsId(null);
    setNewsCategoryFilter('all');
    setNewsSearch('');
    setToasts([]);
    setSelectedPlayerDetail(null);
    setIsWaiverModalOpen(false);
    setIsFwwbModalOpen(false);
    setIsDraftTimerActive(false);
    setActiveContestDraft(null);
    setDfsDraftTimer(10);
    setDfsDraftPaused(false);
    setDfsDraftSpeed(10);
    setDfsConfirmPicks(false);
    setDfsSearchText('');
    setDfsPositionFilter('ALL');
    setDfsRemoveUnavailable(false);
    setDfsQueueIds([]);
    setDfsActiveSeatIndex(3);
    setDfsCountdown(null);
    setSelectedDfsPlayer(null);
    setDfsModalTab('stats');
    setSubmittedDfsRoster(null);
    setDfsContestFilter('upcoming');
    setSelectedCompletedContest(null);
    setSelectedDfsDay(1);
    setActiveLeaderboardManager('Pooja Doshi');
    setDfsDraftedPlayers([]);
    setContests(JSON.parse(JSON.stringify(INITIAL_CONTESTS)));
  };

  const handleLogout = async () => {
    staticStore.logout();
    resetAppState();
    setToasts([
      { id: `toast-logout-${Date.now()}`, message: 'Logged out. Everything reset to default.', type: 'info' },
    ]);
  };

  // Synchronize on parameters changed
  useEffect(() => {
    API.fetchSession().then((authenticated) => {
      if (authenticated) {
        API.fetchLeagues();
        API.fetchNotifications();
        API.fetchPlayers();
      }
    });
  }, []);

  useEffect(() => {
    if (selectedLeagueId) {
      const match = leagues.find(l => l.id === selectedLeagueId);
      setActiveLeague(match || null);
      if (match) {
        setActiveGameweek(match.currentGameweek);
      }
      API.fetchRoster();
      API.fetchDraftSession();
      API.fetchWaivers();
      API.fetchFwwb();
      API.fetchMatchups();
    }
  }, [selectedLeagueId, leagues]);

  // Periodic poll of live draft session when active
  useEffect(() => {
    let interval: any;
    if (draftSession?.status === 'Active') {
      interval = setInterval(() => {
        API.fetchDraftSession();
        API.fetchLeagues();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [draftSession?.status]);

  // Handle draft timers simulation client-side
  useEffect(() => {
    let timer: any;
    if (draftSession?.status === 'Active') {
      timer = setInterval(() => {
        setDraftSession((prev: any) => {
          if (!prev) return null;
          if (prev.timerRemainingSeconds <= 1) {
            // Trigger automatic timeout pick
            triggerAutoPick();
            return { ...prev, timerRemainingSeconds: prev.timerDurationSeconds };
          }
          return { ...prev, timerRemainingSeconds: prev.timerRemainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [draftSession?.status]);

  // Core Actions Trigger Handlers

  const triggerAutoPick = async () => {
    const result = staticStore.autoDraftPick(selectedLeagueId);
    if ('error' in result && result.error) {
      addToast(result.error, 'error');
      return;
    }
    addToast('Autopicked top available player.', 'info');
    API.fetchLeagues();
    API.fetchDraftSession();
  };

  const handleStartDraft = async () => {
    setCurrentTab('draft-room');
    if (!selectedLeagueId) {
      addToast('Select a league to enter the draft room.', 'error');
      return;
    }
    const result = staticStore.startDraft(selectedLeagueId);
    if ('error' in result && result.error) {
      addToast(result.error, 'error');
      return;
    }
    addToast('Live snake draft started!', 'success');
    API.fetchLeagues();
    API.fetchDraftSession();
  };

  const handleDraftPick = async (playerId: string) => {
    if (!draftSession || !myRoster?.team) return;
    const result = staticStore.executeDraftPick(
      selectedLeagueId,
      draftSession.nextPickerId || myRoster.team.id,
      playerId
    );
    if (!result.success) {
      addToast(result.message || 'Pick denied', 'error');
      return;
    }
    addToast('Player picked successfully!', 'success');
    API.fetchLeagues();
    API.fetchDraftSession();
    API.fetchRoster();
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeagueName.trim()) {
      addToast('Please specify a league name', 'error');
      return;
    }
    const created = staticStore.createLeague({
      name: newLeagueName,
      maxTeams: newLeagueSize,
      goalPoints: customGoalPoints,
      assistPoints: customAssistPoints,
    });
    addToast(`Successfully created "${created.name}"!`, 'success');
    setLeagues(prev => [...prev, created]);
    setSelectedLeagueId(created.id);
    setNewLeagueName('');
    setCurrentTab('dashboard');
    API.fetchLeagues();
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    const joined = staticStore.joinLeague(inviteCodeInput);
    if ('error' in joined) {
      addToast(joined.error, 'error');
      return;
    }
    addToast(`Success! Joined "${joined.name}" draft pool`, 'success');
    setLeagues(prev => (prev.find(l => l.id === joined.id) ? prev.map(l => (l.id === joined.id ? joined : l)) : [...prev, joined]));
    setSelectedLeagueId(joined.id);
    setInviteCodeInput('');
    API.fetchLeagues();
  };

  const handleFillWithBots = async () => {
    if (!selectedLeagueId) return;
    const updated = staticStore.fillWithBots(selectedLeagueId);
    if ('error' in updated) {
      addToast(updated.error, 'error');
      return;
    }
    addToast('Autofilled remaining team slots with CPU bots!', 'success');
    setLeagues(prev => prev.map(l => (l.id === updated.id ? updated : l)));
    setActiveLeague(updated);
  };

  // Lineup manager state swaps
  const handleSwapSquadSpot = async (playerToMoveId: string, targetTable: 'active' | 'bench') => {
    if (!myRoster) return;
    const team = myRoster.team;
    let newActive = [...team.activePlayerIds];
    let newBench = [...team.benchPlayerIds];

    if (targetTable === 'active' && newBench.includes(playerToMoveId)) {
      // Move from bench to active
      if (newActive.length >= 8) {
        addToast('Lineup limit reached (8 active players maximum). Substitute another player first.', 'info');
        return;
      }
      newBench = newBench.filter(id => id !== playerToMoveId);
      newActive.push(playerToMoveId);
    } else if (targetTable === 'bench' && newActive.includes(playerToMoveId)) {
      // Move from active to bench
      if (newBench.length >= 3) {
        addToast('Bench reserves fully loaded (3 players maximum).', 'info');
        return;
      }
      newActive = newActive.filter(id => id !== playerToMoveId);
      newBench.push(playerToMoveId);
    }

    const result = staticStore.updateLineup(selectedLeagueId, {
      activePlayerIds: newActive,
      benchPlayerIds: newBench,
    });
    if ('error' in result && result.error) {
      addToast(result.error, 'error');
      return;
    }
    addToast('Tactical team layout saved.', 'success');
    API.fetchRoster();
  };

  const handleSetCaptain = async (captainId: string) => {
    const result = staticStore.setCaptain(selectedLeagueId, captainId);
    if ('error' in result && result.error) {
      addToast(result.error, 'error');
      return;
    }
    addToast('Captain band reassigned.', 'success');
    API.fetchRoster();
  };

  const handleSetViceCaptain = async (viceCaptainId: string) => {
    const result = staticStore.setCaptain(selectedLeagueId, undefined, viceCaptainId);
    if ('error' in result && result.error) {
      addToast(result.error, 'error');
      return;
    }
    addToast('Vice-Captain band reassigned.', 'success');
    API.fetchRoster();
  };

  const handleAutoOptimizeLineup = async () => {
    if (!myRoster) return;
    const allSquad = [...myRoster.active, ...myRoster.bench];
    if (allSquad.length === 0) {
      addToast('No squad assets to optimize yet. Complete some draft picks first!', 'error');
      return;
    }
    // Sort all by points descending
    const sorted = [...allSquad].sort((a, b) => b.points - a.points);
    // Suggest top 8 as active, bottom 3 as bench
    const best8Ids = sorted.slice(0, 8).map(p => p.id);
    const benchIds = sorted.slice(8, 11).map(p => p.id);
    const topCapId = sorted[0]?.id;

    const r1 = staticStore.updateLineup(selectedLeagueId, {
      activePlayerIds: best8Ids,
      benchPlayerIds: benchIds,
    });
    if (topCapId) staticStore.setCaptain(selectedLeagueId, topCapId);
    if ('error' in r1 && r1.error) {
      addToast(r1.error, 'error');
      return;
    }
    addToast('Lineup & Captain automated via Scout AI optimizer!', 'success');
    API.fetchRoster();
  };

  const getWaiverDropPlayers = (): Player[] => {
    const fromRoster = [...(myRoster?.active ?? []), ...(myRoster?.bench ?? [])];
    return fromRoster.length > 0 ? fromRoster : STATIC_DROP_PLAYERS;
  };

  const getWaiverAddPlayers = (): Player[] => {
    const ownedIds = new Set<string>();
    activeLeague?.teams.forEach(t => {
      t.activePlayerIds.forEach(id => ownedIds.add(id));
      t.benchPlayerIds.forEach(id => ownedIds.add(id));
    });
    const fromPool = allPlayersPool.filter(p => !ownedIds.has(p.id));
    return fromPool.length > 0 ? fromPool : STATIC_ADD_PLAYERS;
  };

  const openWaiverModal = () => {
    const drops = getWaiverDropPlayers();
    const adds = getWaiverAddPlayers();
    setSelectedDropPlayer(drops[0] ?? null);
    setSelectedAddPlayer(adds[0] ?? null);
    setIsWaiverModalOpen(true);
  };

  const openFwwbModal = () => {
    const drops = getWaiverDropPlayers();
    const adds = getWaiverAddPlayers();
    setSelectedDropPlayer(drops[0] ?? null);
    setSelectedAddPlayer(adds[0] ?? null);
    setFwwbBidAmount(Math.min(15, fwwbInfo.myRemaining));
    setIsFwwbModalOpen(true);
  };

  const handleFwwbProposal = async () => {
    if (!selectedDropPlayer || !selectedAddPlayer) {
      addToast('Select drop and add players for your FWWB bid.', 'error');
      return;
    }
    if (fwwbBidAmount < fwwbInfo.minBid) {
      addToast(`Minimum FWWB bid is $${fwwbInfo.minBid}.`, 'error');
      return;
    }
    if (fwwbBidAmount > fwwbInfo.myRemaining) {
      addToast(`Bid exceeds remaining budget ($${fwwbInfo.myRemaining}).`, 'error');
      return;
    }
    const teamName = myRoster?.team?.name || 'Tejpal FC';
    const result = staticStore.submitFwwbBid(
      selectedLeagueId,
      selectedDropPlayer.id,
      selectedAddPlayer.id,
      fwwbBidAmount
    );
    if ('error' in result && result.error) {
      setFwwbInfo(prev => ({
        ...prev,
        bids: [
          ...prev.bids.filter(b => b.id !== `fwwb-${Date.now()}`),
          buildStaticFwwbBid(
            selectedDropPlayer.id,
            selectedDropPlayer.name,
            selectedAddPlayer.id,
            selectedAddPlayer.name,
            fwwbBidAmount,
            selectedLeagueId,
            teamName
          ),
        ],
      }));
      addToast(result.error, 'info');
      return;
    }
    addToast(`FWWB bid placed: $${fwwbBidAmount} on ${selectedAddPlayer.name}`, 'success');
    setSelectedAddPlayer(null);
    setSelectedDropPlayer(null);
    setIsFwwbModalOpen(false);
    API.fetchFwwb();
  };

  const handleDeleteFwwbBid = async (bidId: string) => {
    setFwwbInfo(prev => ({ ...prev, bids: prev.bids.filter(b => b.id !== bidId) }));
    staticStore.deleteFwwbBid(selectedLeagueId, bidId);
    addToast('FWWB bid canceled.', 'info');
    API.fetchFwwb();
  };

  const handleProcessFwwb = async () => {
    const data = staticStore.processFwwbBids(selectedLeagueId);
    if ('error' in data && data.error) {
      addToast(data.error, 'error');
      return;
    }
    addToast(`FWWB auction processed — ${data.processedCount ?? 0} award(s).`, 'success');
    API.fetchFwwb();
    API.fetchRoster();
    API.fetchLeagues();
  };

  const myFwwbBids = fwwbInfo.bids.filter(
    b => b.teamName === (myRoster?.team?.name || 'Tejpal FC') || b.teamId === 'team-user'
  );

  const handleWaiverProposal = async () => {
    if (!selectedDropPlayer || !selectedAddPlayer) {
      addToast('Select both a player to release and a free agent to acquire.', 'error');
      return;
    }

    const teamName = myRoster?.team?.name || 'Tejpal FC';
    const priority =
      waiverInfo.teamPriorityList.find((t: { teamName: string }) => t.teamName === teamName)?.priority ?? 2;

    const applyLocalClaim = (claim: WaiverClaim) => {
      setWaiverInfo(prev => ({
        ...prev,
        claims: [...prev.claims.filter(c => c.id !== claim.id), claim],
      }));
      setSelectedAddPlayer(null);
      setSelectedDropPlayer(null);
      setIsWaiverModalOpen(false);
    };

    const newClaim = staticStore.submitWaiver(
      selectedLeagueId,
      selectedDropPlayer.id,
      selectedAddPlayer.id
    );
    if ('error' in newClaim) {
      applyLocalClaim(
        buildStaticWaiverClaim(selectedDropPlayer, selectedAddPlayer, selectedLeagueId, teamName, priority)
      );
      addToast(newClaim.error, 'info');
      return;
    }
    applyLocalClaim(newClaim);
    addToast('Waiver claim submitted!', 'success');
    API.fetchWaivers();
    API.fetchRoster();
  };

  const handleDeleteWaiverClaim = async (claimId: string) => {
    setWaiverInfo(prev => ({
      ...prev,
      claims: prev.claims.filter(c => c.id !== claimId),
    }));
    staticStore.deleteWaiver(selectedLeagueId, claimId);
    addToast('Waiver proposal removed.', 'info');
    API.fetchWaivers();
  };

  const handleProcessWaivers = async () => {
    const data = staticStore.processWaivers(selectedLeagueId);
    addToast(`Processed ${data.processedCount ?? 0} waiver claim(s)!`, 'success');
    API.fetchWaivers();
    API.fetchRoster();
    API.fetchLeagues();
  };

  const handleSimulateGameweek = async () => {
    const data = staticStore.simulateGameweek(selectedLeagueId);
    if ('error' in data && data.error) {
      addToast(data.error, 'error');
      return;
    }
    addToast('Gameweek simulation complete!', 'success');
    API.fetchLeagues();
    API.fetchMatchups();
    API.fetchRoster();
  };

  const markNotificationRead = async (id: string) => {
    staticStore.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // View Filter helpers
  const filteredPlayersList = players.filter(p => {
    const term = searchQuery.toLowerCase();
    const matchesQuery = p.name.toLowerCase().includes(term) || p.club.toLowerCase().includes(term);
    const matchesPosition = positionFilter === 'ALL' || p.position === positionFilter;
    return matchesQuery && matchesPosition;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <span className="px-2 py-0.5 text-xs rounded bg-green-500/15 text-green-400 border border-green-500/30">Available</span>;
      case 'Doubtful':
        return <span className="px-2 py-0.5 text-xs rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">Doubtbful</span>;
      case 'Injured':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-500/15 text-red-400 border border-red-500/30">Injured</span>;
      case 'Suspended':
        return <span className="px-2 py-0.5 text-xs rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">Suspended</span>;
      default:
        return null;
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#f3f4f6] flex flex-col justify-between font-sans" id="auth-portal-screen">
        {/* GLOBAL TOAST ALERTS */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-lg shadow-xl flex items-center gap-3 border transition-all duration-300 transform translate-y-0 ${
                t.type === 'success' ? 'bg-green-950/90 text-green-300 border-green-500/40' :
                t.type === 'error' ? 'bg-red-950/90 text-red-300 border-red-500/40' :
                'bg-[#111827] text-purple-300 border-brand-purple/40'
              }`}
            >
              {t.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /> : <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />}
              <span className="text-sm font-medium">{t.message}</span>
            </div>
          ))}
        </div>

        {/* HERO HEADER */}
        <header className="border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-4 flex items-center justify-between shadow-md" id="auth-header">
          <div className="flex items-center gap-3 mx-auto md:mx-0">
            <div className="bg-brand-neon p-2.5 rounded-lg text-[#030712] font-black glow-primary">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg lg:text-xl tracking-tight text-white flex items-center gap-2">
                PREMIER <span className="text-brand-neon">DRAFT</span> FANTASY
              </h1>
              <p className="text-xs text-slate-400 font-medium">Unique Ownership • 10-Digit US Mobile Auth Gateway</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            <span>Identity Demonstration Mode</span>
          </div>
        </header>

        {/* MAIN BODY AREA FOR AUTH CARD */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-b from-[#0b0f19] via-[#030712] to-black">
          <div className="w-full max-w-4xl bg-[#111827]/60 rounded-3xl border border-white/10 overflow-hidden shadow-2xl glass-panel grid grid-cols-1 md:grid-cols-12">
            
            {/* BRAND VALUE ACCENTS IN LEFT AREA */}
            <div className="md:col-span-5 bg-gradient-to-b from-brand-purple/80 to-[#0e1320] p-8 flex flex-col justify-between border-r border-white/5 relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-5 mix-blend-overlay pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                <span className="px-2.5 py-0.5 bg-brand-neon/20 text-brand-neon text-[10px] font-extrabold rounded-full uppercase tracking-widest inline-block border border-brand-neon/30">
                  Unique Ownership
                </span>
                
                <h3 className="text-2xl lg:text-3xl font-display font-medium text-white leading-tight tracking-tight">
                  SNAKE DRAFT.<br />
                  NO DUPLICATES.
                </h3>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Unlike traditional setups, drafted players are uniquely locked to single rosters. Use real-time serpentine rounds and reverse standings waiver wires to build an absolute powerhouse.
                </p>

                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-neon flex-shrink-0 mt-0.5" />
                    <span>Live serpentine snake draft room with auto backups</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-neon flex-shrink-0 mt-0.5" />
                    <span>Continuous automated reverse-standing waivers</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand-neon flex-shrink-0 mt-0.5" />
                    <span>Head-to-Head simulated battles next gameweek</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 relative z-10 text-[11px] text-slate-400 space-y-1.5 font-mono bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sandbox Parameters
                </div>
                <div>Country Dial: <span className="text-white font-sans font-semibold">+1 (United States)</span></div>
                <div>Dynamic Code Check: <span className="text-white font-sans font-semibold">10 Digits Allowed</span></div>
                <div>Demonstration OTP: <span className="text-brand-neon font-sans font-extrabold">123456</span></div>
              </div>
            </div>

            {/* INTERACTIVE COMPONENT ACTION FORM IN RIGHT AREA */}
            <div className="md:col-span-7 p-6 lg:p-8 flex flex-col justify-center bg-black/10">
              
              {/* COMPONENT FLOWS */}
              {!authOtpSent ? (
                <div className="space-y-6">
                  {/* TABS SELECTOR */}
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('login'); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        authMode === 'login' ? 'bg-brand-neon text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Login with OTP
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('signup'); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                        authMode === 'signup' ? 'bg-brand-neon text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Register New Club
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-display font-semibold text-white mb-1">
                      {authMode === 'login' ? 'Manager Verification Access' : 'Create Champion Manager Card'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {authMode === 'login' ? 'Input your US-based 10-digit primary phone number to receive a secure OTP.' : 'Register your exclusive manager name and club brand details below.'}
                    </p>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!authPhone.trim()) {
                        addToast('Please enter a phone number', 'error');
                        return;
                      }
                      const rawPhone = authPhone.replace(/\D/g, '');
                      if (rawPhone.length !== 10) {
                        addToast('Country code prefix locked to +1. Local US line must have 10 digits.', 'error');
                        return;
                      }
                      if (authMode === 'signup') {
                        if (!signupUsername.trim()) {
                          addToast('Manager display name is required for signup.', 'error');
                          return;
                        }
                        if (!signupTeamName.trim()) {
                          addToast('Club squad brand name is required for registration.', 'error');
                          return;
                        }
                        if (!signupEmail.trim() || !signupEmail.includes('@')) {
                          addToast('Please input a valid email address.', 'error');
                          return;
                        }
                      }

                      setIsLoadingAuth(true);
                      const data = staticStore.sendOtp(authPhone);
                      if ('error' in data && data.error) {
                        addToast(data.error, 'error');
                      } else {
                        setAuthOtpSent(true);
                        addToast('OTP sent! Enter verification code: 123456', 'success');
                      }
                      setIsLoadingAuth(false);
                    }}
                    className="space-y-4"
                  >
                    {/* IF REGISTRATION MODE, ADD SIGNUP PROPS */}
                    {authMode === 'signup' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                            Manager Display Name
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Fergie_Gaffer"
                            value={signupUsername}
                            onChange={(e) => setSignupUsername(e.target.value.replace(/\s+/g, '_'))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-neon"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                            Club Squad Name
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Red Devil United"
                            value={signupTeamName}
                            onChange={(e) => setSignupTeamName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-neon"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                            Valid Email Address
                          </label>
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. ferguson@manunited.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-neon"
                          />
                        </div>
                      </div>
                    )}

                    {/* PHONE INPUT WRAPPER */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Primary US Phone Mobile Target
                      </label>
                      
                      <div className="flex gap-2">
                        {/* COUNTRY DIAL CHIP */}
                        <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300">
                          <span>🇺🇸</span>
                          <span>+1</span>
                        </div>

                        {/* INPUT */}
                        <div className="relative flex-1">
                          <input 
                            type="tel"
                            maxLength={14}
                            required
                            placeholder="(201) 555-0199"
                            value={authPhone}
                            onChange={(e) => {
                              // Filter out anything non-numeric
                              const val = e.target.value.replace(/\D/g, '');
                              // Limit to 10 digits
                              const trimmed = val.substring(0, 10);
                              
                              // Stylize US layout: (XXX) XXX-XXXX
                              let formatted = '';
                              if (trimmed.length > 0) {
                                if (trimmed.length <= 3) formatted = `(${trimmed}`;
                                else if (trimmed.length <= 6) formatted = `(${trimmed.slice(0,3)}) ${trimmed.slice(3)}`;
                                else formatted = `(${trimmed.slice(0,3)}) ${trimmed.slice(3,6)}-${trimmed.slice(6)}`;
                              }
                              setAuthPhone(formatted);
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-neon font-mono tracking-wider"
                          />
                          
                          {/* REAL-TIME DIGITS CHECK STATUS */}
                          <div className="absolute right-3.5 top-2.5 text-[9px] text-slate-500 font-mono">
                            {authPhone.replace(/\D/g, '').length}/10
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] mt-1.5 text-slate-500 leading-relax">
                        Input any 10-digit US telephone format. It verifies with standard static OTP security code on the next screen.
                      </p>
                    </div>

                    {/* ACTIONS SUBMIT */}
                    <button
                      type="submit"
                      disabled={isLoadingAuth || authPhone.replace(/\D/g, '').length !== 10}
                      className="w-full bg-brand-neon hover:bg-emerald-400 disabled:bg-white/5 text-black disabled:text-slate-500 font-display font-bold py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                    >
                      {isLoadingAuth ? 'Requesting Secure OTP Dispatch...' : (
                        authMode === 'login' ? 'Retrieve Secure Access Code ⚡' : 'Register Profile & Request OTP'
                      )}
                    </button>
                    
                    {/* FAST DEFAULT FAST TRACK */}
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsLoadingAuth(true);
                          const body = staticStore.verifyOtp('5551234567', '123456', 'Gaffer_Tejpal', undefined, 'Tejpal FC');
                          if ('error' in body && body.error) {
                            addToast(body.error, 'error');
                          } else if (body.user) {
                            setUserProfile(body.user);
                            addToast('Welcome back, Gaffer_Tejpal!', 'success');
                            await API.fetchSession();
                            await API.fetchLeagues();
                            await API.fetchRoster();
                            await API.fetchMatchups();
                          }
                          setIsLoadingAuth(false);
                        }}
                        className="text-xs text-brand-purple hover:text-purple-300 underline font-semibold transition"
                      >
                        ⚡ Fast-track Demo Sign In with Default "Gaffer_Tejpal" Profile
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* OTP CODE INPUT PHASE */
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (authOtp !== '123456') {
                      addToast('Incorrect OTP digits entered. Enter: 123456 to bypass simulation.', 'error');
                      return;
                    }

                    setIsLoadingAuth(true);
                    const data = staticStore.verifyOtp(
                      authPhone,
                      authOtp,
                      authMode === 'signup' ? signupUsername : 'Gaffer_Tejpal',
                      authMode === 'signup' ? signupEmail : 'tejpalsingh.rathore@yudiz.com',
                      authMode === 'signup' ? signupTeamName : 'Tejpal FC'
                    );
                    if ('error' in data && data.error) {
                      addToast(data.error, 'error');
                    } else if (data.user) {
                      addToast('Identity validated! Welcome to draft fantasy.', 'success');
                      setUserProfile(data.user);
                      await API.fetchSession();
                      await API.fetchLeagues();
                      await API.fetchRoster();
                      await API.fetchMatchups();
                      setAuthOtpSent(false);
                      setAuthOtp('');
                      setAuthPhone('');
                    }
                    setIsLoadingAuth(false);
                  }}
                  className="space-y-6 animate-fadeIn"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#22c55e] bg-green-500/10 px-2.5 py-0.5 rounded border border-green-500/20">
                      OTP Dispatch Active
                    </span>
                    <h4 className="text-xl font-display font-medium text-white">Enter Security Token</h4>
                    <p className="text-xs text-slate-400">
                      We have sent an authentication challenge to your local mobile target <strong className="text-brand-neon font-mono">+1 {authPhone}</strong>. Enter the 6-digit dynamic code <span className="text-white hover:text-brand-neon font-bold font-mono font-sans bg-white/5 py-0.5 px-1.5 rounded">123456</span> to access active fantasy databases.
                    </p>
                  </div>

                  {/* CODE INPUT */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Dynamic Code Entry
                      </label>
                      
                      <div className="flex gap-3 justify-center items-center">
                        <input 
                          type="text"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="••••••"
                          value={authOtp}
                          onChange={(e) => {
                            const numeric = e.target.value.replace(/\D/g, '');
                            setAuthOtp(numeric);
                          }}
                          className="w-full max-w-[240px] text-center bg-black/50 border border-white/10 rounded-xl py-2 text-xl font-mono font-semibold tracking-[0.8em] text-brand-neon focus:outline-none focus:border-brand-neon uppercase"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-500/10 text-[11px] text-amber-300 p-3.5 rounded-lg border border-amber-500/20 flex items-start gap-2.5 leading-relaxed font-sans">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        <strong>Demonstration Simulation:</strong> Simply input the default code <code className="font-bold underline text-white">123456</code> to certify the verification process immediately.
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthOtpSent(false);
                          setAuthOtp('');
                        }}
                        className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={isLoadingAuth || authOtp.length !== 6}
                        className="flex-1 bg-brand-neon hover:bg-emerald-400 disabled:bg-white/5 text-black disabled:text-slate-500 font-display font-semibold py-2 rounded-xl text-xs transition uppercase tracking-wider"
                      >
                        {isLoadingAuth ? 'Certifying Verification...' : 'Verify Access Gateway 🚀'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* COMPACT FOOTER */}
        <footer className="border-t border-white/5 bg-[#030712] py-4 text-center text-[10px] text-slate-500">
          Premier Draft Fantasy Platform • Infinite Serpentine Engine • Unique Ownership Model Safeguarded
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-[#f3f4f6]" id="fantasy-platform-root">
      
      {/* GLOBAL TOAST ALERTS */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-lg shadow-xl flex items-center gap-3 border transition-all duration-300 transform translate-y-0 ${
              t.type === 'success' ? 'bg-green-950/90 text-green-300 border-green-500/40' :
              t.type === 'error' ? 'bg-red-950/90 text-red-300 border-red-500/40' :
              'bg-[#111827] text-purple-300 border-brand-purple/40'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /> : <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />}
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between" id="app-header">
        <div className="flex items-center gap-3">
          <div className="bg-brand-neon p-2 rounded-lg text-[#030712] font-black glow-primary">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg lg:text-xl tracking-tight text-white flex items-center gap-2">
              PREMIER <span className="text-brand-neon">DRAFT</span> FANTASY
            </h1>
            <p className="text-xs text-slate-400">Unique Ownership • Head-to-Head • Reverse-Order Waivers</p>
          </div>
        </div>

        {/* ACTIVE LEAGUE DROPDOWN CONTROLLER */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-slate-400">Current League</span>
            <select 
              id="header-league-selector"
              value={selectedLeagueId} 
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="bg-[#111827] border border-white/10 rounded-md px-2.5 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-neon text-white"
            >
              {leagues.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.status === 'Drafting' ? '(Drafting!)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* USER CHIP */}
          {userProfile && (
            <div className="flex items-center gap-2.5" id="user-header-profile">
              <div className="flex items-center gap-2 bg-[#111827]/80 px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-6 h-6 rounded-full bg-brand-purple text-xs font-bold flex items-center justify-center text-white uppercase">
                  {userProfile.username.substring(0, 2)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-medium text-slate-100">{userProfile.username}</span>
                  {userProfile.phone && (
                    <span className="text-[10px] text-brand-neon font-mono">
                      +1 ({userProfile.phone.substring(0,3)}) {userProfile.phone.substring(3,6)}-{userProfile.phone.substring(6)}
                    </span>
                  )}
                </div>
              </div>
              <button 
                id="header-logout-btn"
                onClick={handleLogout}
                className="px-2.5 py-1.5 text-xs bg-red-950/40 text-red-400 hover:text-white border border-red-500/20 rounded-lg hover:bg-red-500/20 transition font-bold"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="w-full max-w-none px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-70px)]">
        
        {/* LEFTSIDE NAVIGATION LINKS */}
        <aside className="lg:w-64 flex-shrink-0 flex flex-col gap-1.5" id="navigation-sidebar">
          
          <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl mb-4">
            <div className="flex items-center gap-2 text-brand-purple mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Gameweek {activeLeague?.currentGameweek || 1}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Status: <strong className="text-white">{activeLeague?.status || 'Lobby'}</strong></span>
              <button 
                onClick={handleSimulateGameweek}
                disabled={activeLeague?.status !== 'Active'}
                className="px-2 py-1 ml-2 bg-brand-neon/20 hover:bg-brand-neon text-brand-neon hover:text-black rounded text-[10px] font-bold transition disabled:opacity-30 disabled:pointer-events-none"
              >
                Simulate Match
              </button>
            </div>
          </div>

          <button 
            id="tab-btn-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              currentTab === 'dashboard' ? 'bg-white/10 text-white border-l-4 border-brand-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5 flex-shrink-0" />
            <span>Dashboard Lobby</span>
          </button>

          <button 
            id="tab-btn-draft"
            onClick={() => setCurrentTab('draft-room')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition relative ${
              currentTab === 'draft-room' ? 'bg-white/10 text-white border-l-4 border-brand-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Play className="w-5 h-5 text-brand-neon" />
            <span>Draft Room</span>
            {activeLeague?.status === 'Drafting' && (
              <span className="absolute right-3 top-3.5 w-2.5 h-2.5 bg-brand-neon rounded-full animate-ping" />
            )}
          </button>

          <button 
            id="tab-btn-squad"
            onClick={() => setCurrentTab('my-squad')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              currentTab === 'my-squad' ? 'bg-white/10 text-white border-l-4 border-brand-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <span>Tactical Squad</span>
          </button>

          <button 
            id="tab-btn-waivers"
            onClick={() => setCurrentTab('waivers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              currentTab === 'waivers' ? 'bg-white/10 text-white border-l-4 border-brand-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 flex-shrink-0" />
            <span>Waiver Wire</span>
          </button>

          <button 
            id="tab-btn-players"
            onClick={() => setCurrentTab('players')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              currentTab === 'players' ? 'bg-white/10 text-white border-l-4 border-brand-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5 flex-shrink-0" />
            <span>Player Database</span>
          </button>

          <button 
            id="tab-btn-matchups"
            onClick={() => setCurrentTab('matchups')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              currentTab === 'matchups' ? 'bg-white/10 text-white border-l-4 border-brand-neon' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span>Head-to-Head Matches</span>
          </button>

        </aside>

        {/* MAIN PANEL CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-[#111827]/45 rounded-2xl border border-white/5 p-4 lg:p-6 shadow-2xl glass-panel relative">
          
          {/* TAB 1: DASHBOARD LOBBY */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6" id="dashboard-tab-panel">
              
              {/* LEAGUE BANNER AND RECRUITING (HERO SECTION WITH INTEGRATED UPCOMING DRAFT SIDE) */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1E1B4B]/80 via-[#111827] to-[#030712] p-6 lg:p-8 border border-brand-purple/20 shadow-2xl">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEFT: LEAGUE SUMMARY — PL crests watermark lives here only */}
                  <div className="lg:col-span-7 relative overflow-hidden rounded-xl flex flex-col justify-between space-y-4 min-h-[220px]">
                    <PremierLeagueLogosBackdrop />
                    <div className="relative z-10 flex flex-col justify-between space-y-4 flex-1">
                    <div>
                      <span className="px-3 py-1 bg-brand-neon/15 text-brand-neon text-xs font-semibold rounded-full uppercase tracking-wider mb-3 inline-block">
                        🛡️ Gaffer Draft Arena
                      </span>
                      <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mb-3">
                        {activeLeague?.name || 'Loading Premier League Draft...'}
                      </h2>
                      <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                        Recruit raw elite players into your unique head-to-head draft league. 
                        Once selected during the snake rounds, drafted players are uniquely locked to individual rosters. No overlap, pure strategy.
                      </p>
                    </div>

                    {/* METRICS & QUICK RULES INFO */}
                    <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 items-center text-xs text-slate-400">
                      <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded">
                        <Users className="w-4 h-4 text-brand-neon" />
                        <span>Managers: <strong className="text-white font-mono">{activeLeague?.members.length || 0}/{activeLeague?.maxTeams || 8}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded">
                        <Calendar className="w-4 h-4 text-brand-purple" />
                        <span>Current Gameweek: <strong className="text-white font-mono">{activeLeague?.currentGameweek || 1}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Ruleset: <strong className="text-white">FPL Serpentine Draft</strong></span>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* RIGHT: FEATURED UPCOMING CONTEST */}
                  <div className="lg:col-span-5 bg-black/50 border border-white/10 p-5 rounded-2xl space-y-4 relative overflow-hidden backdrop-blur-md shadow-2xl">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="h-2.5 w-2.5 rounded-full block animate-pulse bg-amber-400" />
                    </div>

                    {featuredUpcomingContest ? (
                      <>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                            Countdown to Live Round
                          </span>
                          <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-neon flex-shrink-0" />
                            <span className="line-clamp-2">{featuredUpcomingContest.title}</span>
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {featuredUpcomingContest.description}
                          </p>
                        </div>

                        <div className="bg-[#111827] px-4 py-3.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                              Draft Commences In
                            </span>
                            <strong className="text-xl font-mono font-black text-brand-neon tracking-wide mt-0.5">
                              {draftCountdown}
                            </strong>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block font-semibold">Scheduled Kickoff</span>
                            <span className="text-xs font-mono font-bold text-brand-purple mt-0.5 block">
                              12:30 BST • May 23
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-brand-neon/10 border border-brand-neon/25 rounded-lg px-2.5 py-2">
                            <span className="text-slate-500 font-semibold uppercase block text-[9px]">Prize Pool</span>
                            <span className="text-brand-neon font-black font-mono text-sm">
                              {featuredUpcomingContest.prizePool ?? featuredUpcomingContest.prizes}
                            </span>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-2 text-right">
                            <span className="text-slate-500 font-semibold uppercase block text-[9px]">Winning Amount</span>
                            <span className="text-amber-300 font-black font-mono text-sm">
                              {featuredUpcomingContest.winningAmount ?? '—'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-semibold">
                            {featuredUpcomingContest.tag}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                            GW{featuredUpcomingContest.gameweek}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                            {featuredUpcomingContest.participants}/{featuredUpcomingContest.maxParticipants} joined
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-bold">
                            {featuredUpcomingContest.entryFee}
                          </span>
                        </div>

                        <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/25 flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-slate-400">Contest Status</div>
                            <div className="text-sm font-bold text-amber-300">
                              {featuredUpcomingContest.joined ? 'Enlisted — Ready to Draft' : 'Upcoming — Open for Entry'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJoinContest(featuredUpcomingContest.id)}
                          disabled={
                            !featuredUpcomingContest.joined &&
                            featuredUpcomingContest.participants >= featuredUpcomingContest.maxParticipants
                          }
                          className="w-full bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-40 disabled:pointer-events-none text-white py-2.5 px-4 rounded-xl transition text-sm font-display font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-950/30"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          {featuredUpcomingContest.joined ? 'Resume Draft' : 'Join Draft'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="py-8 text-center space-y-3">
                        <p className="text-xs text-slate-400">No upcoming contests right now.</p>
                        <button
                          type="button"
                          onClick={() => setCurrentTab('draft-room')}
                          className="text-xs font-bold text-brand-neon hover:underline"
                        >
                          Browse Draft Room
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* THREE COLUMN GRID: LEAGUE STANDINGS, UPCOMING MATCHUP, NOTIFICATIONS PANEL */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* COLUMN 1: LIVE ACTION HUB */}
                <div className="xl:col-span-2 space-y-4">

                  {/* UPCOMING REAL-WORLD PL FIXTURES */}
                  <div className="bg-[#111827]/80 rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl" id="rw-premier-fixtures-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-brand-neon" />
                          Upcoming Premier League Fixtures
                        </h3>
                        <p className="text-xs text-slate-400">Track elite real-world matchups & scout top draft targets</p>
                      </div>

                      {/* GAMEWEEK SLIDER */}
                      <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
                        {[1, 2, 3].map((gw) => (
                          <button
                            key={gw}
                            type="button"
                            onClick={() => setRwGameweek(gw)}
                            className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                              rwGameweek === gw
                                ? 'bg-brand-neon text-black pb-1 pt-1'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 transition'
                            }`}
                          >
                            GW{gw}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {REAL_WORLD_FIXTURES.filter(f => f.gameweek === rwGameweek).map((fixture) => {
                        return (
                          <div 
                            key={fixture.id} 
                            className="bg-black/30 border border-white/5 hover:border-white/10 transition p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
                          >
                            {/* DATE, TIME & VENUE */}
                            <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-[200px]">
                              <span className="text-[10px] text-brand-neon font-mono font-bold uppercase tracking-wider">
                                {fixture.time}
                              </span>
                              <span className="text-xs text-slate-300 font-semibold mt-0.5">
                                {fixture.date}
                              </span>
                              <span className="text-[11px] text-slate-500 mt-0.5">
                                🏟️ {fixture.venue}
                              </span>
                            </div>

                            {/* TEAMS LOGOS & NAMES */}
                            <div className="flex-1 flex items-center justify-center gap-4 py-2">
                              {/* HOME TEAM */}
                              <div className="flex items-center gap-2 w-1/3 justify-end text-right">
                                <span className="font-display font-bold text-sm text-white hidden sm:inline">{fixture.homeTeam}</span>
                                <span className="font-mono font-bold text-xs text-white sm:hidden">{fixture.homeTeamCode}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner border border-white/10 text-white ${
                                  fixture.homeTeam === 'Liverpool' ? 'bg-red-800' :
                                  fixture.homeTeam === 'Arsenal' ? 'bg-red-600' :
                                  fixture.homeTeam === 'Man City' ? 'bg-sky-400 text-slate-900' :
                                  fixture.homeTeam === 'Chelsea' ? 'bg-blue-700' :
                                  fixture.homeTeam === 'Man United' ? 'bg-red-950' :
                                  fixture.homeTeam === 'Tottenham' ? 'bg-slate-200 text-slate-900' :
                                  'bg-amber-600'
                                }`}>
                                  {fixture.homeTeamCode}
                                </div>
                              </div>

                              <div className="text-slate-500 font-bold px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[11px] font-mono tracking-wider">
                                VS
                              </div>

                              {/* AWAY TEAM */}
                              <div className="flex items-center gap-2 w-1/3 justify-start text-left">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner border border-white/10 text-white ${
                                  fixture.awayTeam === 'Liverpool' ? 'bg-red-800' :
                                  fixture.awayTeam === 'Arsenal' ? 'bg-red-600' :
                                  fixture.awayTeam === 'Man City' ? 'bg-sky-400 text-slate-900' :
                                  fixture.awayTeam === 'Chelsea' ? 'bg-blue-700' :
                                  fixture.awayTeam === 'Man United' ? 'bg-red-950' :
                                  fixture.awayTeam === 'Tottenham' ? 'bg-slate-200 text-slate-900' :
                                  'bg-amber-600'
                                }`}>
                                  {fixture.awayTeamCode}
                                </div>
                                <span className="font-display font-bold text-sm text-white hidden sm:inline">{fixture.awayTeam}</span>
                                <span className="font-mono font-bold text-xs text-white sm:hidden">{fixture.awayTeamCode}</span>
                              </div>
                            </div>

                            {/* VOTING PREDICTION ACTION PREVIEW */}
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                                Prediction
                              </span>

                              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                {['HOME', 'DRAW', 'AWAY'].map((predictValue) => {
                                  const labelMap: Record<string, string> = { HOME: '1', DRAW: 'X', AWAY: '2' };
                                  const descMap: Record<string, string> = { HOME: 'Home Win', DRAW: 'Draw', AWAY: 'Away Win' };
                                  const active = predictions[fixture.id] === predictValue;
                                  return (
                                    <button
                                      key={predictValue}
                                      type="button"
                                      title={descMap[predictValue]}
                                      onClick={() => {
                                        setPredictions(prev => ({ ...prev, [fixture.id]: predictValue as any }));
                                        addToast(`Logged prediction: ${fixture.homeTeamCode} vs ${fixture.awayTeamCode} (${descMap[predictValue]})!`, 'success');
                                      }}
                                      className={`w-9 h-8 rounded flex items-center justify-center font-mono font-bold text-xs transition-all ${
                                        active 
                                          ? 'bg-brand-neon text-black scale-105 shadow-md shadow-brand-neon/20 font-black' 
                                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                                      }`}
                                    >
                                      {labelMap[predictValue]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* REAL-WORLD PLAYER NEWS, CLUB UPDATES & INJURY NETWORK */}
                  <div className="bg-[#111827]/80 rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl" id="scout-news-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                          <Newspaper className="w-5 h-5 text-brand-purple" />
                          Gaffer Scout Intelligence Room
                        </h3>
                        <p className="text-xs text-slate-400">Real-world Premier League player news, injury updates, & transfer alerts</p>
                      </div>

                      {/* QUICK SEARCH */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Scout player or club..."
                          value={newsSearch}
                          onChange={(e) => setNewsSearch(e.target.value)}
                          className="w-full sm:w-48 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2" />
                      </div>
                    </div>

                    {/* CATEGORIES SWITCHER */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        { id: 'all', label: 'All Updates' },
                        { id: 'injury', label: '🏥 Injury Alerts' },
                        { id: 'transfer', label: '🤝 Deals & Rumours' },
                        { id: 'stats', label: '📊 Stats & Form' },
                        { id: 'general', label: '📣 Club News' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setNewsCategoryFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            newsCategoryFilter === tab.id
                              ? 'bg-brand-purple text-white shadow-md'
                              : 'bg-black/30 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* NEWS LIST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {REAL_WORLD_NEWS
                        .filter(article => {
                          if (newsCategoryFilter !== 'all' && article.category !== newsCategoryFilter) {
                            return false;
                          }
                          if (newsSearch.trim() !== '') {
                            const query = newsSearch.toLowerCase();
                            return (
                              article.title.toLowerCase().includes(query) ||
                              article.summary.toLowerCase().includes(query) ||
                              article.content.toLowerCase().includes(query) ||
                              article.team.toLowerCase().includes(query) ||
                              (article.playerRelated && article.playerRelated.toLowerCase().includes(query))
                            );
                          }
                          return true;
                        })
                        .map((article) => {
                          const isHigh = article.severity === 'high';
                          return (
                            <div
                              key={article.id}
                              className={`rounded-xl p-4 transition-all border flex flex-col justify-between ${
                                isHigh
                                  ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-950/25'
                                  : 'bg-black/25 hover:bg-black/45 border-white/5 hover:border-white/15'
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  {/* TEAM / PLAYER ATTACHMENT */}
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                      article.teamCode === 'CHE' ? 'bg-blue-900/60 text-blue-200 border border-blue-500/30' :
                                      article.teamCode === 'LIV' ? 'bg-red-900/60 text-red-200 border border-red-500/30' :
                                      article.teamCode === 'ARS' ? 'bg-red-950 text-red-200 border border-red-500/30' :
                                      article.teamCode === 'MCI' ? 'bg-sky-950 text-sky-200 border border-sky-500/20' :
                                      article.teamCode === 'MUN' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                                      'bg-[#1e1b4b] text-indigo-200'
                                    }`}>
                                      {article.teamCode}
                                    </span>
                                    {article.playerRelated && (
                                      <span className="text-xs font-semibold text-slate-200">
                                        👤 {article.playerRelated}
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {article.publishedAt}
                                  </span>
                                </div>

                                <div>
                                  <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                                    {article.title}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                    {article.summary}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3.5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
                                {article.statusBadge ? (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    article.statusBadge.includes('⚠️') ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' :
                                    article.statusBadge.includes('🚨') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    article.statusBadge.includes('✅') ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25' :
                                    article.statusBadge.includes('🔥') ? 'bg-green-400/10 text-green-300 border border-green-400/20' :
                                    'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                                  }`}>
                                    {article.statusBadge}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Update</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedNewsId(article.id)}
                                  className="text-xs font-bold text-brand-purple hover:text-brand-neon transition flex items-center gap-0.5"
                                >
                                  Read Full Scouting Report ➔
                                </button>
                              </div>

                            </div>
                          );
                        })}

                      {REAL_WORLD_NEWS.filter(article => {
                        if (newsCategoryFilter !== 'all' && article.category !== newsCategoryFilter) {
                          return false;
                        }
                        if (newsSearch.trim() !== '') {
                          const query = newsSearch.toLowerCase();
                          return (
                            article.title.toLowerCase().includes(query) ||
                            article.summary.toLowerCase().includes(query) ||
                            article.content.toLowerCase().includes(query) ||
                            article.team.toLowerCase().includes(query) ||
                            (article.playerRelated && article.playerRelated.toLowerCase().includes(query))
                          );
                        }
                        return true;
                      }).length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center py-10 bg-black/10 rounded-xl border border-white/5 text-slate-500 text-xs shadow-inner">
                          No matching intelligence reports found for "{newsSearch}".
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedCompletedContest && (
                    <div 
                      className="bg-gradient-to-b from-[#111827] to-[#1e1b4b]/95 rounded-2xl border-2 border-brand-purple/50 p-6 space-y-6 shadow-2xl relative"
                      id="dfs-completed-tourney-scoreboard"
                    >
                      {/* Top Action Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest bg-brand-purple/30 text-purple-300 border border-brand-purple/40">
                              🏆 LIVE LEADERBOARD
                            </span>
                            <span className="text-xs text-slate-400 font-mono">Gameweek {selectedCompletedContest.gameweek}</span>
                          </div>
                          <h3 className="font-display font-black text-xl text-white tracking-tight">
                            {selectedCompletedContest.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            10-Round Snake Draft • Comparing matches day-by-day across Friday, Saturday, and Sunday tournaments.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCompletedContest(null);
                            }}
                            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
                          >
                            ✕ Close Matches View
                          </button>
                        </div>
                      </div>

                      {/* Day Selectors Slider */}
                      <div className="grid grid-cols-3 gap-2 bg-black/45 p-1 rounded-xl border border-white/5">
                        {[
                          { id: 1, label: "📅 Friday (Day 1)", status: "Completed Matchday" },
                          { id: 2, label: "📅 Saturday (Day 2)", status: "Completed Matchday" },
                          { id: 3, label: "⚡ Sunday (Day 3)", status: "LIVE Final Round", live: true },
                        ].map((d) => {
                          const isSel = selectedDfsDay === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setSelectedDfsDay(d.id as 1 | 2 | 3);
                                addToast(`Switched scoreboard to ${d.label}!`, 'info');
                              }}
                              className={`py-2 px-3 rounded-lg text-left transition duration-150 ${
                                isSel 
                                  ? 'bg-brand-neon text-black shadow-lg' 
                                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="text-[10px] font-mono tracking-wider font-black uppercase flex items-center gap-1.5">
                                {d.live && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                                {d.label}
                              </div>
                              <div className={`text-[9px] font-bold ${isSel ? 'text-black/75' : 'text-slate-505'}`}>{d.status}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Main Dual Grid: Left Side: Leaderboard Standing & Match Bars. Right Side: Focused Roster Scoring Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN (Standings & H2H Visual Bars) */}
                        <div className="lg:col-span-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] font-mono tracking-wider uppercase font-black text-slate-400 font-sans">
                              Tournament Standings
                            </span>
                            <span className="text-[10px] text-brand-neon font-mono uppercase">
                              Click on manager to compare
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(() => {
                              const standings = getDfsTournamentStandings(selectedCompletedContest, selectedDfsDay);
                              const maxTotal = standings[0]?.totalPoints || 100;

                              return standings.map((mgr, mIdx) => {
                                const isFocused = activeLeaderboardManager === mgr.name;
                                const fillPercentage = (mgr.totalPoints / maxTotal) * 100;
                                
                                return (
                                  <div 
                                    key={mgr.name}
                                    onClick={() => {
                                      setActiveLeaderboardManager(mgr.name);
                                    }}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-2 ${
                                      isFocused
                                        ? 'bg-brand-purple/20 border-brand-purple shadow-md shadow-purple-950/20'
                                        : 'bg-black/25 hover:bg-black/45 border-white/5 hover:border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <div className="text-xs font-mono font-bold text-slate-400">
                                          #{mIdx + 1}
                                        </div>
                                        <img 
                                          src={mgr.avatar} 
                                          alt={mgr.name} 
                                          className="w-5 h-5 rounded-full border border-white/10"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="text-xs font-bold text-white flex items-center gap-1">
                                          <span>{mgr.name}</span>
                                          {mgr.isUser && (
                                            <span className="text-[8px] bg-brand-neon text-black font-black uppercase rounded px-1">YOU</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <span className={`text-xs font-black font-mono ${mgr.isUser ? 'text-brand-neon' : 'text-slate-200'}`}>
                                          {mgr.totalPoints} PTS
                                        </span>
                                      </div>
                                    </div>

                                    {/* Score Progressive Matchup Bar */}
                                    <div className="w-full bg-[#1e293b]/70 h-2.5 rounded-full overflow-hidden border border-white/5 relative">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                                          mgr.isUser 
                                            ? 'bg-brand-neon' 
                                            : isFocused 
                                            ? 'bg-brand-purple' 
                                            : 'bg-indigo-500/65'
                                        }`}
                                        style={{ width: `${Math.max(8, fillPercentage)}%` }}
                                      />
                                    </div>

                                    {/* Breakdown of day-wise points */}
                                    <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-500 pt-0.5">
                                      <span>Fri: {mgr.day1Points} pts</span>
                                      <span>Sat: {mgr.day2Points} pts</span>
                                      <span>Sun: {mgr.day3Points} pts</span>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* RIGHT COLUMN (Detailed Active Roster compare check) */}
                        <div className="lg:col-span-7 space-y-4">
                          {(() => {
                            const standings = getDfsTournamentStandings(selectedCompletedContest, selectedDfsDay);
                            const activeMgr = standings.find(m => m.name === activeLeaderboardManager) || standings[0];
                            const userMgr = standings.find(m => m.isUser);
                            
                            if (!activeMgr) return null;

                            return (
                              <div className="bg-black/35 rounded-xl border border-white/10 p-4 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={activeMgr.avatar} 
                                      alt={activeMgr.name} 
                                      className="w-10 h-10 rounded-full border border-white/15"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-black">Active Roster Selection</div>
                                      <h4 className="font-display font-black text-sm text-white flex items-center gap-1.5">
                                        {activeMgr.name}'s Squad
                                        {activeMgr.isUser && <span className="text-[10px] text-brand-neon font-black font-mono tracking-widest">[YOU]</span>}
                                      </h4>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-[9px] font-mono uppercase text-slate-400">Selected Day Pts</div>
                                    <div className="text-base font-black font-mono text-brand-neon">
                                      {selectedDfsDay === 1 ? activeMgr.day1Points : selectedDfsDay === 2 ? activeMgr.day2Points : activeMgr.day3Points} PTS
                                    </div>
                                  </div>
                                </div>

                                {/* Comparison Stats mini widget against user if viewing bots */}
                                {!activeMgr.isUser && userMgr && (
                                  <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl flex items-center justify-between text-[11px] text-slate-300">
                                    <span className="font-medium">Direct Comparison against your squad:</span>
                                    <div className="flex items-center gap-2 font-mono">
                                      <span className="text-white font-bold">{userMgr.totalPoints} pts</span>
                                      <span className="text-slate-500">vs</span>
                                      <span className="text-brand-neon font-bold">{activeMgr.totalPoints} pts</span>
                                      <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[9px] ${
                                        (userMgr.totalPoints > activeMgr.totalPoints) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                      }`}>
                                        {userMgr.totalPoints > activeMgr.totalPoints ? `+${(userMgr.totalPoints - activeMgr.totalPoints).toFixed(1)} Up` : `${(userMgr.totalPoints - activeMgr.totalPoints).toFixed(1)} Down`}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Roster Table Grid */}
                                <div className="space-y-1.5">
                                  <div className="grid grid-cols-12 text-[9px] text-slate-500 font-mono uppercase font-black px-2 pb-1 border-b border-white/5">
                                    <div className="col-span-2">POS</div>
                                    <div className="col-span-6">STAR PLAYER</div>
                                    <div className="col-span-2 text-right">TOTAL PTS</div>
                                    <div className="col-span-2 text-right font-sans">DAY SCORE</div>
                                  </div>

                                  <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
                                    {activeMgr.playerScores.map((player: any) => {
                                      return (
                                        <div 
                                          key={player.id} 
                                          className="grid grid-cols-12 items-center text-xs p-2 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition"
                                        >
                                          <div className="col-span-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                                              player.position === 'QB' ? 'bg-indigo-500/10 text-indigo-400' :
                                              player.position === 'RB' ? 'bg-orange-500/10 text-orange-400' :
                                              player.position === 'WR' ? 'bg-lime-500/10 text-lime-400' :
                                              player.position === 'TE' ? 'bg-cyan-500/10 text-cyan-400' :
                                              'bg-amber-500/10 text-amber-400'
                                            }`}>
                                              {player.position}
                                            </span>
                                          </div>
                                          <div className="col-span-6">
                                            <div className="font-bold text-white transition hover:text-brand-neon cursor-default truncate">{player.name}</div>
                                            <div className="text-[9px] text-slate-500 font-mono uppercase">{player.team} • Opp: NYG</div>
                                          </div>
                                          <div className="col-span-2 text-right font-mono text-slate-400 text-[11px]">
                                            {player.points || player.proj || 20} pts
                                          </div>
                                          <div className="col-span-2 text-right font-mono font-black text-brand-neon text-xs">
                                            {player.activeDayScore} pts
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* CONTESTS & TOURNAMENTS LISTING */}
                  <div className="bg-[#111827]/80 rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl" id="gaffer-contests-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-brand-neon animate-pulse" />
                          Gaffer Open Contests & Cups
                        </h3>
                        <p className="text-xs text-[#94a3b8]">Enlist your drafted roster in active challenge formats to claim premium rewards</p>
                      </div>
                      
                      {/* Segmented filter selection code */}
                      <div className="flex bg-[#030712] p-1 rounded-xl border border-white/5 text-xs w-full sm:max-w-[400px]">
                        <button
                          type="button"
                          onClick={() => setDfsContestFilter('upcoming')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            dfsContestFilter === 'upcoming' 
                              ? 'bg-brand-neon text-black shadow-lg' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Upcoming ({contests.filter(c => c.status === 'Upcoming' || !c.joined).length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setDfsContestFilter('live')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all relative ${
                            dfsContestFilter === 'live' 
                              ? 'bg-brand-neon text-black shadow-lg' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Live ({contests.filter(c => c.joined && c.status === 'Live').length})
                          {contests.some(c => c.joined && c.status === 'Live') && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDfsContestFilter('completed')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            dfsContestFilter === 'completed' 
                              ? 'bg-brand-neon text-black shadow-lg' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Completed ({contests.filter(c => c.status === 'Completed').length})
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const filtered = contests.filter((contest) => {
                          if (dfsContestFilter === 'completed') {
                            return contest.status === 'Completed';
                          } else if (dfsContestFilter === 'live') {
                            return contest.joined && contest.status === 'Live';
                          } else {
                            return contest.status === 'Upcoming' || (!contest.joined && contest.status !== 'Completed');
                          }
                        });

                        if (filtered.length === 0) {
                          const advice = dfsContestFilter === 'completed' 
                            ? "No completed drafts yet. Draft 10 players in an upcoming contest to submit your lineup and view live matchups!"
                            : dfsContestFilter === 'live'
                            ? "No active live drafts. Join any of the upcoming contests to enlist and enter the Snake drafting session."
                            : "No upcoming tournament drafts available.";
                          return (
                            <div className="col-span-1 md:col-span-2 text-center py-12 bg-black/15 rounded-xl border border-white/5 text-slate-400 space-y-3" id="dfs-no-items">
                              <p className="text-xs font-semibold max-w-sm mx-auto leading-relaxed">{advice}</p>
                              {dfsContestFilter !== 'upcoming' && (
                                <button
                                  type="button"
                                  onClick={() => setDfsContestFilter('upcoming')}
                                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black tracking-wider text-brand-neon uppercase transition"
                                >
                                  Browse Open Drafts ➔
                                </button>
                              )}
                            </div>
                          );
                        }

                        return filtered.map((contest) => {
                          const isJoined = contest.joined;
                          const isFull = contest.participants >= contest.maxParticipants;
                          const isCompleted = contest.status === 'Completed';

                          return (
                            <div 
                              key={contest.id}
                              className={`rounded-xl p-4 transition-all border flex flex-col justify-between ${
                                isCompleted
                                  ? 'bg-[#1e1b4b]/20 border-brand-purple/40 shadow-xl'
                                  : isJoined 
                                  ? 'bg-[#065f46]/10 border-[#065f46]/40 shadow-lg'
                                  : 'bg-black/25 hover:bg-black/45 border-white/5 hover:border-white/15'
                              }`}
                            >
                              <div className="space-y-2.5">
                                {/* TOP ROW AND TAG */}
                                <div className="flex items-center justify-between">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                    contest.tag === 'Cup' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                                    contest.tag === 'Survival' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                                    contest.tag === 'Classic' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                                    'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                  }`}>
                                    {contest.tag} Tournament
                                  </span>
                                  
                                  <span className="text-[10px] text-slate-500 font-mono font-medium">
                                    Gameweek {contest.gameweek}
                                  </span>
                                </div>

                                <div>
                                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                                    {contest.title}
                                    {isCompleted && <span className="text-[9px] bg-[#9333ea] text-white font-bold rounded px-1 tracking-wider uppercase font-mono">Completed</span>}
                                    {isJoined && !isCompleted && <span className="text-[9px] bg-[#10b981] text-black font-black rounded px-1 tracking-wider uppercase font-mono animate-pulse">Live</span>}
                                  </h4>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    {contest.description}
                                  </p>
                                </div>

                                <ContestPrizeMetrics contest={contest} />
                              </div>

                              {/* FOOTER ACTIONS */}
                              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                {isCompleted ? (
                                  <div className="flex items-center gap-1 text-[9px] text-[#94a3b8] font-mono">
                                    <span>Team:</span>
                                    <span className="text-brand-neon font-black font-sans">{contest.finalRoster?.length || 10} Stars</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-[10px] font-mono">
                                    <span className="text-brand-neon font-bold">{contest.prizePool ?? contest.prizes}</span>
                                    <span className="text-slate-600">·</span>
                                    <span className="text-amber-300 font-bold">Win {contest.winningAmount ?? '—'}</span>
                                  </div>
                                )}

                                {isCompleted ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCompletedContest(contest);
                                      setSelectedDfsDay(1);
                                      setActiveLeaderboardManager(userProfile?.username || 'Pooja Doshi');
                                      addToast(`📊 Showing daily battle standings & results for ${contest.title}!`, 'success');
                                    }}
                                    className="px-3.5 py-1.5 bg-brand-purple hover:bg-purple-600 hover:shadow-lg text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow-md"
                                  >
                                    <span>📊 View Daily Competitions</span>
                                    <span className="text-[9px]">➔</span>
                                  </button>
                                ) : isJoined ? (
                                  <button
                                    type="button"
                                    onClick={() => handleJoinContest(contest.id)}
                                    className="px-4 py-1.5 bg-[#10b981] hover:bg-emerald-400 text-black font-black rounded-lg text-xs transition"
                                  >
                                    Resume Draft Arena ➔
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleJoinContest(contest.id)}
                                    disabled={isFull}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      isFull 
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-white/10 hover:bg-brand-neon hover:text-black hover:shadow-lg hover:shadow-emerald-950/20 text-white transition'
                                    }`}
                                  >
                                    Join Contest ➔
                                  </button>
                                )}
                              </div>

                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* MINI FORM TO JOIN / CREATE CUSTOM LEAGUES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <form onSubmit={handleJoinByCode} className="bg-[#111827]/70 p-4 rounded-xl border border-white/5 space-y-3">
                      <h4 className="font-semibold text-sm text-white">Join Private Draft League</h4>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="EXHIBIT4" 
                          value={inviteCodeInput}
                          onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-sm text-white font-mono placeholder-slate-500 uppercase"
                        />
                        <button type="submit" className="bg-brand-neon text-black font-bold px-3.5 py-1.5 rounded text-xs hover:bg-[#22c55e]/90 transition">
                          Join
                        </button>
                      </div>
                    </form>

                    <form onSubmit={handleCreateLeague} className="bg-[#111827]/70 p-4 rounded-xl border border-white/5 space-y-3">
                      <h4 className="font-semibold text-sm text-white">Create Private League</h4>
                      <input
                        type="text"
                        placeholder="League name"
                        value={newLeagueName}
                        onChange={(e) => setNewLeagueName(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-sm text-white placeholder-slate-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={4}
                          max={16}
                          value={newLeagueSize}
                          onChange={(e) => setNewLeagueSize(Number(e.target.value))}
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                          title="Max teams"
                        />
                        <input
                          type="number"
                          value={customGoalPoints}
                          onChange={(e) => setCustomGoalPoints(Number(e.target.value))}
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                          title="Goal points"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-brand-purple hover:bg-brand-purple/80 text-white font-semibold py-1.5 rounded text-xs transition"
                      >
                        Create League
                      </button>
                    </form>
                  </div>
                </div>

                {/* COLUMN 2: NOTIFICATIONS FEED PANEL */}
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-brand-purple" />
                    Feed Updates
                  </h3>

                  <div className="bg-black/35 rounded-xl border border-white/5 p-4 max-h-[380px] overflow-y-auto space-y-3">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-lg text-xs leading-relaxed transition cursor-pointer border ${
                          n.read ? 'bg-[#111827]/30 text-slate-400 border-white/5' : 'bg-[#111827]/90 text-white border-brand-purple/30'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold tracking-wider text-[10px] text-brand-purple uppercase">{n.type}</span>
                          <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <h5 className="font-bold mb-0.5 text-slate-100">{n.title}</h5>
                        <p className="text-slate-300">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        No notifications posted yet.
                      </div>
                    )}
                  </div>

                  <div className="bg-sky-950/20 p-4 rounded-xl border border-sky-800/30 text-xs">
                    <div className="font-semibold text-sky-400 flex items-center gap-2 mb-1.5">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      What is UNIQUE ownership?
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Unlike standard fantasy, once you draft a player, they are completely locked as your personal asset. No other manager in your league can play them!
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE SNAKE DRAFT ROOM */}
          {currentTab === 'draft-room' && (
            <div className="space-y-6" id="draft-room-panel">
              {submittedDfsRoster ? (
                <DfsLineupConfirmationScreen
                  submittedRoster={submittedDfsRoster}
                  userProfile={userProfile}
                  onToast={(message, type) => addToast(message, type)}
                  onBack={() => {
                    setSubmittedDfsRoster(null);
                  }}
                  onEnterNew={() => {
                    setSubmittedDfsRoster(null);
                    setActiveContestDraft(null);
                  }}
                />
              ) : activeContestDraft ? (
                dfsCountdown !== null ? (
                  <div className="bg-[#0b0f19] border border-white/10 p-12 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden min-h-[500px]" id="dfs-countdown-overlay">
                    {/* Decorative elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl opacity-40 animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-brand-neon/15 rounded-full blur-2xl opacity-20" />
                    
                    <div className="relative z-10 space-y-6 max-w-sm mx-auto">
                      <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono text-brand-neon font-black tracking-widest uppercase animate-pulse">
                        Entering Draft Arena ⚡
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
                          {activeContestDraft.title.replace(/[^a-zA-Z0-9\s]/g, '').trim()}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                          Draft Starts In
                        </p>
                      </div>
                      
                      <div className="flex justify-center items-center py-2">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-950/40 to-emerald-950/40 border-4 border-brand-neon flex items-center justify-center shadow-[0_0_50px_rgba(5,255,163,0.35)] animate-bounce">
                          <span className="text-6xl font-mono font-black text-brand-neon tracking-tighter">
                            {dfsCountdown}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 font-medium">
                          Standby! Computative bot opponents are registering seats. Ready your selection finger under salary cap limits!
                        </p>

                        <button
                          onClick={() => {
                            setActiveContestDraft(null);
                            setDfsCountdown(null);
                          }}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition font-mono mx-auto uppercase mt-2"
                        >
                          <ChevronLeft className="w-4 h-4 text-brand-neon" />
                          Exit Lobby
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* =================== DRAFT DFS ARENA VIEW =================== */
                  <div className="space-y-3 text-slate-200 max-h-[calc(100vh-5.5rem)] overflow-hidden flex flex-col" id="dfs-arena-view">
                  
                  {/* TOURNAMENT SPEC/INFO BAR */}
                  <div className="bg-[#0b0f19] px-3 py-2 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-2 shadow-lg shrink-0">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                      {/* BACK BUTTON AND TITLE */}
                      <button 
                        onClick={() => setActiveContestDraft(null)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold transition"
                      >
                        <ChevronLeft className="w-5 h-5 text-brand-neon" />
                        <span className="text-white font-display font-black text-sm tracking-tight flex items-center gap-2">
                          <span className="bg-[#f43f5e] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mr-1">Contest</span>
                          {activeContestDraft.title.replace(/[^a-zA-Z0-9\s]/g, '').trim()}
                        </span>
                      </button>

                      <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

                      <div className="flex flex-wrap items-center gap-3 text-slate-300">
                        <span>Entry Fee: <strong className="text-white font-mono font-black">{activeContestDraft.entryFee === 'Free' ? '$12' : activeContestDraft.entryFee}</strong></span>
                        <span className="text-white/20">•</span>
                        <span>Top Prize: <strong className="text-[#22c55e] font-black">$1000</strong></span>
                        <span className="text-white/20">•</span>
                        <span>Winners: <strong className="text-slate-200">20% (100/500)</strong></span>
                        <span className="text-white/20">•</span>
                        <span>Total Entries: <strong className="text-slate-200 font-mono">50</strong></span>
                        <span className="text-white/20">•</span>
                        <span>Total Prize: <strong className="text-white font-mono">$2500</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <span className="text-brand-purple font-mono font-black text-xs tracking-tight block flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          11 h 23m Left
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">Starts 7:00 PM CDT</span>
                      </div>
                      
                      <button 
                        onClick={() => addToast("DFS Contest Rules: Draft 7 unique assets under standard league regulations. High performance structures claim premium cash rewards.", "info")}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-brand-neon text-xs font-bold text-slate-300 hover:text-black hover:bg-brand-neon transition"
                      >
                        Contest Rules
                      </button>
                    </div>
                  </div>

                  {/* DRAFT SEAT TRACKER BOARD WITH CLOCK DIAL */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch shrink-0">
                    
                    {/* TICK TICK COUNTDOWN SECTOR */}
                    <div className="lg:col-span-2 bg-[#0b0f19] p-2.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
                      <div className="relative w-12 h-12 rounded-full border-4 border-[#86efac]/20 flex flex-col items-center justify-center shadow-xl">
                        <div className="absolute inset-0 rounded-full border-4 border-t-brand-neon border-r-brand-neon border-b-transparent border-l-transparent animate-spin duration-3000 opacity-60" />
                        <span className="text-lg font-mono font-black text-white leading-none tracking-tighter">
                          {dfsDraftTimer.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono uppercase font-semibold">Sec</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setDfsDraftPaused(!dfsDraftPaused);
                          addToast(dfsDraftPaused ? "Draft clock resumed." : "Draft clock paused.", "info");
                        }}
                        className="mt-2.5 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-bold text-slate-300 hover:text-white transition"
                      >
                        {dfsDraftPaused ? 'Resume' : 'Pause'}
                      </button>

                      <div className="mt-2 text-center text-[10px] font-mono leading-tight space-y-0.5" id="dfs-tracker-summary">
                        <div className="text-slate-400 font-bold">Round {Math.min(10, Math.floor(dfsDraftedPlayers.length / 4) + 1)} / 10</div>
                        <div className="text-slate-500">Pick {Math.min(40, dfsDraftedPlayers.length + 1)} / 40</div>
                        <div className="text-[8px] tracking-wider text-brand-purple font-black uppercase mt-1">
                          {Math.floor(dfsDraftedPlayers.length / 4) % 2 === 0 ? '▶ Snake: Forward' : '◀ Snake: Reverse'}
                        </div>
                      </div>
                    </div>

                    {/* DRAFT SEATS COLUMN */}
                    <div className="lg:col-span-10 bg-[#0b0f19] p-2.5 rounded-xl border border-white/5 flex items-center overflow-x-auto gap-2 scrollbar-thin shadow-lg">
                      {['BotAlpha', 'BotBeta', 'BotGamma', userProfile?.username || 'Pooja Doshi'].map((name, idx) => {
                        const isActive = dfsActiveSeatIndex === idx;
                        
                        // Calculate position counts
                        const picks = dfsDraftedPlayers.filter(p => p.draftedBySeatIndex === idx);
                        const qbCount = picks.filter(p => p.position === 'QB').length;
                        const rbCount = picks.filter(p => p.position === 'RB').length;
                        const wrCount = picks.filter(p => p.position === 'WR').length;
                        const teCount = picks.filter(p => p.position === 'TE').length;

                        const finalQbCount = qbCount;
                        const finalRbCount = rbCount;
                        const finalWrCount = wrCount;
                        const finalTeCount = teCount;

                        return (
                          <div
                            key={idx}
                            className={`min-w-[100px] flex-1 rounded-lg p-2 border text-center transition-all ${
                              isActive 
                                ? 'bg-brand-purple/10 border-brand-purple shadow-lg shadow-purple-950/25 ring-1 ring-brand-purple/30'
                                : 'bg-[#111827]/40 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-around text-[9px] font-mono font-bold mb-1.5 tracking-tight border-b border-white/5 pb-1">
                              <span className={finalQbCount > 0 ? "text-emerald-400 text-[10px]" : "text-slate-600"}>QB<b>{finalQbCount}</b></span>
                              <span className={finalRbCount > 0 ? "text-amber-400 text-[10px]" : "text-slate-600"}>RB<b>{finalRbCount}</b></span>
                              <span className={finalWrCount > 0 ? "text-rose-400 text-[10px]" : "text-slate-600"}>WR<b>{finalWrCount}</b></span>
                              <span className={finalTeCount > 0 ? "text-blue-400 text-[10px]" : "text-slate-600"}>TE<b>{finalTeCount}</b></span>
                            </div>
                            
                            <h4 className="font-display font-bold text-xs text-white truncate">{name}</h4>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                              Roster: {picks.length} / 10
                            </span>
                            
                            {isActive && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-black font-mono bg-brand-neon/15 text-brand-neon uppercase tracking-wider animate-pulse">
                                Active Turn
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* 3 COLUMN MAIN ARENA ROW */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch flex-1 min-h-0">
                    
                    {/* ====== COLUMN 1: QUEUE ====== */}
                    <div className="lg:col-span-3 bg-[#0b0f19] p-3 rounded-xl border border-white/5 flex flex-col min-h-0 shadow-lg">
                      <div className="space-y-2.5 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Queue</h3>
                          <span className="text-xs font-mono text-amber-400 font-bold">{dfsQueueIds.length}/5</span>
                        </div>

                        {/* List of 5 buffer slots */}
                        <div className="space-y-2 overflow-y-auto min-h-0">
                          {Array.from({ length: 5 }).map((_, slotIdx) => {
                            const queuedPlayerId = dfsQueueIds[slotIdx];
                            const queuedPlayer = queuedPlayerId ? DFS_NFL_POOL.find(p => p.id === queuedPlayerId) : null;
                            const isSlotOccupied = !!queuedPlayer;

                            return (
                              <div 
                                key={slotIdx}
                                className={`rounded-lg p-2.5 flex items-center justify-between border text-sm transition-all ${
                                  isSlotOccupied
                                    ? 'bg-[#1e1b4b]/40 border-brand-purple/40'
                                    : 'bg-black/20 border-dashed border-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-slate-500 font-mono shrink-0 text-xs">{slotIdx + 1}.</span>
                                  {isSlotOccupied ? (
                                    <div className="min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedDfsPlayer(queuedPlayer);
                                          setDfsModalTab('stats');
                                        }}
                                        className="font-bold text-white truncate block max-w-full hover:text-brand-neon text-sm text-left focus:outline-none"
                                      >
                                        {queuedPlayer.name}
                                      </button>
                                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                        <span className="px-1 bg-brand-purple/20 text-brand-purple rounded font-black text-[10px]">{queuedPlayer.position}</span>
                                        <span>{queuedPlayer.team}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 font-mono italic text-sm">Empty slot</span>
                                  )}
                                </div>

                                {isSlotOccupied && (
                                  <button
                                    onClick={() => handleToggleDfsQueue(queuedPlayer.id)}
                                    className="text-slate-500 hover:text-red-400 shrink-0 font-mono text-xs ml-1"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ====== COLUMN 2: PLAYERS POOL ====== */}
                    <div className="lg:col-span-6 bg-[#0b0f19] p-2.5 rounded-xl border border-white/10 flex flex-col gap-2 min-h-0 shadow-xl">
                      
                      {/* Banner Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2 shrink-0">
                        <div>
                          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">Players Pool</h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3.5 text-xs">
                          {/* Speed Config */}
                          <div className="flex items-center gap-1.5 bg-[#111827] px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
                            <span className="text-[9px] text-slate-400 uppercase font-black">Draft Speed:</span>
                            <button 
                              onClick={() => {
                                if (dfsDraftSpeed > 5) {
                                  setDfsDraftSpeed(s => s - 5);
                                  addToast(`Speed adjusted to ${dfsDraftSpeed - 5}s`, 'info');
                                }
                              }}
                              className="w-4 h-4 rounded bg-white/5 text-slate-200 flex items-center justify-center font-bold font-mono hover:bg-white/10"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-brand-neon">{dfsDraftSpeed}s</span>
                            <button 
                              onClick={() => {
                                if (dfsDraftSpeed < 60) {
                                  setDfsDraftSpeed(s => s + 5);
                                  addToast(`Speed adjusted to ${dfsDraftSpeed + 5}s`, 'info');
                                }
                              }}
                              className="w-4 h-4 rounded bg-white/5 text-slate-200 flex items-center justify-center font-bold font-mono hover:bg-white/10"
                            >
                              +
                            </button>
                          </div>

                          {/* Confirm option */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-400 uppercase font-black">Confirm Picks</span>
                            <button 
                              onClick={() => {
                                setDfsConfirmPicks(!dfsConfirmPicks);
                                addToast(dfsConfirmPicks ? "Picks submit instantly." : "Confirmation workflow enabled.", "info");
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider transition ${
                                dfsConfirmPicks 
                                  ? 'bg-brand-neon text-black font-black'
                                  : 'bg-white/5 text-slate-400 border border-white/5'
                              }`}
                            >
                              {dfsConfirmPicks ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Filter/Search Row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-black/25 p-1.5 rounded-lg border border-white/5 shrink-0">
                        
                        {/* Quick Search */}
                        <div className="relative md:col-span-4">
                          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                          <input 
                            type="text"
                            placeholder="Player or Team"
                            value={dfsSearchText}
                            onChange={(e) => setDfsSearchText(e.target.value)}
                            className="bg-[#111827] border border-white/10 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 w-full focus:outline-none focus:border-brand-purple"
                          />
                        </div>

                        {/* Positions */}
                        <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-lg overflow-x-auto md:col-span-5 scrollbar-none">
                          {(['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX'] as const).map(pos => (
                            <button
                              key={pos}
                              onClick={() => setDfsPositionFilter(pos)}
                              className={`px-2 py-1 rounded font-display font-bold text-[9px] transition uppercase tracking-wide flex-1 text-center ${
                                dfsPositionFilter === pos
                                  ? 'bg-[#ea580c] text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>

                        {/* Drop unavailable check */}
                        <label className="flex items-center justify-end gap-1.5 text-[9px] text-slate-400 cursor-pointer select-none md:col-span-3">
                          <input 
                            type="checkbox"
                            checked={dfsRemoveUnavailable}
                            onChange={(e) => setDfsRemoveUnavailable(e.target.checked)}
                            className="rounded accent-brand-neon bg-[#111827] border-white/5 w-3 h-3 cursor-pointer"
                          />
                          Remove Unavailable Players
                        </label>

                      </div>

                      {/* TABLE SECTION */}
                      <div className="border border-white/5 rounded-lg bg-[#090d16]/35 flex-1 min-h-0 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse table-fixed">
                          <colgroup>
                            <col className="w-[36px]" />
                            <col className="w-[32px]" />
                            <col className="w-[28%]" />
                            <col className="w-[7%]" />
                            <col className="w-[9%]" />
                            <col className="w-[9%]" />
                            <col className="w-[11%]" />
                            <col className="w-[8%]" />
                            <col className="w-[80px]" />
                          </colgroup>
                          <thead className="sticky top-0 bg-[#0d1222] z-10">
                            <tr className="text-slate-400 uppercase tracking-wider border-b border-white/10 text-xs">
                              <th className="py-2 px-1 font-bold text-center">★</th>
                              <th className="py-2 px-1 font-mono text-center">#</th>
                              <th className="py-2 px-2 font-semibold">Player</th>
                              <th className="py-2 px-1 font-mono">Tm</th>
                              <th className="py-2 px-1 font-mono">Rost%</th>
                              <th className="py-2 px-1">OPP</th>
                              <th className="py-2 px-1 font-mono text-center">OpRK</th>
                              <th className="py-2 px-1 font-mono">Avg</th>
                              <th className="py-2 px-2 text-center sticky right-0 bg-[#0d1222] z-20 shadow-[-4px_0_8px_rgba(0,0,0,0.4)]">Draft</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-slate-200">
                            {DFS_NFL_POOL
                              .filter(player => {
                                const mSearch = player.name.toLowerCase().includes(dfsSearchText.toLowerCase()) || player.team.toLowerCase().includes(dfsSearchText.toLowerCase());
                                let mPos = true;
                                if (dfsPositionFilter !== 'ALL') {
                                  if (dfsPositionFilter === 'FLEX') {
                                    mPos = player.position === 'RB' || player.position === 'WR' || player.position === 'TE';
                                  } else {
                                    mPos = player.position === dfsPositionFilter;
                                  }
                                }
                                const isDrafted = dfsDraftedPlayers.some(dp => dp.id === player.id);
                                const mUnavailable = !dfsRemoveUnavailable || !isDrafted;

                                return mSearch && mPos && mUnavailable;
                              })
                              .map((player, idx) => {
                                const isDrafted = dfsDraftedPlayers.some(dp => dp.id === player.id);
                                const isQueued = dfsQueueIds.includes(player.id);

                                return (
                                  <tr 
                                    key={player.id} 
                                    className={`hover:bg-white/5 transition-all ${isDrafted ? 'opacity-40 bg-black/40' : ''}`}
                                  >
                                    {/* QUEUE */}
                                    <td className="py-2 px-1 text-center font-semibold">
                                      <button 
                                        onClick={() => handleToggleDfsQueue(player.id)}
                                        disabled={isDrafted}
                                        className="p-1 rounded hover:bg-white/10 transition"
                                      >
                                        <Star className={`w-4 h-4 ${
                                          isQueued 
                                            ? 'text-amber-400 fill-amber-400' 
                                            : 'text-slate-500 hover:text-slate-300'
                                        }`} />
                                      </button>
                                    </td>

                                    {/* NUMBER */}
                                    <td className="py-2 px-1 font-mono text-center text-slate-500 font-bold text-xs">
                                      {idx + 1}
                                    </td>

                                    {/* NAME + POS (inline — no wasted gap) */}
                                    <td className="py-2 px-2 font-semibold text-white">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {player.starType && (
                                          <span className={`shrink-0 px-1 py-0.5 rounded text-[9px] font-black uppercase text-black leading-none ${
                                            player.starType === 'Q' ? 'bg-[#f59e0b]' : 'bg-[#a855f7]'
                                          }`}>
                                            ★{player.starType}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedDfsPlayer(player);
                                            setDfsModalTab('stats');
                                          }}
                                          className="hover:text-brand-neon hover:underline transition-all text-left font-semibold text-white focus:outline-none truncate min-w-0 flex-1"
                                        >
                                          {player.name}
                                        </button>
                                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                                          player.position === 'QB' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                                          player.position === 'RB' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                                          player.position === 'WR' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' :
                                          'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                                        }`}>
                                          {player.position}
                                        </span>
                                      </div>
                                    </td>

                                    {/* TEAM */}
                                    <td className="py-2 px-1 font-mono text-slate-400">{player.team}</td>

                                    {/* ROSTER% */}
                                    <td className="py-2 px-1 font-mono text-slate-500">{player.rosterPct}</td>

                                    {/* OPP */}
                                    <td className="py-2 px-1 text-slate-400">{player.opp}</td>

                                    {/* OP RANK */}
                                    <td className="py-2 px-1 font-mono text-center">
                                      <span className={
                                        player.opRk.includes('3rd') || player.opRk.includes('5th') ? 'text-red-400 font-bold' :
                                        player.opRk.includes('14th') ? 'text-amber-400 font-bold' : 'text-slate-500'
                                      }>
                                        {player.opRk}
                                      </span>
                                    </td>

                                    {/* AVG */}
                                    <td className="py-2 px-1 font-mono text-slate-400">{player.avg}</td>

                                    {/* DRAFT */}
                                    <td className="py-2 px-2 text-center sticky right-0 bg-[#090d16] z-[5] shadow-[-4px_0_8px_rgba(0,0,0,0.35)]">
                                      <button 
                                        type="button"
                                        disabled={isDrafted}
                                        onClick={() => handleDfsManualDraft(player)}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap ${
                                          isDrafted
                                            ? 'bg-white/5 text-slate-600 border border-white/5 cursor-default'
                                            : 'bg-[#ea580c] hover:bg-brand-neon hover:text-black hover:shadow-lg hover:shadow-[#059669]/20 text-white transition font-black'
                                        }`}
                                      >
                                        {isDrafted ? 'Locked' : '+ Draft'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>

                    </div>

                    {/* ====== COLUMN 3: MY LINEUP ====== */}
                    <div className="lg:col-span-3 bg-[#0b0f19] p-3 rounded-xl border border-white/5 flex flex-col min-h-0 shadow-lg">
                      
                      <div className="flex flex-col min-h-0 flex-1">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                          <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">My Lineup</h3>
                          <span className="text-xs font-mono text-brand-neon font-black">
                            {dfsDraftedPlayers.filter(p => p.draftedBySeatIndex === 3).length}/7
                          </span>
                        </div>

                        {/* Starters stacked cards */}
                        <div className="space-y-1.5 overflow-y-auto min-h-0 flex-1 py-1.5">
                          {(() => {
                            const userPicks = dfsDraftedPlayers.filter(p => p.draftedBySeatIndex === 3);

                            const slots = [
                              { key: 'QB', label: 'QB', themeColor: 'border-emerald-500/25 text-emerald-400 bg-emerald-500/5' },
                              { key: 'RB', label: 'RB', themeColor: 'border-amber-500/25 text-amber-400 bg-amber-500/5' },
                              { key: 'RB', label: 'RB', themeColor: 'border-amber-500/25 text-amber-400 bg-amber-500/5' },
                              { key: 'WR', label: 'WR', themeColor: 'border-rose-500/25 text-rose-400 bg-rose-500/5' },
                              { key: 'WR', label: 'WR', themeColor: 'border-rose-500/25 text-rose-400 bg-rose-500/5' },
                              { key: 'TE', label: 'TE', themeColor: 'border-blue-500/25 text-blue-400 bg-blue-500/5' },
                              { key: 'FLEX', label: 'FLEX', themeColor: 'border-purple-500/25 text-purple-400 bg-purple-500/5' }
                            ];

                            const remainingPicks = [...userPicks];

                            return slots.map((slot, sIdx) => {
                              let matchingPickIndex = -1;
                              if (slot.key === 'FLEX') {
                                matchingPickIndex = remainingPicks.findIndex(p => p.position === 'RB' || p.position === 'WR' || p.position === 'TE');
                              } else {
                                matchingPickIndex = remainingPicks.findIndex(p => p.position === slot.key);
                              }

                              let matchingPlayer: any = null;
                              if (matchingPickIndex !== -1) {
                                matchingPlayer = remainingPicks[matchingPickIndex];
                                remainingPicks.splice(matchingPickIndex, 1);
                              }

                              return (
                                <div 
                                  key={sIdx}
                                  className={`rounded-lg border transition duration-200 ${
                                    matchingPlayer 
                                      ? 'bg-slate-900 border-[#8b5cf6]/40 p-2.5'
                                      : `${slot.themeColor} border-dashed p-2.5 text-center`
                                  }`}
                                >
                                  {matchingPlayer ? (
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-[10px] font-black uppercase text-slate-500">{slot.label}</span>
                                        <span className="px-1 py-0.5 rounded text-[10px] font-black bg-brand-purple/20 text-brand-purple">{matchingPlayer.position}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          const fullNflPlayer = DFS_NFL_POOL.find(p => p.id === matchingPlayer.id) || matchingPlayer;
                                          setSelectedDfsPlayer(fullNflPlayer);
                                          setDfsModalTab('stats');
                                        }}
                                        className="text-white hover:text-brand-neon text-sm font-bold truncate block w-full text-left"
                                        title={matchingPlayer.name}
                                      >
                                        {matchingPlayer.name}
                                      </button>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-slate-400">{matchingPlayer.team}</span>
                                        <button 
                                          onClick={() => {
                                            setDfsDraftedPlayers(prev => prev.filter(p => p.id !== matchingPlayer.id));
                                            addToast(`Released ${matchingPlayer.name}`, 'info');
                                          }}
                                          className="text-xs text-red-400 font-mono font-bold"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-sm font-mono text-slate-500">{slot.label}</span>
                                  )}
                                </div>
                              );
                            });

                          })()}
                        </div>

                      </div>

                      {/* Lineup footer status */}
                      <div className="pt-2 border-t border-white/5 shrink-0">
                        <button
                          onClick={() => {
                            const myPicks = dfsDraftedPlayers.filter(p => p.draftedBySeatIndex === 3);
                            if (myPicks.length < 10) {
                              addToast(`Draft 10 unique stars to submit your lineup! Currently drafted: ${myPicks.length}/10.`, 'error');
                            } else {
                              addToast(`🎉 Lineup submitted! Open Show Schedule below for your full H2H bracket.`, 'success');
                              
                              if (activeContestDraft) {
                                setContests(prev => prev.map(c => {
                                  if (c.id === activeContestDraft.id) {
                                    return {
                                      ...c,
                                      status: 'Completed' as const,
                                      joined: true,
                                      finalRoster: myPicks
                                    };
                                  }
                                  return c;
                                }));
                              }

                              setSubmittedDfsRoster({
                                contest: activeContestDraft ? {
                                  ...activeContestDraft,
                                  status: 'Completed',
                                  joined: true,
                                  finalRoster: myPicks
                                } : activeContestDraft!,
                                picks: myPicks
                              });
                            }
                          }}
                          className="w-full mt-1.5 py-2.5 bg-brand-neon hover:bg-emerald-400 text-black font-black font-display text-sm rounded-xl uppercase tracking-wider transition"
                        >
                          Submit Lineup ➔
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
                )
              ) : (
                <>
              {/* CONTESTS & TOURNAMENTS LISTING IN DRAFT ROOM */}
              <div className="bg-[#111827]/80 rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl" id="draft-room-contests-panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-brand-neon animate-pulse" />
                      Gaffer Open Contests & Cups
                    </h3>
                    <p className="text-xs text-[#94a3b8]">Enlist your drafted roster in active challenge formats to claim premium rewards</p>
                  </div>
                  
                  {/* Segmented filter selection code */}
                  <div className="flex bg-[#030712] p-1 rounded-xl border border-white/5 text-xs w-full sm:max-w-[400px]">
                    <button
                      type="button"
                      onClick={() => setDfsContestFilter('upcoming')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        dfsContestFilter === 'upcoming' 
                          ? 'bg-brand-neon text-black shadow-lg' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upcoming ({contests.filter(c => c.status === 'Upcoming' || !c.joined).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDfsContestFilter('live')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all relative ${
                        dfsContestFilter === 'live' 
                          ? 'bg-brand-neon text-black shadow-lg' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live ({contests.filter(c => c.joined && c.status === 'Live').length})
                      {contests.some(c => c.joined && c.status === 'Live') && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDfsContestFilter('completed')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        dfsContestFilter === 'completed' 
                          ? 'bg-brand-neon text-black shadow-lg' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Completed ({contests.filter(c => c.status === 'Completed').length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const filtered = contests.filter((contest) => {
                      if (dfsContestFilter === 'completed') {
                        return contest.status === 'Completed';
                      } else if (dfsContestFilter === 'live') {
                        return contest.joined && contest.status === 'Live';
                      } else {
                        return contest.status === 'Upcoming' || (!contest.joined && contest.status !== 'Completed');
                      }
                    });

                    if (filtered.length === 0) {
                      const advice = dfsContestFilter === 'completed' 
                        ? "No completed drafts yet. Draft 10 players in an upcoming contest to submit your lineup and view live matchups!"
                        : dfsContestFilter === 'live'
                        ? "No active live drafts. Join any of the upcoming contests to enlist and enter the Snake drafting session."
                        : "No upcoming tournament drafts available.";
                      return (
                        <div className="col-span-1 md:col-span-2 text-center py-12 bg-black/15 rounded-xl border border-white/5 text-slate-400 space-y-3" id="dfs-no-items-draft">
                          <p className="text-xs font-semibold max-w-sm mx-auto leading-relaxed">{advice}</p>
                          {dfsContestFilter !== 'upcoming' && (
                            <button
                              type="button"
                              onClick={() => setDfsContestFilter('upcoming')}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black tracking-wider text-brand-neon uppercase transition"
                            >
                              Browse Open Drafts ➔
                            </button>
                          )}
                        </div>
                      );
                    }

                    return filtered.map((contest) => {
                      const isJoined = contest.joined;
                      const isFull = contest.participants >= contest.maxParticipants;
                      const isCompleted = contest.status === 'Completed';

                      return (
                        <div 
                          key={contest.id}
                          className={`rounded-xl p-4 transition-all border flex flex-col justify-between ${
                            isCompleted
                              ? 'bg-[#1e1b4b]/20 border-brand-purple/40 shadow-xl'
                              : isJoined 
                              ? 'bg-[#065f46]/10 border-[#065f46]/40 shadow-lg'
                              : 'bg-black/25 hover:bg-black/45 border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* TOP ROW AND TAG */}
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                contest.tag === 'Cup' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' :
                                contest.tag === 'Survival' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                                contest.tag === 'Classic' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                                'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              }`}>
                                {contest.tag} Tournament
                              </span>
                              
                              <span className="text-[10px] text-slate-500 font-mono font-medium">
                                Gameweek {contest.gameweek}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                                {contest.title}
                                {isCompleted && <span className="text-[9px] bg-[#9333ea] text-white font-bold rounded px-1 tracking-wider uppercase font-mono">Completed</span>}
                                {isJoined && !isCompleted && <span className="text-[9px] bg-[#10b981] text-black font-black rounded px-1 tracking-wider uppercase font-mono animate-pulse">Live</span>}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {contest.description}
                              </p>
                            </div>

                            <ContestPrizeMetrics contest={contest} />
                          </div>

                          {/* FOOTER ACTIONS */}
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            {isCompleted ? (
                              <div className="flex items-center gap-1 text-[9px] text-[#94a3b8] font-mono">
                                <span>Team:</span>
                                <span className="text-brand-neon font-black font-sans">{contest.finalRoster?.length || 10} Stars</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[10px] font-mono">
                                <span className="text-brand-neon font-bold">{contest.prizePool ?? contest.prizes}</span>
                                <span className="text-slate-600">·</span>
                                <span className="text-amber-300 font-bold">Win {contest.winningAmount ?? '—'}</span>
                              </div>
                            )}

                            {isCompleted ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompletedContest(contest);
                                  setSelectedDfsDay(1);
                                  setActiveLeaderboardManager(userProfile?.username || 'Pooja Doshi');
                                  setCurrentTab('dashboard'); // Switch to main dashboard lobby tab to show scoreboard matches!
                                  addToast(`📊 Showing daily battle standings & results for ${contest.title}!`, 'success');
                                }}
                                className="px-3.5 py-1.5 bg-brand-purple hover:bg-purple-600 hover:shadow-lg text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow-md"
                              >
                                <span>📊 View Daily Competitions</span>
                                <span className="text-[9px]">➔</span>
                              </button>
                            ) : isJoined ? (
                              <button
                                type="button"
                                onClick={() => handleJoinContest(contest.id)}
                                className="px-4 py-1.5 bg-[#10b981] hover:bg-emerald-400 text-black font-black rounded-lg text-xs transition"
                              >
                                Resume Draft Arena ➔
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleJoinContest(contest.id)}
                                disabled={isFull}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isFull 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-white/10 hover:bg-brand-neon hover:text-black hover:shadow-lg hover:shadow-emerald-950/20 text-white transition'
                                }`}
                              >
                                Join Contest ➔
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              </>
              )}

            </div>
          )}

          {/* TAB 3: TACTICAL SQUAD */}
          {currentTab === 'my-squad' && (
            <div className="space-y-6" id="squad-panel">
              
              {/* HEADER WITH SQUAD SUMMARY METRICS */}
              <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 bg-[#111827]/90 p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-32 bg-brand-neon/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-[10px] font-black tracking-widest bg-brand-neon/10 text-brand-neon rounded-full border border-brand-neon/20 uppercase font-mono">
                      Gameweek {selectedLeagueId ? leagues.find(l => l.id === selectedLeagueId)?.currentGameweek || 1 : 1} Lineup
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">•</span>
                    <span className="text-xs text-[#38bdf8] font-mono font-bold tracking-tight uppercase">
                      Formation: {myRoster?.team.formation || '4-4-2'}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-display font-black text-white tracking-tight">
                    {myRoster?.team.name || "My Squad Dashboard"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Arrange your active starters and reserves. Set active dual Captains (2.0x weight) to maximize gameweek outcome.
                  </p>
                </div>

                {/* SQUAD PERFORMANCE INDICATORS BAR */}
                <div className="flex flex-wrap items-center gap-4 md:self-center">
                  <div className="bg-[#030712]/60 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[100px] shadow-inner">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Squad</span>
                    <span className="text-lg font-mono font-black text-white">
                      {((myRoster?.active.reduce((s, p) => s + p.points, 0) || 0) + (myRoster?.bench.reduce((s, p) => s + p.points, 0) || 0))} <span className="text-[10px] text-slate-400">PTS</span>
                    </span>
                  </div>

                  <div className="bg-[#030712]/60 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[100px] shadow-inner">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Starters Avg</span>
                    <span className="text-lg font-mono font-black text-brand-neon">
                      {myRoster?.active.length 
                        ? (myRoster.active.reduce((s, p) => s + p.points, 0) / myRoster.active.length).toFixed(1)
                        : "0.0"
                      }
                    </span>
                  </div>

                  <div className="bg-[#030712]/60 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[100px] shadow-inner">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formation Layout</span>
                    <select 
                      id="team-formation-selector"
                      value={myRoster?.team.formation || '4-4-2'}
                      onChange={async (e) => {
                        if (!myRoster) return;
                        const result = staticStore.updateLineup(selectedLeagueId, { formation: e.target.value });
                        if ('error' in result && result.error) {
                          addToast(result.error, 'error');
                          return;
                        }
                        addToast(`Formation switched to ${e.target.value}!`, 'success');
                        API.fetchRoster();
                      }}
                      className="bg-[#030712] border border-white/10 px-2.5 py-1 rounded text-xs font-bold text-white focus:outline-none cursor-pointer hover:border-white/20 mt-1"
                    >
                      <option value="4-4-2">4-4-2</option>
                      <option value="4-3-3">4-3-3</option>
                      <option value="3-5-2">3-5-2</option>
                      <option value="3-4-3">3-4-3</option>
                      <option value="5-3-2">5-3-2</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* THREE COLUMN GRID LAYOUT */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* 1 & 2 COLUMNS: INTERACTIVE SOCCER FIELD + SCOUT ASSISTANT */}
                <div className="xl:col-span-2 space-y-6">

                  {myRoster ? (
                    <TacticalSquadPitch
                      formation={myRoster.team.formation || '4-4-2'}
                      active={myRoster.active}
                      bench={myRoster.bench}
                      team={myRoster.team}
                      onBench={(id) => handleSwapSquadSpot(id, 'bench')}
                      onCaptain={handleSetCaptain}
                      onViceCaptain={handleSetViceCaptain}
                    />
                  ) : (
                    <div className="bg-[#0a1220] rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-500 text-sm">
                      Complete your draft to view the tactical ground formation.
                    </div>
                  )}

                  {/* SCOUT AI LINEUP OPTIMIZER & CLUB SYNERGIES PANEL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* SCOUT AI LINEUP OPTIMIZER */}
                    <div className="bg-[#111827]/90 rounded-2xl border border-white/5 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                          <h4 className="text-xs text-white font-bold uppercase tracking-wider font-mono">Scout AI Advisor</h4>
                        </div>
                        <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 rounded uppercase font-mono">Live Recommendations</span>
                      </div>

                      {/* RECOMMENDATIONS LOGIC CARDS */}
                      {(() => {
                        const allSquad = myRoster ? [...myRoster.active, ...myRoster.bench] : [];
                        if (allSquad.length === 0) {
                          return (
                            <p className="text-[11px] text-slate-400 italic">No squad drafted. Select elite assets in the Draft Room first.</p>
                          );
                        }

                        // Check injury warnings
                        const brokenStarters = myRoster?.active.filter(s => s.injuryStatus !== 'Available') || [];
                        const healthyReserves = myRoster?.bench.filter(b => b.injuryStatus === 'Available') || [];

                        // Suggest swaps if anyone is better
                        const potentialSwaps: string[] = [];
                        myRoster?.bench.forEach(bp => {
                          myRoster?.active.forEach(ap => {
                            if (bp.points > ap.points) {
                              potentialSwaps.push(`Swap ${bp.name} (${bp.points} pts) in for ${ap.name} (${ap.points} pts).`);
                            }
                          });
                        });

                        // Best captain suggest
                        const sortedByPoints = [...allSquad].sort((a,b) => b.points - a.points);
                        const suggestedCap = sortedByPoints[0];
                        const capNeedsChange = myRoster?.team.captainId !== suggestedCap?.id;

                        return (
                          <div className="space-y-2">
                            {brokenStarters.length > 0 && healthyReserves.length > 0 && (
                              <div className="bg-red-950/40 border border-red-500/20 p-2.5 rounded-xl flex items-start gap-2 text-[11px]">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-red-300 block">Injury Precaution Warning:</strong>
                                  <span>{brokenStarters[0].name} ({brokenStarters[0].injuryStatus}) is currently a starter while healthy {healthyReserves[0].name} is on your bench.</span>
                                </div>
                              </div>
                            )}

                            {potentialSwaps.length > 0 && (
                              <div className="bg-[#1e1b4b]/50 border border-indigo-500/20 p-2.5 rounded-xl flex items-start gap-2 text-[11px]">
                                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-purple-300 block">Starters Performance Gain:</strong>
                                  <span>{potentialSwaps[0]} This yields an immediate increase of point density.</span>
                                </div>
                              </div>
                            )}

                            {capNeedsChange && suggestedCap && (
                              <div className="bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2 text-[11px]">
                                <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-amber-300 block">Armband Captaincy Suggestion:</strong>
                                  <span>Best player {suggestedCap.name} ({suggestedCap.points} pts) is not marked Captain. Reassign to maximize 2.0x weight.</span>
                                </div>
                              </div>
                            )}

                            {potentialSwaps.length === 0 && brokenStarters.length === 0 && !capNeedsChange && (
                              <div className="bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-xl text-center text-[11px] text-emerald-400">
                                ✓ Your current starting lineup is mathematically fully optimized! Stand-down.
                              </div>
                            )}

                            {/* INSTANT APPLY OPTIMIZER */}
                            <button
                              onClick={handleAutoOptimizeLineup}
                              className="w-full mt-2.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white uppercase tracking-wider transition-all duration-200 shadow-[0_4px_20px_rgba(249,115,22,0.2)] focus:outline-none flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              ⚡ Click here to Auto-Optimize Team
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* FANTASY CLUB SYNERGY SYSTEM */}
                    <div className="bg-[#111827]/90 rounded-2xl border border-white/5 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                          <h4 className="text-xs text-white font-bold uppercase tracking-wider font-mono">Club Chemistry Synergy</h4>
                        </div>
                        <span className="px-1.5 py-0.5 text-[8px] font-black bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/35 rounded uppercase font-mono">Active Badges</span>
                      </div>

                      {/* SYNERGY CARDS */}
                      {(() => {
                        const activeClubsCount: Record<string, number> = {};
                        myRoster?.active.forEach(p => {
                          activeClubsCount[p.club] = (activeClubsCount[p.club] || 0) + 1;
                        });
                        const chemistryBonuses = Object.entries(activeClubsCount)
                          .filter(([club, count]) => count >= 2)
                          .map(([club, count]) => {
                            let title = `${club} Connection`;
                            let desc = `Mock +5% Tactical Cohesion (${count} starters)`;
                            let badgeStyle = 'bg-slate-900 border-slate-700/50 text-slate-300';
                            
                            if (club === 'ARS' || club === 'Arsenal') {
                              title = 'Gunners Syndicate';
                              desc = 'Mock +10% Passing Chemistry!';
                              badgeStyle = 'bg-red-950/40 border-red-500/20 text-red-300';
                            } else if (club === 'LIV' || club === 'Liverpool') {
                              title = 'Gegenpress Collective';
                              desc = 'Mock +12% Recovery Speed!';
                              badgeStyle = 'bg-rose-955/40 border-rose-500/20 text-rose-300';
                            } else if (club === 'MCI' || club === 'Man City' || club === 'Chelsea' || club === 'CHE') {
                              title = 'Positional Core Boost';
                              desc = 'Mock +15% Playmaking Cohesion!';
                              badgeStyle = 'bg-sky-950/40 border-sky-500/20 text-sky-200';
                            }
                            return { title, desc, badgeStyle };
                          });

                        if (chemistryBonuses.length === 0) {
                          return (
                            <div className="text-center py-6 text-slate-500 text-[11px] border border-dashed border-white/5 rounded-xl">
                              No stack synergy yet. Draft multiple starting players from the same EPL club to unlock Chemistry boosts.
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2 max-h-[145px] overflow-y-auto">
                            {chemistryBonuses.map((b, i) => (
                              <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${b.badgeStyle}`}>
                                <div>
                                  <strong className="block font-bold">{b.title}</strong>
                                  <span className="opacity-80 text-[10px]">{b.desc}</span>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 font-black uppercase font-mono">
                                  ✓ Active
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>

                {/* 3 COLUMNS: DETAILED STARTERS & RESERVES MANAGER PANEL */}
                <div className="space-y-6">
                  
                  {/* STARTERS LIST */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-black text-sm text-brand-neon uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-neon" />
                        Starters List ({myRoster?.active.length || 0}/8)
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">Starter Core</span>
                    </div>

                    <div className="bg-black/35 rounded-2xl border border-white/5 p-3.5 space-y-2.5 max-h-[360px] overflow-y-auto">
                      {myRoster?.active.map((player) => {
                        const isCaptain = myRoster.team.captainId === player.id;
                        const isVice = myRoster.team.viceCaptainId === player.id;

                        // Calculate visual condition color
                        let colorBorder = 'border-white/5';
                        if (player.injuryStatus === 'Injured' || player.injuryStatus === 'Suspended') colorBorder = 'border-red-500/25 bg-red-950/5';
                        else if (player.injuryStatus === 'Doubtful') colorBorder = 'border-amber-500/25 bg-amber-950/5';

                        return (
                          <div 
                            key={player.id} 
                            className={`p-3 rounded-xl border hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827]/80 ${colorBorder}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded text-[10px] font-black flex items-center justify-center font-mono select-none ${
                                player.position === 'GKP' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                player.position === 'DEF' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                player.position === 'MID' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {player.position}
                              </span>
                              
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-xs text-white tracking-tight">{player.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{player.club}</span>
                                  {isCaptain && <span className="px-1 py-0.2 text-[8px] font-black bg-amber-500 text-black rounded uppercase font-mono">C</span>}
                                  {isVice && <span className="px-1 py-0.2 text-[8px] font-black bg-slate-500 text-white rounded uppercase font-mono">VC</span>}
                                </div>
                                
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>Total: <strong className="font-mono text-white">{player.points} pts</strong></span>
                                  
                                  {/* Render injury tag if any */}
                                  {player.injuryStatus !== 'Available' && (
                                    <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                                      player.injuryStatus === 'Doubtful' ? 'text-amber-400 bg-amber-950/45' : 'text-red-400 bg-red-950/45'
                                    }`}>
                                      {player.injuryStatus}
                                    </span>
                                  )}
                                </div>

                                {/* micro game log bar */}
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[8px] text-slate-500 font-mono">Form:</span>
                                  {player.recentPoints && player.recentPoints.length > 0 ? (
                                    player.recentPoints.slice(0, 3).map((pt, index) => (
                                      <span key={index} className="text-[8px] font-bold px-1 rounded bg-[#030712] text-brand-neon font-mono">
                                        {pt}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[8px] text-slate-500 font-mono">-</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* CONTROLS AREA */}
                            <div className="flex items-center gap-1.5 self-end sm:self-center">
                              {/* Set Captain Trigger */}
                              <button
                                onClick={() => handleSetCaptain(player.id)}
                                disabled={isCaptain}
                                className={`text-[9px] font-mono font-bold px-1.5 py-1 rounded transition uppercase ${
                                  isCaptain 
                                    ? 'bg-amber-500/10 text-amber-500/60 cursor-default' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                                }`}
                              >
                                Captain
                              </button>

                              <button
                                onClick={() => handleSetViceCaptain(player.id)}
                                disabled={isVice}
                                className={`text-[9px] font-mono font-bold px-1.5 py-1 rounded transition uppercase ${
                                  isVice 
                                    ? 'bg-slate-500/10 text-slate-400/60 cursor-default' 
                                    : 'bg-[#1e293b] hover:bg-slate-700 text-slate-200'
                                }`}
                              >
                                Vice
                              </button>

                              <button 
                                onClick={() => handleSwapSquadSpot(player.id, 'bench')}
                                className="text-[9px] font-mono font-black bg-brand-purple/20 text-brand-purple border border-brand-purple/35 hover:bg-brand-purple hover:text-white px-2 py-1 rounded transition"
                              >
                                Bench ⬇️
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {(!myRoster || myRoster.active.length === 0) && (
                        <div className="text-center py-12 text-slate-500 text-xs">
                          No team players drafted. Go to the Draft Room tab to establish raw assets!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RESERVES BENCH */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        Reserves Bench ({myRoster?.bench.length || 0}/3)
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500">Substitute Lineup</span>
                    </div>

                    <div className="bg-black/35 rounded-2xl border border-white/5 p-3.5 space-y-2.5">
                      {myRoster?.bench.map((player) => (
                        <div 
                          key={player.id} 
                          className="bg-[#111827]/80 p-3 rounded-xl border border-white/5 hover:border-white/10 transition flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-xs text-white flex items-center gap-1.5 flex-wrap">
                              {player.name}
                              <span className="text-[9px] text-[#22d3ee] font-mono uppercase bg-[#22d3ee]/10 px-1 py-0.2 rounded border border-[#22d3ee]/20">
                                {player.position}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {player.club} • <strong className="text-white font-mono">{player.points} pts</strong>
                            </span>
                          </div>

                          <button 
                            onClick={() => handleSwapSquadSpot(player.id, 'active')}
                            className="text-[10px] font-bold bg-brand-neon/20 hover:bg-brand-neon hover:text-black text-brand-neon border border-brand-neon/40 px-3 py-1 rounded-lg transition"
                          >
                            Bring Starter ⬆️
                          </button>
                        </div>
                      ))}

                      {(!myRoster || myRoster.bench.length === 0) && (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          Bench is currently empty.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIVE LINEUP RULES CHECKLIST */}
                  <div className="bg-[#111827] p-5 rounded-2xl border border-white/5 text-xs text-slate-400 space-y-3">
                    <strong className="text-white block font-black uppercase tracking-wider text-[10px] font-mono">Premium Tactical Rules</strong>
                    <ul className="list-decimal pl-4 space-y-1.5 text-slate-300 text-[11px]">
                      <li>Starters obtain full fantasy scores and negative penalties.</li>
                      <li>Double (2x) stats points apply for your active designated Captain.</li>
                      <li>Vice-Captain receives retroactive bonus if Captain fails to play any active minutes.</li>
                      <li>Substitutions are finalized instantly on saving tactical setups.</li>
                    </ul>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: WAIVER WIRE SYSTEM */}
          {currentTab === 'waivers' && (
            <div className="space-y-6" id="waivers-panel">

              <div className="flex flex-wrap gap-2 p-1 bg-black/40 rounded-xl border border-white/5 w-fit">
                <button
                  type="button"
                  onClick={() => setWaiverModule('priority')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    waiverModule === 'priority'
                      ? 'bg-brand-neon text-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Reverse Priority
                </button>
                <button
                  type="button"
                  onClick={() => { setWaiverModule('fwwb'); API.fetchFwwb(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    waiverModule === 'fwwb'
                      ? 'bg-amber-400 text-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  FWWB Bids
                </button>
              </div>
              
              <div className="bg-[#111827]/80 p-5 rounded-xl border border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
                <div>
                  {waiverModule === 'priority' ? (
                    <>
                      <h2 className="text-xl lg:text-2xl font-display font-bold text-white">Reverse-Order Waiver Wire Hub</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Conflicted claims resolve by reverse standings priority. Successful claims move you to the bottom of the queue.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl lg:text-2xl font-display font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-amber-400" />
                        FWWB — Free Waiver Wire Budget
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Blind budget bids (${fwwbInfo.startingBudget} season pool). Highest bid wins each free agent; budget is deducted on award.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <span className="text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                          Your remaining: <strong>${fwwbInfo.myRemaining}</strong> / ${fwwbInfo.startingBudget}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Min bid ${fwwbInfo.minBid}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  {waiverModule === 'priority' ? (
                    <>
                      <button 
                        onClick={openWaiverModal}
                        className="bg-brand-neon hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4 text-black" />
                        Propose Claim
                      </button>
                      <button 
                        onClick={handleProcessWaivers}
                        className="bg-brand-purple hover:bg-purple-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
                      >
                        Process Priority Claims
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={openFwwbModal}
                        className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm px-4 py-2 rounded-xl transition flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Place FWWB Bid
                      </button>
                      <button 
                        onClick={handleProcessFwwb}
                        className="bg-brand-purple hover:bg-purple-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
                      >
                        Run FWWB Auction
                      </button>
                    </>
                  )}
                </div>
              </div>

              {waiverModule === 'priority' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* ACTIVE PENDING CLAIMS */}
                <div className="xl:col-span-2 space-y-4">
                  <h3 className="font-display font-semibold text-base text-white">Your Pending Waiver Requests</h3>

                  <div className="bg-black/35 rounded-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                            <th className="py-3 px-4">Acquire Candidate (+ ADD)</th>
                            <th className="py-3 px-4">Release Candidate (- DROP)</th>
                            <th className="py-3 px-4">Priority Status</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {waiverInfo.claims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-white/5">
                              <td className="py-3 px-4">
                                <span className="font-semibold text-green-400 font-mono">+ {claim.playerToAddName}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-red-400 font-mono">- {claim.playerToDropName}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-xs">Claim Rank #{claim.priorityValue}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                                  claim.status === 'Pending' ? 'bg-amber-500/10 text-amber-300' :
                                  claim.status === 'Successful' ? 'bg-green-500/10 text-green-300' :
                                  'bg-red-500/10 text-red-300'
                                }`}>
                                  {claim.status}
                                </span>
                                {claim.failureReason && (
                                  <span className="block text-[10px] text-slate-500">{claim.failureReason}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {claim.status === 'Pending' && (
                                  <button 
                                    onClick={() => handleDeleteWaiverClaim(claim.id)}
                                    className="text-slate-500 hover:text-red-400 p-1 rounded transition"
                                    title="Cancel Proposal"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {waiverInfo.claims.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                                No proposed waiver claims. Propose a claim above using undrafted hot stars.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* PRIORITY ORDER TRACKING */}
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-white">Reverse standing priority</h3>

                  <div className="bg-black/35 rounded-xl border border-white/5 p-4 space-y-3">
                    <span className="text-[11px] text-slate-400 block font-normal leading-relaxed">
                      *Teams with lower standings rankings are given first priority to acquire hot transfers. Successful claims cycle the manager to bottom priority.
                    </span>

                    <div className="space-y-2 pt-2">
                      {waiverInfo.teamPriorityList.map((tm, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#111827] px-3.5 py-2.5 rounded border border-white/5">
                          <div>
                            <div className="font-semibold text-xs text-white">{tm.teamName}</div>
                            <span className="text-[10px] text-slate-400">{tm.managerName}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple rounded text-xs font-bold font-mono">
                            Priority #{tm.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
              )}

              {waiverModule === 'fwwb' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                  <h3 className="font-display font-semibold text-base text-white">Your FWWB bids</h3>
                  <div className="bg-black/35 rounded-xl border border-amber-500/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                            <th className="py-3 px-4">Add (+)</th>
                            <th className="py-3 px-4">Drop (−)</th>
                            <th className="py-3 px-4">Bid</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {myFwwbBids.map((bid) => (
                            <tr key={bid.id} className="hover:bg-white/5">
                              <td className="py-3 px-4 font-semibold text-green-400 font-mono">+ {bid.playerToAddName}</td>
                              <td className="py-3 px-4 font-semibold text-red-400 font-mono">− {bid.playerToDropName}</td>
                              <td className="py-3 px-4">
                                <span className="text-amber-300 font-bold font-mono">${bid.bidAmount}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                                  bid.status === 'Pending' ? 'bg-amber-500/10 text-amber-300' :
                                  bid.status === 'Successful' ? 'bg-green-500/10 text-green-300' :
                                  'bg-red-500/10 text-red-300'
                                }`}>
                                  {bid.status}
                                </span>
                                {bid.failureReason && (
                                  <span className="block text-[10px] text-slate-500 mt-0.5">{bid.failureReason}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {bid.status === 'Pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFwwbBid(bid.id)}
                                    className="text-slate-500 hover:text-red-400 p-1 rounded transition"
                                    title="Cancel bid"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {myFwwbBids.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                                No FWWB bids yet. Place a blind bid on a free agent above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-sm text-slate-300 pt-2">League bid board (all managers)</h3>
                  <div className="bg-black/25 rounded-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto max-h-48">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 uppercase border-b border-white/5">
                            <th className="py-2 px-3">Manager</th>
                            <th className="py-2 px-3">Target</th>
                            <th className="py-2 px-3">Bid</th>
                            <th className="py-2 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-400">
                          {fwwbInfo.bids.map(bid => (
                            <tr key={bid.id}>
                              <td className="py-2 px-3 text-white">{bid.teamName}</td>
                              <td className="py-2 px-3">{bid.playerToAddName}</td>
                              <td className="py-2 px-3 font-mono text-amber-300">${bid.bidAmount}</td>
                              <td className="py-2 px-3">{bid.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-base text-white">FWWB budgets</h3>
                  <div className="bg-black/35 rounded-xl border border-amber-500/15 p-4 space-y-3">
                    <span className="text-[11px] text-slate-400 block leading-relaxed">
                      Each manager starts with ${fwwbInfo.startingBudget}. Winning bids deduct from remaining budget until the pool is spent.
                    </span>
                    <div className="space-y-2 pt-1">
                      {fwwbInfo.budgets.map((b) => {
                        const pct = Math.round((b.remaining / b.totalBudget) * 100);
                        const isYou = b.teamName === (myRoster?.team?.name || 'Tejpal FC');
                        return (
                          <div
                            key={b.teamId}
                            className={`rounded-lg border px-3.5 py-2.5 ${
                              isYou ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 bg-[#111827]'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <div>
                                <div className="font-semibold text-xs text-white">{b.teamName}</div>
                                <span className="text-[10px] text-slate-500">{b.managerName}</span>
                              </div>
                              <span className="font-mono text-xs text-amber-300 font-bold">${b.remaining}</span>
                            </div>
                            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400/80 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-600 mt-1 block">{pct}% remaining</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* DFS PLAYER SPECIAL DETAILED MODAL POPUP (Disabled inline, now rendered globally) */}
              {false && selectedDfsPlayer && (() => {
                const isDrafted = dfsDraftedPlayers.some(dp => dp.id === selectedDfsPlayer.id);
                const isQueued = dfsQueueIds.includes(selectedDfsPlayer.id);
                
                // Retrieve team details
                const TEAM_NAMES_MAP: Record<string, string> = {
                  KC: 'Kansas City Chiefs',
                  MIN: 'Minnesota Vikings',
                  PHI: 'Philadelphia Eagles',
                  DET: 'Detroit Lions',
                  SF: 'San Francisco 49ers',
                  DAL: 'Dallas Cowboys',
                  BAL: 'Baltimore Ravens',
                  BUF: 'Buffalo Bills',
                  LAR: 'Los Angeles Rams',
                  ARI: 'Arizona Cardinals',
                  ATL: 'Atlanta Falcons',
                  MIA: 'Miami Dolphins',
                  NYJ: 'New York Jets',
                  HOU: 'Houston Texans',
                  IND: 'Indianapolis Colts',
                  TEN: 'Tennessee Titans',
                  NE: 'New England Patriots',
                  CHI: 'Chicago Bears',
                  SEA: 'Seattle Seahawks',
                  JAX: 'Jacksonville Jaguars',
                  LV: 'Las Vegas Raiders',
                  GB: 'Green Bay Packers',
                  CAR: 'Carolina Panthers',
                  TB: 'Tampa Bay Buccaneers',
                  CLE: 'Cleveland Browns',
                  NO: 'New Orleans Saints',
                  WAS: 'Washington Commanders',
                  PIT: 'Pittsburgh Steelers',
                  LAC: 'Los Angeles Chargers',
                  NYG: 'New York Giants',
                  CIN: 'Cincinnati Bengals',
                };

                const TEAM_BG_CLASSES: Record<string, string> = {
                  KC: 'bg-red-700 text-white',
                  MIN: 'bg-purple-800 text-purple-100',
                  PHI: 'bg-emerald-900 text-emerald-100',
                  DET: 'bg-sky-600 text-sky-100',
                  SF: 'bg-[#b91c1c] text-white',
                  DAL: 'bg-blue-900 text-blue-100',
                  BAL: 'bg-[#1e1b4b] text-indigo-100 border border-indigo-400/25',
                  BUF: 'bg-blue-600 text-blue-100',
                  LAR: 'bg-indigo-750 text-amber-300',
                  ARI: 'bg-rose-950 text-rose-100',
                  ATL: 'bg-zinc-800 text-white',
                  MIA: 'bg-teal-500 text-teal-950 font-black',
                  NYJ: 'bg-emerald-800 text-emerald-100',
                  HOU: 'bg-slate-800 text-slate-100',
                  IND: 'bg-blue-800 text-white',
                  TEN: 'bg-sky-800 text-white',
                  NE: 'bg-blue-950 text-white',
                  CHI: 'bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/20',
                  SEA: 'bg-emerald-950 text-emerald-300 border border-emerald-500/10',
                  JAX: 'bg-teal-950 text-teal-300',
                  LV: 'bg-zinc-700 text-white',
                  GB: 'bg-green-900 text-yellow-300',
                  CAR: 'bg-sky-800 text-white',
                  TB: 'bg-red-950 text-red-200',
                  CLE: 'bg-amber-950 text-amber-200',
                  NO: 'bg-amber-900/40 text-amber-100 border border-amber-900/10',
                  WAS: 'bg-red-950 text-amber-300',
                  PIT: 'bg-zinc-900 text-yellow-400',
                  LAC: 'bg-sky-500 text-yellow-300',
                  NYG: 'bg-blue-800 text-white',
                  CIN: 'bg-[#1e1b4b] text-[#38bdf8] border border-blue-400/25',
                };

                const teamBg = TEAM_BG_CLASSES[selectedDfsPlayer.team] || 'bg-slate-800 text-white';
                const teamFullName = TEAM_NAMES_MAP[selectedDfsPlayer.team] || 'NFL Franchise';

                // Career stats calculation
                const years = [2026, 2025, 2024, 2023, 2022];
                const pNameSum = selectedDfsPlayer.name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
                
                const statsRows = years.map((year, index) => {
                  const factor = 1 - (index * 0.08) + (pNameSum % 10) * 0.015;
                  const isQB = selectedDfsPlayer.position === 'QB';
                  const isRB = selectedDfsPlayer.position === 'RB';
                  const isWR = selectedDfsPlayer.position === 'WR';
                  const isTE = selectedDfsPlayer.position === 'TE';

                  let pYds = '-';
                  let pTd = '-';
                  let pInt = '-';
                  let car = '-';
                  let ruYds = '-';
                  let ruTds = '-';
                  let dwn1 = '-';
                  let tar = '-';
                  let rcYds = '-';
                  let rcTds = '-';
                  let fl = Math.floor((pNameSum + year) % 4);
                  let fp = 0;

                  if (isQB) {
                    const basePassYds = Math.floor(4000 * factor);
                    const basePassTds = Math.floor(28 * factor);
                    const baseInts = Math.floor(8 + (pNameSum % 6) - index);
                    const baseCarries = Math.floor(50 * factor);
                    const baseRushYds = Math.floor(240 * factor);
                    const baseRushTds = Math.floor(3 * factor);

                    pYds = basePassYds.toLocaleString();
                    pTd = basePassTds.toString();
                    pInt = Math.max(0, baseInts).toString();
                    car = baseCarries.toString();
                    ruYds = baseRushYds.toString();
                    ruTds = baseRushTds.toString();
                    dwn1 = Math.floor(18 * factor).toString();
                    fp = Math.round((basePassYds * 0.05) + (basePassTds * 6) - (Math.max(0, baseInts) * 4) + (baseRushYds * 0.1) + (baseRushTds * 6) - (fl * 4));
                  } else if (isRB) {
                    const baseCarries = Math.floor(250 * factor);
                    const baseRushYds = Math.floor(1150 * factor);
                    const baseRushTds = Math.floor(11 * factor);
                    const baseTargets = Math.floor(70 * factor);
                    const baseRcYds = Math.floor(480 * factor);
                    const baseRcTds = Math.floor(2 * factor);

                    car = baseCarries.toLocaleString();
                    ruYds = baseRushYds.toLocaleString();
                    ruTds = baseRushTds.toString();
                    tar = baseTargets.toString();
                    rcYds = baseRcYds.toLocaleString();
                    rcTds = baseRcTds.toString();
                    dwn1 = Math.floor(68 * factor).toString();
                    fp = Math.round((baseRushYds * 0.1) + (baseRushTds * 6) + (baseRcYds * 0.1) + (baseRcTds * 6) - (fl * 4) + (Math.floor(baseTargets * 0.5) * 0.5));
                  } else {
                    // WR & TE
                    const isTEVal = isTE;
                    const baseTargets = Math.floor((isTEVal ? 110 : 150) * factor);
                    const baseRc = Math.floor(baseTargets * 0.65);
                    const baseRcYds = Math.floor((isTEVal ? 900 : 1380) * factor);
                    const baseRcTds = Math.floor((isTEVal ? 7 : 10) * factor);

                    tar = baseTargets.toString();
                    rcYds = baseRcYds.toLocaleString();
                    rcTds = baseRcTds.toString();
                    dwn1 = Math.floor(baseRcYds * 0.06).toString();
                    fp = Math.round((baseRcYds * 0.1) + (baseRcTds * 6) + (baseRc * 0.5) - (fl * 4));
                  }

                  return {
                    year,
                    team: selectedDfsPlayer.team,
                    pYds,
                    pTd,
                    pInt,
                    car,
                    ruYds,
                    ruTds,
                    dwn1,
                    tar,
                    rcYds,
                    rcTds,
                    fl: fl.toString(),
                    fp: Math.round(fp || selectedDfsPlayer.avg * 16)
                  };
                });

                return (
                  <div className="fixed inset-0 z-50 bg-[#020617]/90 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" id="dfs-player-stats-modal">
                    <div className="bg-[#0b0f19] border border-white/10 rounded-3xl w-full max-w-4xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.2)] my-8 relative">
                      
                      {/* Close button in top-right */}
                      <button 
                        onClick={() => setSelectedDfsPlayer(null)}
                        className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition focus:outline-none"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Header Section */}
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          {/* Circle Avatar */}
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center font-display font-black text-2xl shadow-xl ${teamBg}`}>
                            {selectedDfsPlayer.team}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
                                {selectedDfsPlayer.name}
                              </h2>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider font-mono ${
                                selectedDfsPlayer.position === 'QB' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                selectedDfsPlayer.position === 'RB' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                selectedDfsPlayer.position === 'WR' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}>
                                {selectedDfsPlayer.position}
                              </span>
                            </div>
                            <p className="text-slate-400 font-semibold text-sm">
                              {teamFullName}
                            </p>
                          </div>
                        </div>

                        {/* Top-Right Action Row (Queue & Draft) */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => handleToggleDfsQueue(selectedDfsPlayer.id)}
                            disabled={isDrafted}
                            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider transition duration-200 flex items-center justify-center gap-1.5 focus:outline-none ${
                              isQueued 
                                ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                                : 'bg-[#1e1b4b]/80 text-[#a5b4fc] border-indigo-500/30 hover:bg-[#1e1b4b] hover:text-white'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isQueued ? 'fill-white text-white' : ''}`} />
                            {isQueued ? 'Queued' : 'Queue'}
                          </button>

                          <button
                            onClick={() => {
                              handleDfsManualDraft(selectedDfsPlayer);
                              // Close details modal on choose
                              setSelectedDfsPlayer(null);
                            }}
                            disabled={isDrafted || dfsActiveSeatIndex !== 3}
                            className={`flex flex-1 md:flex-initial items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition duration-200 shadow-lg focus:outline-none ${
                              isDrafted 
                                ? 'bg-[#1e293b] text-slate-500 border border-slate-700/50 cursor-not-allowed' 
                                : dfsActiveSeatIndex !== 3 
                                ? 'bg-amber-500/10 text-amber-500/60 border border-amber-500/20 cursor-not-allowed'
                                : 'bg-[#f97316] hover:bg-[#ea580c] text-white hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(249,115,22,0.3)]'
                            }`}
                          >
                            <Plus className="w-4 h-4 font-black" />
                            {isDrafted ? 'Drafted' : dfsActiveSeatIndex !== 3 ? 'Wait Turn' : '+ Draft'}
                          </button>
                        </div>
                      </div>

                      {/* Key Stat Highlights Grid */}
                      <div className="bg-[#111827]/60 rounded-2xl border border-white/5 p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5 shadow-inner text-center">
                        <div className="pt-2 sm:pt-0">
                          <p className="text-xl md:text-2xl font-mono font-black text-white">{selectedDfsPlayer.avg}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">AVG FTS/GM</p>
                        </div>
                        <div className="pt-2 sm:pt-0">
                          <p className="text-xl md:text-2xl font-mono font-black text-[#f97316]">{selectedDfsPlayer.proj}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">PROJ PTS</p>
                        </div>
                        <div className="pt-2 sm:pt-0">
                          <p className="text-xl md:text-2xl font-display font-medium text-white">{selectedDfsPlayer.opp}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">OPPONENT</p>
                        </div>
                        <div className="pt-2 sm:pt-0">
                          <p className={`text-xl md:text-2xl font-mono font-black ${
                            selectedDfsPlayer.opRk.includes('3rd') || selectedDfsPlayer.opRk.includes('5th') 
                              ? 'text-rose-500' 
                              : 'text-emerald-400'
                          }`}>{selectedDfsPlayer.opRk}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">OPP RANK</p>
                        </div>
                        <div className="pt-2 sm:pt-0">
                          <p className="text-xl md:text-2xl font-mono font-black text-slate-400">{selectedDfsPlayer.adp}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">ADP</p>
                        </div>
                      </div>

                      {/* Tabs Controller */}
                      <div className="border-b border-white/10">
                        <div className="flex gap-6">
                          {(['news', 'stats', 'gamelog'] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setDfsModalTab(tab)}
                              className={`pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-all relative focus:outline-none ${
                                dfsModalTab === tab 
                                  ? 'text-white font-black hover:border-b-0' 
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {tab === 'news' ? 'News' : tab === 'stats' ? 'Stats' : 'Game Log'}
                              {dfsModalTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316] shadow-[0_1px_10px_rgba(249,115,22,0.8)]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tab Contents */}
                      <div className="min-h-[200px]" id="dfs-modal-tabs-container">
                        {dfsModalTab === 'stats' && (
                          <div className="space-y-6">
                            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Career Stats (Season Total)</h4>
                            
                            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111827]/30">
                              <table className="w-full text-[10px] text-slate-300 min-w-[700px]">
                                <thead>
                                  <tr className="bg-slate-900/60 text-slate-400 font-mono uppercase tracking-wider border-b border-white/10 text-left">
                                    <th className="py-2.5 px-3">Year</th>
                                    <th className="py-2.5 px-3">Team</th>
                                    <th className="py-2.5 px-2">P YDS</th>
                                    <th className="py-2.5 px-2">P TD</th>
                                    <th className="py-2.5 px-2">INT</th>
                                    <th className="py-2.5 px-2">CAR</th>
                                    <th className="py-2.5 px-2">RU YDS</th>
                                    <th className="py-2.5 px-2">RU TDS</th>
                                    <th className="py-2.5 px-2">1 DWNS</th>
                                    <th className="py-2.5 px-2">TAR</th>
                                    <th className="py-2.5 px-2">RC YDS</th>
                                    <th className="py-2.5 px-2">RC TDS</th>
                                    <th className="py-2.5 px-2">FL</th>
                                    <th className="py-2.5 px-3 text-[#f97316]">FP (Season)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono">
                                  {statsRows.map((r, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-all text-left">
                                      <td className="py-2.5 px-3 font-semibold text-white">{r.year}</td>
                                      <td className="py-2.5 px-3 text-slate-400">{r.team}</td>
                                      <td className="py-2.5 px-2">{r.pYds}</td>
                                      <td className="py-2.5 px-2">{r.pTd}</td>
                                      <td className="py-2.5 px-2 text-rose-400/80">{r.pInt}</td>
                                      <td className="py-2.5 px-2">{r.car}</td>
                                      <td className="py-2.5 px-2">{r.ruYds}</td>
                                      <td className="py-2.5 px-2">{r.ruTds}</td>
                                      <td className="py-2.5 px-2">{r.dwn1}</td>
                                      <td className="py-2.5 px-2">{r.tar}</td>
                                      <td className="py-2.5 px-2">{r.rcYds}</td>
                                      <td className="py-2.5 px-2">{r.rcTds}</td>
                                      <td className="py-2.5 px-2 text-rose-400/80">{r.fl}</td>
                                      <td className="py-2.5 px-4 font-black text-[#f97316] text-xs">{r.fp}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Scoring System calculation chart matching image color scheme */}
                            <div className="space-y-3">
                              <h5 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Scoring System (FP Calculation)</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 bg-[#020617]/40 border border-white/5 rounded-2xl p-4 text-xs font-semibold">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-slate-400">Pass TD</span>
                                    <span className="text-emerald-400 font-bold">+6 Pts</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-slate-400">Pass Yds</span>
                                    <span className="text-white font-mono">+0.05 / Yd</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Interceptions</span>
                                    <span className="text-rose-500 font-bold">-4 Pts</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-slate-400">Rush TD</span>
                                    <span className="text-emerald-400 font-bold">+6 Pts</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-slate-400">Rush Yds</span>
                                    <span className="text-white font-mono">+0.1 / Yd</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Fumbles Lost</span>
                                    <span className="text-rose-500 font-bold">-4 Pts</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-slate-400">Rec TD</span>
                                    <span className="text-emerald-400 font-bold">+6 Pts</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                                    <span className="text-slate-400">Rec Yds</span>
                                    <span className="text-white font-mono">+0.1 / Yd</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5 font-mono">
                                    <span className="text-slate-400 flex items-center gap-1">1st Downs <span className="text-[10px] opacity-70 font-sans">(R/R)</span></span>
                                    <span className="text-white font-mono">+1 Pt Each</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Receptions</span>
                                    <span className="text-white font-mono">0 (Half PPR)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {dfsModalTab === 'news' && (
                          <div className="space-y-4">
                            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scout Feed Intel</h4>
                            <div className="space-y-3">
                              <div className="bg-[#111827]/40 p-4 rounded-xl border border-white/5 space-y-1">
                                <span className="text-[10px] font-mono text-[#f97316] font-bold uppercase tracking-wider">Updated Outlook</span>
                                <h5 className="text-white font-bold text-sm">Full Participation Declared For Upcoming Game</h5>
                                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                  Official sources confirm {selectedDfsPlayer.name} has cleared all physical practice metrics with zero limitations. Coaching staff reports an intentional scheme targeting short coverage gaps, locking in deep redzone usage. Excellent values are expected under current salary cap limits.
                                </p>
                              </div>
                              <div className="bg-[#111827]/40 p-4 rounded-xl border border-white/5 space-y-1">
                                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Stat Analysis</span>
                                <h5 className="text-white font-bold text-sm">High-Ceiling Game Script Potential</h5>
                                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                                  Division showdown setups look outstanding for {selectedDfsPlayer.team}'s current offensive cadence. Analysts expect substantial volume distribution with a projected score cap of {selectedDfsPlayer.proj} points.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {dfsModalTab === 'gamelog' && (
                          <div className="space-y-4">
                            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">2026 Live Match Log</h4>
                            <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111827]/30">
                              <table className="w-full text-[10px] text-slate-300 text-left min-w-[500px]">
                                <thead>
                                  <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-mono border-b border-white/10 text-left">
                                    <th className="py-2.5 px-3">Week</th>
                                    <th className="py-2.5 px-3">Opponent</th>
                                    <th className="py-2.5 px-3">Outcome</th>
                                    <th className="py-2.5 px-3">Game Summary</th>
                                    <th className="py-2.5 px-3 text-[#f97316] text-right">FP Earned</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono">
                                  <tr className="hover:bg-white/5 transition-all text-left">
                                    <td className="py-2.5 px-3 text-white font-bold">Week 3</td>
                                    <td className="py-2.5 px-3 text-emerald-400">vs NYG</td>
                                    <td className="py-2.5 px-3">W 31-17</td>
                                    <td className="py-2.5 px-3 text-slate-400">Dynamic execution, 100% active snaps</td>
                                    <td className="py-2.5 px-3 font-semibold text-amber-400 text-right">{(selectedDfsPlayer.avg * 1.1).toFixed(1)}</td>
                                  </tr>
                                  <tr className="hover:bg-white/5 transition-all text-left">
                                    <td className="py-2.5 px-3 text-white font-bold">Week 2</td>
                                    <td className="py-2.5 px-3 text-rose-400">@ SF</td>
                                    <td className="py-2.5 px-3">L 20-24</td>
                                    <td className="py-2.5 px-3 text-slate-400">Tight defensive pressure, registered 1 score</td>
                                    <td className="py-2.5 px-3 font-semibold text-amber-400 text-right">{(selectedDfsPlayer.avg * 0.82).toFixed(1)}</td>
                                  </tr>
                                  <tr className="hover:bg-white/5 transition-all text-left">
                                    <td className="py-2.5 px-3 text-white font-bold">Week 1</td>
                                    <td className="py-2.5 px-3 text-emerald-400">vs DET</td>
                                    <td className="py-2.5 px-3">W 28-21</td>
                                    <td className="py-2.5 px-3 text-slate-400">Outstanding season-opener contribution</td>
                                    <td className="py-2.5 px-3 font-semibold text-amber-400 text-right">{(selectedDfsPlayer.avg * 1.05).toFixed(1)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* SCOUT INTEL DETAILED NEWS BRIEFING MODAL */}
              {selectedNewsId && (() => {
                const article = REAL_WORLD_NEWS.find(a => a.id === selectedNewsId);
                if (!article) return null;
                return (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111827] border border-brand-purple/30 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
                      
                      {/* HEADER */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-brand-purple/20 text-brand-purple rounded text-xs font-mono font-bold tracking-wider uppercase">
                            {article.category} Report
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            article.teamCode === 'CHE' ? 'bg-blue-900/60 text-blue-200' :
                            article.teamCode === 'LIV' ? 'bg-red-900/60 text-red-200' :
                            article.teamCode === 'ARS' ? 'bg-red-950 text-red-200' :
                            article.teamCode === 'MCI' ? 'bg-sky-950 text-sky-200' :
                            article.teamCode === 'MUN' ? 'bg-rose-950 text-rose-300' :
                            'bg-[#1e1b4b] text-indigo-200'
                          }`}>
                            {article.team}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedNewsId(null)}
                          className="text-slate-400 hover:text-white text-sm bg-white/5 hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center transition focus:outline-none"
                        >
                          ✕
                        </button>
                      </div>

                      {/* MAIN INTEL */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-xl font-display font-black text-white leading-tight">
                            {article.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                          <span className="text-xs font-semibold text-slate-400">Scout Warning:</span>
                          {article.statusBadge && (
                            <span className="px-2 py-0.5 bg-white/5 text-brand-neon rounded text-xs font-mono font-bold">
                              {article.statusBadge}
                            </span>
                          )}
                          <span className="text-xs font-mono text-slate-500">Published {article.publishedAt}</span>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed pt-2 whitespace-pre-line">
                          {article.content}
                        </p>
                      </div>

                      {/* GAFFER RECOMMENDATION BOX */}
                      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-brand-purple font-bold uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-brand-purple" />
                          Gaffer Scout Advisory
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {article.category === 'injury' && "🏥 Draft Advisory: Keep standard substitutes primed on your bench. If ownership is locked and waivers are active, submit a reverse-tier back-up claim immediately to prevent potential drop point damage."}
                          {article.category === 'transfer' && "🤝 Strategy Advisory: Transfer talks signal heavy long-term squad focus. If you hold this asset, reject secondary trade boards; if available, swap active bench margins using fast waiver priority."}
                          {article.category === 'stats' && "📈 Stats Advisory: Real-world momentum statistics support a starting XI slot. Make sure this athlete holds active starting duty in your line-up prior to gameweek deadline."}
                          {article.category === 'general' && "📣 Tactical Advisory: Brand manager formations will revolve heavily around centralizing this talent’s output. Leverage trade deals or build waiver priority to capture this elite vanguard."}
                        </p>
                      </div>

                      {/* FOOTER ACTION BUTTONS */}
                      <div className="pt-4 border-t border-white/5 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedNewsId(null)}
                          className="bg-brand-purple text-white hover:bg-brand-purple/80 text-xs font-bold px-5 py-2.5 rounded-xl transition"
                        >
                          Acknowledge Briefing
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })()}

            </div>
          )}

          {/* TAB 5: PLAYERS DATABASE */}
          {currentTab === 'players' && (
            <div className="space-y-6" id="players-database-panel">
              
              <div className="bg-[#111827]/80 p-5 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl lg:text-2xl font-display font-bold text-white">Full Stars Database</h2>
                  <p className="text-xs text-slate-400">Search injury updates, recent simulated performances, point tallies, and clean sheet statistics.</p>
                </div>

                <div className="flex bg-[#030712] p-1 rounded border border-white/5 text-xs">
                  {(['ALL', 'GKP', 'DEF', 'MID', 'FWD'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPositionFilter(p)}
                      className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition ${
                        positionFilter === p ? 'bg-brand-neon text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEARCH FILTER BOX */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter by player name, club, or status..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-11 py-2.5 text-sm text-white focus:outline-none focus:border-brand-neon"
                />
              </div>

              {/* DYNAMIC LIST */}
              <div className="bg-black/35 border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#111827]/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                        <th className="py-3 px-4">Player Star</th>
                        <th className="py-3 px-4">Club</th>
                        <th className="py-3 px-4 text-center">Position</th>
                        <th className="py-3 px-4 text-center">Goals</th>
                        <th className="py-3 px-4 text-center">Assists</th>
                        <th className="py-3 px-4 text-center">Clean Sheets</th>
                        <th className="py-3 px-4">Status & Health</th>
                        <th className="py-3 px-4 text-right">Owner Status</th>
                        <th className="py-3 px-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {filteredPlayersList.map(p => {
                        const isOwnedInThisLeague = activeLeague?.teams.some(t => 
                          t.activePlayerIds.includes(p.id) || t.benchPlayerIds.includes(p.id)
                        );
                        const owningTeam = activeLeague?.teams.find(t => 
                          t.activePlayerIds.includes(p.id) || t.benchPlayerIds.includes(p.id)
                        );

                        return (
                          <tr key={p.id} className="hover:bg-white/5 transition">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{p.name}</div>
                              {p.injuryDetails && <span className="text-[10px] text-amber-400 block font-normal">{p.injuryDetails}</span>}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{p.club}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase block">
                                {p.position}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono">{p.goals}</td>
                            <td className="py-3 px-4 text-center font-mono">{p.assists}</td>
                            <td className="py-3 px-4 text-center font-mono">{p.cleanSheets}</td>
                            <td className="py-3 px-4">
                              {getStatusBadge(p.injuryStatus)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {owningTeam ? (
                                <span className="text-xs bg-brand-purple/15 text-brand-purple border border-brand-purple/30 px-2.5 py-0.5 rounded font-medium">
                                  {owningTeam.name}
                                </span>
                              ) : (
                                <span className="text-xs text-green-400 font-medium">Free Agent</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-brand-neon font-mono text-base">{p.points}</td>
                          </tr>
                        );
                      })}
                      {filteredPlayersList.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                            No matching players identified. Check position filter parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: MATCHUPS SYSTEM */}
          {currentTab === 'matchups' && (
            <div className="space-y-6" id="matchups-panel">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111827]/80 p-5 rounded-xl border border-white/5">
                <div>
                  <h2 className="text-xl lg:text-2xl font-display font-bold text-white">Gameweek H2H Matchups</h2>
                  <p className="text-xs text-slate-400">Head-to-head points matchups are compiled each gameweek. Click "Simulate Match" to calculate player statistics.</p>
                </div>

                <div className="flex bg-[#030712] p-1 rounded border border-white/5 text-xs">
                  {[1, 2, 3].map(gw => (
                    <button
                      key={gw}
                      onClick={() => setActiveGameweek(gw)}
                      className={`px-4 py-2 rounded text-xs font-bold uppercase transition ${
                        activeGameweek === gw ? 'bg-brand-neon text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Gameweek {gw}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE SCORES COMPARISON */}
              <div className="grid grid-cols-1 xl:secondary-grid gap-6">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg text-white">
                      H2H Fixtures Card - Gameweek {activeGameweek}
                    </h3>
                    {activeLeague?.currentGameweek === activeGameweek && (
                      <button 
                        onClick={handleSimulateGameweek}
                        disabled={activeLeague.status !== 'Active'}
                        className="bg-brand-neon hover:bg-emerald-400 text-black font-semibold text-xs px-3.5 py-1.5 rounded transition shadow disabled:opacity-40"
                      >
                        Simulate Active Gameweek Results 🎮
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {matchupsList.filter(m => m.gameweek === activeGameweek).map((match) => (
                      <div key={match.id} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">

                        {match.kickoffAt && (
                          <div className="px-5 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-brand-neon/5 border-b border-brand-neon/20 text-xs">
                            <span className="font-semibold text-brand-neon">
                              {formatMatchupKickoff(match.kickoffAt)}
                            </span>
                            {match.venue && (
                              <span className="text-slate-400">{match.venue}</span>
                            )}
                          </div>
                        )}
                        
                        {/* SCORE COMPARISON CONTAINER */}
                        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#111827]/60 border-b border-white/5">
                          
                          {/* TEAM A INFO */}
                          <div className="text-center md:text-left flex-1">
                            <h4 className="font-display font-bold text-base text-white">{match.teamAName}</h4>
                            <span className="text-xs text-slate-400">Manager: {match.teamAManager}</span>
                          </div>

                          {/* SCORE NUMBERS */}
                          <div className="flex items-center gap-4 bg-[#030712] px-6 py-2.5 rounded-2xl border border-white/10 font-mono">
                            <strong className="text-2xl font-black text-brand-neon">{match.teamAScore}</strong>
                            <span className="text-xs text-slate-500 font-bold uppercase">VS</span>
                            <strong className="text-2xl font-black text-brand-neon">{match.teamBScore}</strong>
                          </div>

                          {/* TEAM B INFO */}
                          <div className="text-center md:text-right flex-1">
                            <h4 className="font-display font-bold text-base text-white">{match.teamBName}</h4>
                            <span className="text-xs text-slate-400">Manager: {match.teamBManager}</span>
                          </div>

                        </div>

                        {/* DETAILED PLAYER POINTS SUMS */}
                        {match.status === 'Completed' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 p-4 text-xs">
                            
                            {/* Team A players list and their points */}
                            <div className="p-2 space-y-1.5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Starters Performance</span>
                              {Object.entries(match.teamAPlayerPoints).map(([pid, pts]) => {
                                const pObj = allPlayersPool.find(x => x.id === pid);
                                return (
                                  <div key={pid} className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded">
                                    <span>{pObj?.name || pid} <span className="text-slate-400">({pObj?.position})</span></span>
                                    <span className="font-bold text-brand-neon font-mono">{pts} pts</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Team B players list and their points */}
                            <div className="p-2 space-y-1.5">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block md:text-right">Starters Performance</span>
                              {Object.entries(match.teamBPlayerPoints).map(([pid, pts]) => {
                                const pObj = allPlayersPool.find(x => x.id === pid);
                                return (
                                  <div key={pid} className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded">
                                    <span>{pObj?.name || pid} <span className="text-slate-400">({pObj?.position})</span></span>
                                    <span className="font-bold text-brand-neon font-mono">{pts} pts</span>
                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        )}

                        {match.status === 'Upcoming' && (
                          <div className="p-4 text-center text-xs text-slate-400 bg-[#111827]/10 italic">
                            {match.kickoffAt
                              ? `Scheduled for ${formatMatchupKickoff(match.kickoffAt)}. Scores update after gameweek simulation.`
                              : 'Match upcoming. Complete draft phase and click "Simulate Active Gameweek Results" to play matches.'}
                          </div>
                        )}

                      </div>
                    ))}

                    {matchupsList.filter(m => m.gameweek === activeGameweek).length === 0 && (
                      <div className="text-center py-12 bg-black/20 border border-white/5 rounded-xl text-slate-500 text-xs">
                        No head-to-head fixtures programmed for Gameweek {activeGameweek} in this league.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* GLOBAL DFS NFL PLAYER MODAL DISPLAY */}
      <DfsPlayerStatsModal
        selectedDfsPlayer={selectedDfsPlayer}
        onClose={() => setSelectedDfsPlayer(null)}
        dfsDraftedPlayers={dfsDraftedPlayers}
        dfsQueueIds={dfsQueueIds}
        dfsActiveSeatIndex={dfsActiveSeatIndex}
        handleToggleDfsQueue={handleToggleDfsQueue}
        handleDfsManualDraft={handleDfsManualDraft}
        dfsModalTab={dfsModalTab}
        setDfsModalTab={setDfsModalTab}
      />

      {/* FWWB BID MODAL */}
      {isFwwbModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-amber-500/30 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Submit FWWB blind bid
              </h3>
              <button type="button" onClick={() => setIsFwwbModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Remaining budget: <span className="text-amber-300 font-mono font-bold">${fwwbInfo.myRemaining}</span>. Highest bid wins on auction run.
            </p>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">1. Player to drop</label>
              <select
                className="w-full bg-[#030712] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                value={selectedDropPlayer?.id ?? ''}
                onChange={(e) => setSelectedDropPlayer(getWaiverDropPlayers().find(p => p.id === e.target.value) ?? null)}
              >
                <option value="" disabled>Select release...</option>
                {getWaiverDropPlayers().map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">2. Free agent target</label>
              <select
                className="w-full bg-[#030712] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                value={selectedAddPlayer?.id ?? ''}
                onChange={(e) => setSelectedAddPlayer(getWaiverAddPlayers().find(p => p.id === e.target.value) ?? null)}
              >
                <option value="" disabled>Select target...</option>
                {getWaiverAddPlayers().map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.position}) — {p.points} pts</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">3. Bid amount ($)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min={fwwbInfo.minBid}
                  max={Math.max(fwwbInfo.minBid, fwwbInfo.myRemaining)}
                  value={Math.min(fwwbBidAmount, fwwbInfo.myRemaining)}
                  onChange={(e) => setFwwbBidAmount(Number(e.target.value))}
                  className="flex-1 accent-amber-400"
                />
                <input
                  type="number"
                  min={fwwbInfo.minBid}
                  max={fwwbInfo.myRemaining}
                  value={fwwbBidAmount}
                  onChange={(e) => setFwwbBidAmount(Math.min(fwwbInfo.myRemaining, Math.max(fwwbInfo.minBid, Number(e.target.value) || fwwbInfo.minBid)))}
                  className="w-20 bg-[#030712] border border-amber-500/30 rounded-lg px-2 py-1.5 text-sm font-mono text-amber-300 text-center focus:outline-none"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 15, 25, 40].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={preset > fwwbInfo.myRemaining}
                    onClick={() => setFwwbBidAmount(preset)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 text-slate-400 hover:border-amber-500/40 hover:text-amber-300 disabled:opacity-30"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
            {selectedDropPlayer && selectedAddPlayer && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-xs text-amber-200 font-mono">
                Bid ${fwwbBidAmount}: − {selectedDropPlayer.name} → + {selectedAddPlayer.name}
              </div>
            )}
            <div className="pt-2 border-t border-white/5 flex gap-2 justify-end">
              <button type="button" onClick={() => setIsFwwbModalOpen(false)} className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFwwbProposal}
                disabled={!selectedDropPlayer || !selectedAddPlayer || fwwbBidAmount > fwwbInfo.myRemaining}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black text-xs font-bold px-4 py-2 rounded-lg"
              >
                Submit bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAIVER PROPOSAL MODAL (global — works on Waiver Wire tab) */}
      {isWaiverModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-brand-purple/30 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-display font-bold text-white">Submit New Waiver Wire Transfer</h3>
              <button
                type="button"
                onClick={() => setIsWaiverModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Drop a roster player and claim an available free agent. Claims resolve by reverse standings priority.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">1. Player to drop (−)</label>
              <select
                className="w-full bg-[#030712] border border-white/10 rounded-lg p-2.5 text-sm font-medium text-white focus:border-brand-neon focus:outline-none"
                value={selectedDropPlayer?.id ?? ''}
                onChange={(e) => {
                  const match = getWaiverDropPlayers().find(p => p.id === e.target.value);
                  setSelectedDropPlayer(match ?? null);
                }}
              >
                <option value="" disabled>Select player to release...</option>
                {getWaiverDropPlayers().map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.position} · {p.club}) — {p.points} pts
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">2. Free agent to add (+)</label>
              <select
                className="w-full bg-[#030712] border border-white/10 rounded-lg p-2.5 text-sm font-medium text-white focus:border-brand-neon focus:outline-none"
                value={selectedAddPlayer?.id ?? ''}
                onChange={(e) => {
                  const match = getWaiverAddPlayers().find(p => p.id === e.target.value);
                  setSelectedAddPlayer(match ?? null);
                }}
              >
                <option value="" disabled>Select free agent...</option>
                {getWaiverAddPlayers().map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.position} · {p.club}) — {p.points} pts
                  </option>
                ))}
              </select>
            </div>

            {selectedDropPlayer && selectedAddPlayer && (
              <div className="rounded-lg bg-brand-neon/10 border border-brand-neon/25 px-3 py-2 text-xs text-brand-neon font-mono">
                − {selectedDropPlayer.name} → + {selectedAddPlayer.name}
              </div>
            )}

            <div className="pt-2 border-t border-white/5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsWaiverModalOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWaiverProposal}
                disabled={!selectedDropPlayer || !selectedAddPlayer}
                className="bg-brand-neon hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Propose Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT FOOTER FOOTNOTE */}
      <footer className="py-8 border-t border-white/5 text-center text-xs text-slate-500">
        <p>Premier League Draft Fantasy • Monorepo Scalable Architecture Ready</p>
        <p className="mt-1">© {new Date().getFullYear()} AI Studio Fantasy Engine Inc.</p>
      </footer>
    </div>
  );
}
