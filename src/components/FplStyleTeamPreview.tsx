import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export type PreviewCardPlayer = {
  id: string;
  name: string;
  club: string;
  position: string;
  price?: string;
  points?: number;
  fixture?: string;
  injuryStatus?: 'Available' | 'Doubtful' | 'Injured' | 'Suspended';
  jerseyNumber?: string;
  badge?: 'C' | 'V';
  isSelected?: boolean;
  onRemove?: () => void;
  onSelect?: () => void;
  onCaptain?: () => void;
  onViceCaptain?: () => void;
  onBench?: () => void;
};

type RowLayout = { slots: number; position: string };

const PL_KITS: Record<string, { primary: string; secondary: string; trim: string }> = {
  'Man City': { primary: '#6CABDD', secondary: '#FFFFFF', trim: '#1C2C5B' },
  Liverpool: { primary: '#C8102E', secondary: '#FFFFFF', trim: '#00B2A9' },
  Arsenal: { primary: '#EF0107', secondary: '#FFFFFF', trim: '#023474' },
  Chelsea: { primary: '#034694', secondary: '#FFFFFF', trim: '#EE242C' },
  'Man Utd': { primary: '#DA291C', secondary: '#FBE122', trim: '#000000' },
  Spurs: { primary: '#132257', secondary: '#FFFFFF', trim: '#FFFFFF' },
  'Aston Villa': { primary: '#670E36', secondary: '#95BFE5', trim: '#FFFFFF' },
  Everton: { primary: '#003399', secondary: '#FFFFFF', trim: '#FFFFFF' },
  Newcastle: { primary: '#241F20', secondary: '#FFFFFF', trim: '#F9DC16' },
  Brighton: { primary: '#0057B8', secondary: '#FFFFFF', trim: '#FFCD00' },
  Brentford: { primary: '#E30613', secondary: '#FFFFFF', trim: '#000000' },
  Fulham: { primary: '#FFFFFF', secondary: '#000000', trim: '#CC0000' },
  Bournemouth: { primary: '#DA291C', secondary: '#000000', trim: '#FFFFFF' },
  Wolves: { primary: '#FDB913', secondary: '#231F20', trim: '#FFFFFF' },
  DEFAULT: { primary: '#1e3a2f', secondary: '#ffffff', trim: '#22c55e' },
};

const FPL_ROWS: RowLayout[] = [
  { slots: 2, position: 'GKP' },
  { slots: 5, position: 'DEF' },
  { slots: 5, position: 'MID' },
  { slots: 3, position: 'FWD' },
];

function clubKit(club: string) {
  return PL_KITS[club] || PL_KITS.DEFAULT;
}

function lastName(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length <= 1) return name;
  const last = parts[parts.length - 1];
  if (parts[0].length === 1 && parts[0].endsWith('.')) return `${parts[0]} ${last}`;
  return last;
}

export function priceFromPoints(points: number) {
  const val = Math.max(4.0, Math.min(14.5, 4.2 + points / 22));
  return `£${val.toFixed(1)}m`;
}

export function fixtureFromId(club: string, id: string) {
  const codes = ['LIV', 'AVL', 'TOT', 'CHE', 'NEW', 'MCI', 'ARS', 'WHU', 'BRE', 'FUL'];
  const n = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const opp = codes[n % codes.length];
  const away = n % 2 === 0;
  return `${opp} (${away ? 'A' : 'H'})`;
}

function assignToRows(players: PreviewCardPlayer[], layout: RowLayout[]): (PreviewCardPlayer | null)[][] {
  const pool = [...players];
  return layout.map(({ slots, position }) => {
    const row: (PreviewCardPlayer | null)[] = [];
    for (let i = 0; i < slots; i++) {
      const idx = pool.findIndex(p => p.position === position);
      if (idx >= 0) row.push(pool.splice(idx, 1)[0]);
      else row.push(null);
    }
    return row;
  });
}

