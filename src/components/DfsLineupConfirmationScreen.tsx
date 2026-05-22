import React, { useMemo, useState } from 'react';
import { Trophy, Sparkles, ChevronLeft } from 'lucide-react';
import { FantasyContest } from '../App';
import DfsTournamentSchedulePanel from './DfsTournamentSchedulePanel';
import FplStyleTeamPreview, { playerToPreviewCard, PreviewCardPlayer } from './FplStyleTeamPreview';

interface DraftPick {
  id: string;
  name: string;
  team?: string;
  position: string;
  points?: number;
  opp?: string;
  adp?: number;
}

interface DfsLineupConfirmationScreenProps {
  submittedRoster: {
    contest: FantasyContest;
    picks: DraftPick[];
  };
  userProfile?: {
    username: string;
    email: string;
  } | null;
  onBack: () => void;
  onEnterNew: () => void;
  onToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

const BRAND = {
  neon: '#22c55e',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  dark: '#030712',
};

function takeByPosition(remaining: DraftPick[], pos: string): DraftPick | null {
  const idx = remaining.findIndex(p => p.position === pos);
  if (idx === -1) return null;
  return remaining.splice(idx, 1)[0];
}

function buildFootballPreviewRows(picks: DraftPick[]): (PreviewCardPlayer | null)[][] {
  const remaining = [...picks];
  const gkp = takeByPosition(remaining, 'GKP');
  const def1 = takeByPosition(remaining, 'DEF');
  const def2 = takeByPosition(remaining, 'DEF');
  const def3 = takeByPosition(remaining, 'DEF');
  const mid1 = takeByPosition(remaining, 'MID');
  const mid2 = takeByPosition(remaining, 'MID');
  const mid3 = takeByPosition(remaining, 'MID');
  const fwd1 = takeByPosition(remaining, 'FWD');
  const fwd2 = takeByPosition(remaining, 'FWD');
  const fwd3 = takeByPosition(remaining, 'FWD');

  const toCard = (p: DraftPick | null) => (p ? playerToPreviewCard(p) : null);

  return [
    [toCard(fwd1), toCard(fwd2), toCard(fwd3)],
    [toCard(mid1), toCard(mid2), toCard(mid3)],
    [toCard(def1), toCard(def2), toCard(def3)],
    [toCard(gkp)],
  ];
}

export default function DfsLineupConfirmationScreen({
  submittedRoster,
  userProfile,
  onBack,
  onEnterNew,
  onToast,
}: DfsLineupConfirmationScreenProps) {
  const [showSchedule, setShowSchedule] = useState(true);
  const userPicks = (submittedRoster.picks || []).filter(
    (p: DraftPick & { draftedBySeatIndex?: number }) => p.draftedBySeatIndex === 3 || p.draftedBySeatIndex === undefined
  );
  const previewRows = useMemo(() => buildFootballPreviewRows(userPicks), [userPicks]);
  const starters = useMemo(
    () => previewRows.flat().filter((p): p is PreviewCardPlayer => p != null),
    [previewRows]
  );
  const projectedPts = useMemo(
    () => userPicks.reduce((sum, p) => sum + (p.points ?? 0), 0),
    [userPicks]
  );

  const contestTitle = submittedRoster?.contest?.title || 'Draft Contest';
  const cleanTitle = contestTitle.replace(/[^a-zA-Z0-9$ .]/g, '').trim();

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-w-5xl mx-auto font-sans"
      style={{ background: BRAND.dark }}
    >
      <div
        className="relative py-4 px-6 flex items-center justify-center gap-3"
        style={{
          background: `linear-gradient(90deg, ${BRAND.purple} 0%, ${BRAND.blue} 48%, ${BRAND.neon} 100%)`,
        }}
      >
        <button
          onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black/25 hover:bg-black/40 text-white"
          title="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Trophy className="w-7 h-7 text-white drop-shadow-md" />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Team Preview</p>
          <h1 className="font-display font-black text-lg text-white tracking-tight">{cleanTitle}</h1>
        </div>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-black text-black/80 bg-white/90 px-2 py-1 rounded-lg">
          {projectedPts.toFixed(1)} pts
        </span>
      </div>

      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-[#0b0f19]">
        <div>
          <p className="text-[10px] text-brand-neon uppercase font-bold tracking-wider">Manager</p>
          <p className="font-display font-black text-white">{userProfile?.username || 'Manager'}</p>
        </div>
        <p className="text-xs text-slate-400">{starters.length} starters · locked lineup</p>
      </div>

      <div className="px-4 py-4 md:px-6 md:py-5 bg-[#061210]">
        <FplStyleTeamPreview rows={previewRows} showPitchHeader />
      </div>

      <DfsTournamentSchedulePanel
        contestTitle={cleanTitle}
        userName={userProfile?.username || 'Manager'}
        showSchedule={showSchedule}
        onToggleSchedule={() => setShowSchedule(s => !s)}
        onShareToast={onToast}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4 pt-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 py-2.5 text-white text-xs font-black uppercase rounded-xl transition"
          style={{ background: BRAND.purple }}
        >
          <Trophy className="w-3.5 h-3.5" />
          Same Contest
        </button>
        <button
          onClick={onEnterNew}
          className="flex items-center justify-center gap-2 py-2.5 bg-brand-blue hover:opacity-90 text-white text-xs font-black uppercase rounded-xl transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          New Contest
        </button>
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 py-2.5 font-black text-xs uppercase rounded-xl transition text-black"
          style={{ background: BRAND.neon }}
        >
          Draft Board
        </button>
      </div>
    </div>
  );
}
