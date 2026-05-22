import React from 'react';
import { Trophy, Sparkles, ChevronLeft, Star, Share2 } from 'lucide-react';
import { FantasyContest } from '../App';

interface DfsLineupConfirmationScreenProps {
  submittedRoster: {
    contest: FantasyContest;
    picks: any[];
  };
  userProfile?: {
    username: string;
    email: string;
  } | null;
  onBack: () => void;
  onEnterNew: () => void;
}

// Default high-fidelity players matching the user's attached image precisely
const DEFAULT_LINEUP = {
  qb: {
    name: 'J. Burrow',
    team: 'CIN',
    position: 'QB',
    points: 22.5,
    salary: 9800,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  rbs: [
    {
      name: 'J. Mixon',
      team: 'HOU',
      position: 'RB',
      points: 18.4,
      salary: 7200,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'A. Kamara',
      team: 'NO',
      position: 'RB',
      points: 17.6,
      salary: 6900,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ],
  wrs: [
    {
      name: 'T. Hill',
      team: 'MIA',
      position: 'WR',
      points: 19.2,
      salary: 8600,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'J. Jefferson',
      team: 'MIN',
      position: 'WR',
      points: 18.7,
      salary: 8300,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'C. Lamb',
      team: 'DAL',
      position: 'WR',
      points: 17.5,
      salary: 7900,
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&auto=format&fit=crop&q=80'
    }
  ],
  te: {
    name: 'T. Kelce',
    team: 'KC',
    position: 'TE',
    points: 14.6,
    salary: 6200,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  },
  flex: {
    name: 'D. Adams',
    team: 'LV',
    position: 'WR',
    points: 16.1,
    salary: 7100,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  dst: {
    name: '49ers',
    team: 'SF',
    position: 'DST',
    points: 12.4,
    salary: 3200,
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
  },
  bench: [
    {
      name: 'D. Swift',
      team: 'CHI',
      position: 'RB',
      points: 12.3,
      salary: 5100,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'M. Pittman',
      team: 'IND',
      position: 'WR',
      points: 11.8,
      salary: 4900,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'D. Njoku',
      team: 'CLE',
      position: 'TE',
      points: 9.6,
      salary: 3800,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    {
      name: 'B. Aiyuk',
      team: 'SF',
      position: 'WR',
      points: 11.2,
      salary: 5000,
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'
    }
  ]
};

export default function DfsLineupConfirmationScreen({
  submittedRoster,
  userProfile,
  onBack,
  onEnterNew
}: DfsLineupConfirmationScreenProps) {
  // Extract custom user picks from actual draft to override mock values
  const userPicks = submittedRoster.picks || [];

  // Match or map actual picks to fields. If they exist, we use them; otherwise, fallback to standard images!
  const getPlayerForSlot = (pos: string, index: number, defaultPlayer: any) => {
    const matchingPicks = userPicks.filter(p => {
      if (pos === 'FLEX') {
        return p.position === 'RB' || p.position === 'WR' || p.position === 'TE';
      }
      return p.position === pos;
    });

    if (matchingPicks[index]) {
      const pick = matchingPicks[index];
      return {
        name: pick.name.split(' ').map((n: string, i: number) => i === 0 ? `${n[0]}.` : n).join(' '),
        team: pick.team || 'NFL',
        position: pick.position,
        points: pick.points || defaultPlayer.points,
        salary: pick.salary || defaultPlayer.salary,
        avatar: defaultPlayer.avatar
      };
    }
    return defaultPlayer;
  };

  const currentQB = getPlayerForSlot('QB', 0, DEFAULT_LINEUP.qb);
  const currentRB1 = getPlayerForSlot('RB', 0, DEFAULT_LINEUP.rbs[0]);
  const currentRB2 = getPlayerForSlot('RB', 1, DEFAULT_LINEUP.rbs[1]);
  const currentWR1 = getPlayerForSlot('WR', 0, DEFAULT_LINEUP.wrs[0]);
  const currentWR2 = getPlayerForSlot('WR', 1, DEFAULT_LINEUP.wrs[1]);
  const currentWR3 = getPlayerForSlot('WR', 2, DEFAULT_LINEUP.wrs[2]);
  const currentTE = getPlayerForSlot('TE', 0, DEFAULT_LINEUP.te);
  const currentFLEX = getPlayerForSlot('FLEX', 3, DEFAULT_LINEUP.flex); // pick index 3 of Flex-eligible ones
  const currentDST = getPlayerForSlot('DST', 0, DEFAULT_LINEUP.dst);

  // Bench: rest of picks or default
  const mockBench = DEFAULT_LINEUP.bench;

  // Header display from contest
  const contestTitle = submittedRoster?.contest?.title || 'Draft Competitive NFL Mega $10m';
  const cleanTitle = contestTitle.replace(/[^a-zA-Z0-9$ \.]/g, '').trim();

  return (
    <div className="bg-[#030712] text-slate-100 rounded-3xl overflow-hidden border border-white/5 shadow-2xl max-w-4xl mx-auto font-sans">
      
      {/* 1. TOP SPORTZPICKL BRAND HEADER BRANDING BANNER */}
      <div className="bg-[#090d16] border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Custom Styled SP logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-black text-sm tracking-tighter">
            SP
          </div>
          <span className="font-display font-black text-lg tracking-tight text-white">
            Sportz<span className="text-orange-500">Pickl</span>
          </span>
        </div>
        
        {/* Navigation Items */}
        <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button className="hover:text-white transition">Home</button>
          <button className="text-white border-b-2 border-orange-500 pb-1 font-bold">Draft DFS</button>
          <button className="hover:text-white transition">Salary Cap DFS</button>
          <button className="hover:text-white transition">Leaderboards</button>
        </div>
      </div>

      {/* 2. CONTEST SLATE META SUB-BAR */}
      <div className="bg-[#0b0f19] px-6 py-3 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-white/15 rounded-lg transition text-orange-500 mr-1"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[#22c55e] font-display font-black normal-case text-sm tracking-tight flex items-center gap-1.5">
            {cleanTitle}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <div>Entry Fee: <strong className="text-white font-mono">$12</strong></div>
          <div className="text-white/20">•</div>
          <div>Top Prize: <strong className="text-green-400">$1000</strong></div>
          <div className="text-white/20">•</div>
          <div>Winners: <strong className="text-slate-200">20% (100166c)</strong></div>
          <div className="text-white/20">•</div>
          <div>Total Entries: <strong className="text-slate-200 font-mono">59,876</strong></div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* 3. YOUR TEAM PROFILE CARD BLOCK */}
        <div className="bg-[#0b0f19] rounded-2xl border border-white/5 p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          {/* Background subtle glowing radial gradient */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-orange-500/40 flex items-center justify-center text-xl text-slate-300 font-bold overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                Manager Profile
              </span>
              <h2 className="text-xl font-display font-black text-white tracking-tight">
                {userProfile?.username || 'Pooja Doshi'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {userProfile?.email || 'Poojackonlik@gmail.com'}
              </p>
              
              {/* Share actions */}
              <div className="flex items-center gap-2 pt-2.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Share my Line Up:</span>
                <div className="flex items-center gap-1.5 font-sans">
                  {/* X Icon Button */}
                  <button className="w-5 h-5 bg-black hover:bg-white/10 text-white rounded flex items-center justify-center text-[10px] font-black tracking-tighter border border-white/10 transition">
                    𝕏
                  </button>
                  {/* Facebook Icon Button */}
                  <button className="w-5 h-5 bg-[#3b5998] hover:bg-sky-700 text-white rounded flex items-center justify-center text-[10px] font-black tracking-tighter transition">
                    f
                  </button>
                  {/* Instagram Icon Button */}
                  <button className="w-5 h-5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white rounded flex items-center justify-center text-[10px] font-black tracking-tighter transition">
                    📸
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PROJECTED POINTS BLOCK */}
          <div className="bg-[#030712] border border-orange-500/20 px-6 py-4 rounded-xl text-center md:text-right shadow-lg flex-shrink-0 w-full md:w-auto">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Projected Points</span>
            <strong className="text-orange-500 text-2xl font-mono font-black tracking-tight block mt-0.5">
              437 Pts
            </strong>
          </div>
        </div>

        {/* 4. ACTIONS CTA BAR BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-950/25"
          >
            <Trophy className="w-3.5 h-3.5" />
            Enter Same Contest
          </button>
          
          <button 
            onClick={onEnterNew}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#7c3aed] hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-purple-950/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Enter New Contest
          </button>

          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#22c55e] hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-950/20"
          >
            {/* List Board icon */}
            <span className="text-sm font-semibold">☰</span>
            Open Draft Board
          </button>
        </div>

        {/* 5. VIRTUAL TACTICAL FOOTBALL FIELD PITCH */}
        <div className="bg-[#0b0f19] rounded-2xl border border-white/5 p-4 md:p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          
          {/* Pure HTML/CSS styled Football Pitch layout */}
          <div className="w-full max-w-[550px] aspect-[4/5] bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 rounded-2xl border-2 border-emerald-500/30 relative overflow-hidden px-4 py-8 shadow-inner flex flex-col justify-between">
            
            {/* Football pitch grass stripes */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 w-full ${i % 2 === 0 ? 'bg-black/5' : 'bg-transparent'}`} 
                />
              ))}
            </div>

            {/* Pitch Lines and Numbers (Visual Football field style) */}
            <div className="absolute inset-x-0 inset-y-0 border-r border-l border-white/5 pointer-events-none">
              {/* Yard numbers on sides of pitch */}
              <div className="absolute inset-y-0 left-2 flex flex-col justify-between py-12 text-[9px] font-mono text-white/10 font-black">
                <span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span>
              </div>
              <div className="absolute inset-y-0 right-2 flex flex-col justify-between py-12 text-[9px] font-mono text-white/10 font-black text-right">
                <span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span>
              </div>
              
              {/* Yard line markers */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-full border-t border-white/5" 
                  style={{ top: `${(i + 1) * 10}%` }}
                />
              ))}

              {/* End zones */}
              <div className="absolute top-0 w-full h-8 bg-emerald-900/10 border-b border-emerald-500/20" />
              <div className="absolute bottom-0 w-full h-8 bg-emerald-900/10 border-t border-emerald-500/20" />
            </div>

            {/* FIELD POSITIONS DYNAMIC GRID */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between space-y-4">
              
              {/* POSITION: QB */}
              <div className="flex flex-col items-center">
                <span className="bg-[#10b981] text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full mb-1 tracking-wider">
                  QB
                </span>
                {renderPlayerCard(currentQB)}
              </div>

              {/* POSITION: RB */}
              <div className="flex flex-col items-center">
                <span className="bg-[#14b8a6] text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full mb-1 tracking-wider">
                  RB
                </span>
                <div className="flex justify-center gap-4 w-full">
                  {renderPlayerCard(currentRB1)}
                  {renderPlayerCard(currentRB2)}
                </div>
              </div>

              {/* POSITION: WR */}
              <div className="flex flex-col items-center">
                <span className="bg-[#2563eb] text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full mb-2 tracking-wider">
                  WR
                </span>
                <div className="grid grid-cols-3 gap-2 w-full">
                  {renderPlayerCard(currentWR1)}
                  {renderPlayerCard(currentWR2)}
                  {renderPlayerCard(currentWR3)}
                </div>
              </div>

              {/* POSITION: TE */}
              <div className="flex flex-col items-center">
                <span className="bg-[#0ea5e9] text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full mb-1 tracking-wider">
                  TE
                </span>
                {renderPlayerCard(currentTE)}
              </div>

              {/* POSITION: FLEX */}
              <div className="flex flex-col items-center">
                <span className="bg-[#b45309] text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full mb-1 tracking-wider">
                  FLEX
                </span>
                {renderPlayerCard(currentFLEX)}
              </div>

              {/* POSITION: DST */}
              <div className="flex flex-col items-center">
                <span className="bg-[#be123c] text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full mb-1 tracking-wider">
                  DST
                </span>
                {renderDSTCard(currentDST)}
              </div>

            </div>
          </div>

          {/* SALARY SUMMARY SUMMARY ROW */}
          <div className="w-full max-w-[550px] mt-4 flex items-center justify-between px-2 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 text-green-400 font-mono">
              <span>Remaining Salary</span>
              <span className="bg-green-500/15 text-green-400 font-black font-mono px-2 py-0.5 rounded border border-green-500/20">
                $300
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <span>Total Salary:</span>
              <strong className="text-orange-400 font-black">$49,700</strong>
              <span className="text-slate-600">/ $50,000</span>
            </div>
          </div>

        </div>

        {/* 6. BENCH SECTION CONTAINER */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-display font-black text-sm text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-500 rounded-full" />
              Bench
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Reserves [BN]</span>
          </div>

          {/* Bench players list */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mockBench.map((benchPlayer, idx) => (
              <div 
                key={idx}
                className="bg-[#0b0f19] border border-white/5 p-3 rounded-xl flex items-center gap-2.5 hover:border-white/10 transition shadow-md relative"
              >
                {/* BN Badge Tag */}
                <span className="absolute right-2.5 top-2 bg-slate-800/80 border border-white/10 text-slate-400 font-mono font-bold text-[8px] px-1 rounded">
                  BN
                </span>

                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                  <img 
                    src={benchPlayer.avatar} 
                    alt={benchPlayer.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-white truncate">{benchPlayer.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{benchPlayer.team} | {benchPlayer.position}</p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-orange-400 font-mono text-[10px] font-black">{benchPlayer.points} Pts</span>
                    <span className="text-slate-500 font-mono text-[9px]">${benchPlayer.salary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. LEGEND COLORED FOOTER CHART */}
        <div className="bg-[#0b0f19]/40 border border-white/5 p-3 rounded-xl flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#10b981]" />
            <span>QB: Quarterback</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#14b8a6]" />
            <span>RB: Running Back</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#2563eb]" />
            <span>WR: Wide Receiver</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#0ea5e9]" />
            <span>TE: Tight End</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#b45309]" />
            <span>FLEX: Flex (RB/WR/TE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#be123c]" />
            <span>DST: Defense / Special Teams</span>
          </div>
        </div>

      </div>

    </div>
  );
}

// Subcomponent: Render Player Card for Field
function renderPlayerCard(player: any) {
  return (
    <div className="bg-[#0c1523]/95 border border-white/10 rounded-xl p-1.5 w-full max-w-[130px] flex items-center gap-2 shadow-lg hover:border-orange-500/20 transition-all cursor-default">
      {/* Player Avatar */}
      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {player.avatar ? (
          <img 
            src={player.avatar} 
            alt={player.name} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-[10px] font-mono leading-none font-bold text-slate-400">{player.name[0]}</span>
        )}
      </div>
      
      {/* Name and Meta */}
      <div className="min-w-0 flex-1 leading-tight text-left">
        <h4 className="font-bold text-[10px] text-white truncate font-display tracking-tight">
          {player.name}
        </h4>
        <div className="text-[8px] text-slate-400 flex items-center justify-between mt-0.5 truncate leading-none">
          <span>{player.team} | {player.position}</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-orange-400 text-[9px] font-mono font-black">
            {player.points} Pts
          </span>
          <span className="text-[8px] text-slate-500 font-mono">
            ${player.salary.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Render DST Card specifically
function renderDSTCard(player: any) {
  return (
    <div className="bg-[#0c1523]/95 border border-white/10 rounded-xl p-1.5 w-full max-w-[130px] flex items-center gap-2 shadow-lg hover:border-orange-500/20 transition-all cursor-default">
      {/* 49ers or generic logo box style */}
      <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {/* Render a beautiful oval styled football badge with SF letters like 49ers */}
        <div className="w-6 h-4 bg-red-600 rounded-full border border-amber-500/50 flex items-center justify-center font-black text-black text-[7px] leading-none">
          SF
        </div>
      </div>
      
      {/* Name and Meta */}
      <div className="min-w-0 flex-1 leading-tight text-left">
        <h4 className="font-bold text-[10px] text-white truncate font-display tracking-tight">
          {player.name}
        </h4>
        <div className="text-[8px] text-slate-400 flex items-center justify-between mt-0.5 truncate leading-none">
          <span>{player.team} | {player.position}</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-orange-400 text-[9px] font-mono font-black">
            {player.points} Pts
          </span>
          <span className="text-[8px] text-slate-500 font-mono">
            ${player.salary.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