function KitJersey({ club, number }: { club: string; number: string }) {
  const kit = clubKit(club);
  return (
    <div className="fpl-kit-jersey">
      <svg viewBox="0 0 80 96" className="w-full h-full">
        <path
          d="M22 18 L12 32 L18 34 L20 88 L60 88 L62 34 L68 32 L58 18 L48 22 L40 16 L32 22 Z"
          fill={kit.primary}
          stroke={kit.trim}
          strokeWidth="1.2"
        />
        <path d="M32 22 L40 30 L48 22 L52 26 L40 36 L28 26 Z" fill={kit.secondary} opacity="0.92" />
        <text x="40" y="58" textAnchor="middle" fill={kit.trim} fontSize="17" fontWeight="bold" fontFamily="system-ui">
          {number}
        </text>
      </svg>
    </div>
  );
}

function MiniGoal() {
  return (
    <div className="fpl-preview-goal" aria-hidden>
      <svg viewBox="0 0 64 40" className="w-14 h-9">
        <rect x="4" y="8" width="56" height="28" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        <path d="M4 8 L32 2 L60 8" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <line x1="32" y1="2" x2="32" y2="36" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </svg>
    </div>
  );
}

function PreviewKitCard({
  player,
  emptyLabel,
  compact,
}: {
  player: PreviewCardPlayer | null;
  emptyLabel: string;
  compact?: boolean;
}) {
  if (!player) {
    return (
      <div className={`fpl-preview-card fpl-preview-card--empty ${compact ? 'fpl-preview-card--compact' : ''}`}>
        <span className="text-[10px] font-mono text-white/30 uppercase">{emptyLabel}</span>
      </div>
    );
  }

  const injured = player.injuryStatus === 'Injured' || player.injuryStatus === 'Suspended';
  const doubtful = player.injuryStatus === 'Doubtful';
  const topRight =
    player.points != null ? `${player.points} pts` : player.price ?? priceFromPoints(0);
  const fixture = player.fixture ?? fixtureFromId(player.club, player.id);
  const jerseyNum = player.jerseyNumber ?? String((player.id.charCodeAt(0) % 89) + 1);
  const hasActions = !!(player.onCaptain || player.onViceCaptain || player.onBench);

  return (
    <div
      className={`fpl-preview-card group ${compact ? 'fpl-preview-card--compact' : ''} ${
        player.isSelected ? 'fpl-preview-card--selected' : ''
      }`}
      onClick={player.onSelect}
      onKeyDown={e => e.key === 'Enter' && player.onSelect?.()}
      role={player.onSelect ? 'button' : undefined}
      tabIndex={player.onSelect ? 0 : undefined}
    >
      <div className="fpl-preview-card-body">
        {player.badge && (
          <span
            className={`fpl-preview-card-badge ${
              player.badge === 'C' ? 'fpl-preview-card-badge--c' : 'fpl-preview-card-badge--v'
            }`}
          >
            {player.badge}
          </span>
        )}
        {player.onRemove ? (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              player.onRemove?.();
            }}
            className="fpl-preview-card-x"
            aria-label="Remove"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        ) : null}
        <span className="fpl-preview-card-price">{topRight}</span>
        {(injured || doubtful) && (
          <span className={`fpl-preview-card-alert ${injured ? 'fpl-preview-card-alert--red' : 'fpl-preview-card-alert--amber'}`}>
            <AlertCircle className="w-3 h-3" />
          </span>
        )}
        <KitJersey club={player.club} number={jerseyNum} />
        {hasActions && (
          <div className="fpl-preview-card-actions">
            {player.onCaptain && (
              <button type="button" onClick={e => { e.stopPropagation(); player.onCaptain?.(); }}>
                C
              </button>
            )}
            {player.onViceCaptain && (
              <button type="button" onClick={e => { e.stopPropagation(); player.onViceCaptain?.(); }}>
                V
              </button>
            )}
            {player.onBench && (
              <button type="button" onClick={e => { e.stopPropagation(); player.onBench?.(); }}>
                ↓
              </button>
            )}
          </div>
        )}
      </div>
      <div
        className={`fpl-preview-card-footer ${injured ? 'fpl-preview-card-footer--injured' : doubtful ? 'fpl-preview-card-footer--doubt' : ''}`}
      >
        <p className="fpl-preview-card-name">{lastName(player.name)}</p>
        <p className="fpl-preview-card-fixture">{fixture}</p>
      </div>
    </div>
  );
}

