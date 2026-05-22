import React, { useMemo, useState } from 'react';
import { AlertTriangle, Shield, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Player, PlayerPosition, Team } from '../types';
import FplStyleTeamPreview, {
  buildFormationRows,
  fixtureFromId,
  playerToPreviewCard,
  PreviewCardPlayer,
} from './FplStyleTeamPreview';

interface TacticalSquadPitchProps {
  formation: string;
  active: Player[];
  bench: Player[];
  team: Team;
  onBench: (playerId: string) => void;
  onCaptain: (playerId: string) => void;
  onViceCaptain: (playerId: string) => void;
}

function parseFormation(formation: string) {
  const parts = formation.split('-').map(Number).filter(n => !Number.isNaN(n));
  if (parts.length >= 3) return { def: parts[0], mid: parts[1], fwd: parts[2] };
  return { def: 4, mid: 4, fwd: 2 };
}

const POS_COLORS: Record<PlayerPosition, string> = {
  GKP: 'text-emerald-400',
  DEF: 'text-sky-400',
  MID: 'text-violet-400',
  FWD: 'text-rose-400',
};

export default function TacticalSquadPitch({
  formation,
  active,
  bench,
  team,
  onBench,
  onCaptain,
  onViceCaptain,
}: TacticalSquadPitchProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const formationLabel = parseFormation(formation);

  const starterPoints = useMemo(
    () => active.reduce((s, p) => s + p.points, 0),
    [active]
  );
  const captain = active.find(p => p.id === team.captainId);
  const vice = active.find(p => p.id === team.viceCaptainId);
  const projectedGw = useMemo(() => {
    let total = starterPoints;
    if (captain) total += captain.points;
    if (vice) total += vice.points * 0.5;
    return total;
  }, [starterPoints, captain, vice]);

  const injuryCount = useMemo(
    () => [...active, ...bench].filter(p => p.injuryStatus !== 'Available').length,
    [active, bench]
  );

  const toCard = (p: Player, isStarter: boolean): PreviewCardPlayer => {
    const isCaptain = team.captainId === p.id;
    const isVice = team.viceCaptainId === p.id;
    return playerToPreviewCard(p, {
      fixture: fixtureFromId(p.club, p.id),
      points: p.points,
      badge: isCaptain ? 'C' : isVice ? 'V' : undefined,
      isSelected: selectedId === p.id,
      onSelect: () => setSelectedId(prev => (prev === p.id ? null : p.id)),
      onCaptain: () => onCaptain(p.id),
      onViceCaptain: () => onViceCaptain(p.id),
      onBench: isStarter ? () => onBench(p.id) : undefined,
    });
  };

  const activeCards = useMemo(() => active.map(p => toCard(p, true)), [active, team, selectedId]);
  const pitchRows = useMemo(
    () => buildFormationRows(activeCards, formation),
    [activeCards, formation]
  );

  const selectedPlayer = useMemo(() => {
    const all = [...active, ...bench];
    return all.find(p => p.id === selectedId) ?? null;
  }, [active, bench, selectedId]);

  return (
    <div className="tactical-squad-panel" id="soccer-field-pitch">
      <div className="tactical-squad-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className="tactical-squad-icon">
            <Sparkles className="w-5 h-5 text-brand-neon" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-black text-lg text-white tracking-tight">
              Tactical Squad
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {team.name} · {formation} ({formationLabel.def}-{formationLabel.mid}-{formationLabel.fwd})
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <span className="tactical-stat-pill">
            <Users className="w-3 h-3" />
            {active.length}/8 starters
          </span>
          <span className="tactical-stat-pill tactical-stat-pill--neon">
            <TrendingUp className="w-3 h-3" />
            {starterPoints} pts
          </span>
          <span className="tactical-stat-pill tactical-stat-pill--purple">
            <Shield className="w-3 h-3" />
            ~{projectedGw.toFixed(0)} GW proj
          </span>
          {injuryCount > 0 && (
            <span className="tactical-stat-pill tactical-stat-pill--warn">
              <AlertTriangle className="w-3 h-3" />
              {injuryCount} flagged
            </span>
          )}
        </div>
      </div>

      {(captain || vice) && (
        <div className="tactical-captain-bar">
          {captain && (
            <span className="tactical-captain-chip tactical-captain-chip--c">
              Captain · {captain.name.split(' ').pop()} (2×)
            </span>
          )}
          {vice && (
            <span className="tactical-captain-chip tactical-captain-chip--v">
              Vice · {vice.name.split(' ').pop()} (1.5×)
            </span>
          )}
        </div>
      )}

      <FplStyleTeamPreview rows={pitchRows} showPitchHeader className="tactical-pitch-inner" />

      {bench.length > 0 && (
        <div className="tactical-bench-section">
          <div className="flex items-center justify-between mb-2 px-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Substitutes ({bench.length})
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Tap card · hover for actions</span>
          </div>
          <div className="tactical-bench-scroll">
            {bench.map(p => {
              const card = toCard(p, false);
              const injured = p.injuryStatus !== 'Available';
              return (
                <div
                  key={p.id}
                  className={`tactical-bench-chip ${selectedId === p.id ? 'tactical-bench-chip--selected' : ''} ${
                    injured ? 'tactical-bench-chip--injured' : ''
                  }`}
                  onClick={() => setSelectedId(prev => (prev === p.id ? null : p.id))}
                >
                  <span className={`text-[9px] font-black uppercase ${POS_COLORS[p.position]}`}>
                    {p.position}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[72px]">
                    {p.name.split(' ').pop()}
                  </span>
                  <span className="text-[10px] font-mono text-brand-neon">{p.points} pts</span>
                  <span className="text-[9px] text-slate-500 truncate max-w-[80px]">{p.club}</span>
                  <div className="tactical-bench-chip-actions">
                    <button type="button" onClick={e => { e.stopPropagation(); onCaptain(p.id); }}>C</button>
                    <button type="button" onClick={e => { e.stopPropagation(); onViceCaptain(p.id); }}>V</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedPlayer && (
        <div className="tactical-selected-panel">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Selected</p>
            <p className="font-display font-bold text-white truncate">{selectedPlayer.name}</p>
            <p className="text-xs text-slate-400">
              {selectedPlayer.club} · {selectedPlayer.position} ·{' '}
              <span className="text-brand-neon font-mono font-bold">{selectedPlayer.points} pts</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              type="button"
              className="tactical-action-btn tactical-action-btn--c"
              onClick={() => onCaptain(selectedPlayer.id)}
            >
              Set Captain
            </button>
            <button
              type="button"
              className="tactical-action-btn tactical-action-btn--v"
              onClick={() => onViceCaptain(selectedPlayer.id)}
            >
              Set Vice
            </button>
            {active.some(p => p.id === selectedPlayer.id) && (
              <button
                type="button"
                className="tactical-action-btn tactical-action-btn--bench"
                onClick={() => onBench(selectedPlayer.id)}
              >
                Move to Bench
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-500 px-2">
        Hover a starter for quick C / V / bench actions, or use the squad list on the right.
      </p>
    </div>
  );
}
