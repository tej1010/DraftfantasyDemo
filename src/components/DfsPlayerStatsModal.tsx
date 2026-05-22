import React from 'react';
import { X, Star, Plus } from 'lucide-react';
import { DfsNflPlayer } from '../App';

interface DfsPlayerStatsModalProps {
  selectedDfsPlayer: DfsNflPlayer | null;
  onClose: () => void;
  dfsDraftedPlayers: any[];
  dfsQueueIds: string[];
  dfsActiveSeatIndex: number;
  handleToggleDfsQueue: (id: string) => void;
  handleDfsManualDraft: (player: any) => void;
  dfsModalTab: 'news' | 'stats' | 'gamelog';
  setDfsModalTab: (tab: 'news' | 'stats' | 'gamelog') => void;
}

export default function DfsPlayerStatsModal({
  selectedDfsPlayer,
  onClose,
  dfsDraftedPlayers,
  dfsQueueIds,
  dfsActiveSeatIndex,
  handleToggleDfsQueue,
  handleDfsManualDraft,
  dfsModalTab,
  setDfsModalTab,
}: DfsPlayerStatsModalProps) {
  if (!selectedDfsPlayer) return null;

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
    GB: 'Green Bay Packers',
    PIT: 'Pittsburgh Steelers',
    WAS: 'Washington Commanders',
    TB: 'Tampa Bay Buccaneers',
    CLE: 'Cleveland Browns',
    NO: 'New Orleans Saints',
    TEN: 'Tennessee Titans',
    IND: 'Indianapolis Colts',
    JAX: 'Jacksonville Jaguars',
    CAR: 'Carolina Panthers',
    LV: 'Las Vegas Raiders',
    HOU: 'Houston Texans',
    CHI: 'Chicago Bears',
    SEA: 'Seattle Seahawks',
    NE: 'New England Patriots',
    DEN: 'Denver Broncos',
    CIN: 'Cincinnati Bengals',
  };

  const TEAM_BG_CLASSES: Record<string, string> = {
    KC: 'bg-red-600 text-white',
    MIN: 'bg-violet-900 text-amber-300',
    PHI: 'bg-teal-900 text-white',
    DET: 'bg-cyan-500 text-white',
    SF: 'bg-red-700 text-amber-200',
    DAL: 'bg-slate-700 text-slate-100',
    BAL: 'bg-purple-900 text-amber-300 border border-purple-500/20',
    BUF: 'bg-blue-600 text-white',
    LAR: 'bg-blue-500 text-yellow-300',
    ARI: 'bg-red-800 text-white',
    ATL: 'bg-black text-red-500',
    MIA: 'bg-teal-500 text-orange-400',
    NYJ: 'bg-emerald-800 text-white',
    GB: 'bg-yellow-600 text-emerald-900',
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
      fp: Math.round(fp || selectedDfsPlayer.avg * 16),
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/90 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" id="dfs-player-stats-modal">
      <div className="bg-[#0b0f19] border border-white/10 rounded-3xl w-full max-w-4xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.2)] my-8 relative">
        
        {/* Close button in top-right */}
        <button 
          onClick={onClose}
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
                onClose();
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
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5 font-mono font-bold">
                      <span className="text-slate-400 flex items-center gap-1">1st Downs <span className="text-[10px] opacity-70 font-sans font-semibold">(R/R)</span></span>
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
                  <p className="text-xs text-[#00d8f6] leading-relaxed mt-1">
                    Division showdown setups look outstanding for {selectedDfsPlayer.team}'s current cadence. Analysts expect substantial volume distribution with a projected score cap of {selectedDfsPlayer.proj} points.
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
                    <tr className="hover:bg-white/5 transition-all text-left font-semibold">
                      <td className="py-2.5 px-3 text-white font-bold">Week 3</td>
                      <td className="py-2.5 px-3 text-emerald-400">vs NYG</td>
                      <td className="py-2.5 px-3">W 31-17</td>
                      <td className="py-2.5 px-3 text-slate-400">Dynamic execution, 100% active snaps</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-400 text-right">{(selectedDfsPlayer.avg * 1.1).toFixed(1)}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-all text-left font-semibold">
                      <td className="py-2.5 px-3 text-white font-bold">Week 2</td>
                      <td className="py-2.5 px-3 text-rose-400">@ SF</td>
                      <td className="py-2.5 px-3">L 20-24</td>
                      <td className="py-2.5 px-3 text-slate-400">Tight defensive pressure, registered 1 score</td>
                      <td className="py-2.5 px-3 font-semibold text-amber-400 text-right">{(selectedDfsPlayer.avg * 0.82).toFixed(1)}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-all text-left font-semibold">
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
}