interface FplStyleTeamPreviewProps {
  players?: PreviewCardPlayer[];
  layout?: RowLayout[];
  rows?: (PreviewCardPlayer | null)[][];
  showPitchHeader?: boolean;
  compactCards?: boolean;
  className?: string;
}

export default function FplStyleTeamPreview({
  players = [],
  layout = FPL_ROWS,
  rows: rowsOverride,
  showPitchHeader = true,
  compactCards = false,
  className = '',
}: FplStyleTeamPreviewProps) {
  const rows = rowsOverride ?? assignToRows(players, layout);

  return (
    <div className={`fpl-preview-wrap ${className}`}>
      <div className="fpl-preview-scene">
        <div className="fpl-preview-pitch">
          <div className="fpl-preview-grass" />
          <div className="fpl-preview-markings" />

          {showPitchHeader && (
            <div className="fpl-preview-brand-bar">
              <span className="fpl-fantasy-logo">Fantasy</span>
              <MiniGoal />
              <span className="fpl-fantasy-logo">Fantasy</span>
            </div>
          )}

          <div className="fpl-preview-rows">
            {rows.map((row, ri) => (
              <div key={ri} className="fpl-preview-row">
                {row.map((p, pi) => (
                  <div key={p?.id ?? `empty-${ri}-${pi}`} className="contents">
                    <PreviewKitCard
                      player={p}
                      emptyLabel={layout[ri]?.position ?? '—'}
                      compact={compactCards}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function nflPreviewLayout(): RowLayout[] {
  return [
    { slots: 3, position: 'WR' },
    { slots: 1, position: 'TE' },
    { slots: 2, position: 'RB' },
    { slots: 1, position: 'QB' },
  ];
}

export function playerToPreviewCard(
  p: {
    id: string;
    name: string;
    club?: string;
    team?: string;
    position: string;
    points?: number;
    injuryStatus?: PreviewCardPlayer['injuryStatus'];
    opp?: string;
    adp?: number;
  },
  opts?: {
    price?: string;
    fixture?: string;
    badge?: 'C' | 'V';
    points?: number;
    isSelected?: boolean;
    onSelect?: () => void;
    onCaptain?: () => void;
    onViceCaptain?: () => void;
    onBench?: () => void;
  }
): PreviewCardPlayer {
  const club = p.club || p.team || 'NFL';
  let fixture = opts?.fixture;
  if (!fixture && p.opp) {
    const away = p.opp.startsWith('@');
    const oppTeam = away ? p.opp.replace('@', '').trim() : p.opp;
    fixture = `${oppTeam} (${away ? 'A' : 'H'})`;
  }
  return {
    id: p.id,
    name: p.name,
    club,
    position: p.position,
    price: opts?.price ?? (p.adp != null ? `£${Math.max(3.5, Math.min(12, p.adp * 1.1 + (p.points ?? 0) / 30)).toFixed(1)}m` : priceFromPoints(p.points ?? 0)),
    points: opts?.points ?? p.points,
    fixture: fixture ?? fixtureFromId(club, p.id),
    injuryStatus: p.injuryStatus,
    badge: opts?.badge,
    isSelected: opts?.isSelected,
    onSelect: opts?.onSelect,
    onCaptain: opts?.onCaptain,
    onViceCaptain: opts?.onViceCaptain,
    onBench: opts?.onBench,
  };
}

export function buildFormationRows(
  active: PreviewCardPlayer[],
  formation: string
): (PreviewCardPlayer | null)[][] {
  const parts = formation.split('-').map(Number).filter(n => !Number.isNaN(n));
  const def = parts[0] ?? 4;
  const mid = parts[1] ?? 4;
  const fwd = parts[2] ?? 2;
  const layout: RowLayout[] = [
    { slots: 1, position: 'GKP' },
    { slots: def, position: 'DEF' },
    { slots: mid, position: 'MID' },
    { slots: fwd, position: 'FWD' },
  ];
  return assignToRows(active, layout);
}
