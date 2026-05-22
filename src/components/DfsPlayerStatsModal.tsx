import React from 'react';
import { X, Star, Plus } from 'lucide-react';
import {
  DfsFootballPlayer,
  PL_CLUB_NAMES,
  PL_CLUB_BG,
  footballPositionClass,
} from '../data/dfsFootballPool';

interface DfsPlayerStatsModalProps {
  selectedDfsPlayer: DfsFootballPlayer | null;
  onClose: () => void;
  dfsDraftedPlayers: { id: string }[];
  dfsQueueIds: string[];
  dfsActiveSeatIndex: number;
  handleToggleDfsQueue: (id: string) => void;
  handleDfsManualDraft: (player: DfsFootballPlayer) => void;
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
  const teamBg = PL_CLUB_BG[selectedDfsPlayer.team] || 'bg-slate-800 text-white';
  const teamFullName = PL_CLUB_NAMES[selectedDfsPlayer.team] || selectedDfsPlayer.team;

  const factor = selectedDfsPlayer.proj / 24;
  const goals = Math.max(0, Math.round((selectedDfsPlayer.position === 'FWD' ? 18 : selectedDfsPlayer.position === 'MID' ? 10 : 2) * factor));
  const assists = Math.max(0, Math.round((selectedDfsPlayer.position === 'MID' ? 8 : selectedDfsPlayer.position === 'FWD' ? 5 : 1) * factor));
  const cleanSheets = selectedDfsPlayer.position === 'GKP' || selectedDfsPlayer.position === 'DEF'
    ? Math.max(0, Math.round(12 * factor))
    : 0;
  const saves = selectedDfsPlayer.position === 'GKP' ? Math.max(0, Math.round(90 * factor)) : 0;

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className={`p-5 rounded-t-2xl ${teamBg}`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mb-2 ${footballPositionClass(selectedDfsPlayer.position)}`}>
                {selectedDfsPlayer.position}
              </span>
              <h3 className="text-2xl font-display font-bold text-white">{selectedDfsPlayer.name}</h3>
              <p className="text-sm opacity-90 mt-1">{teamFullName} · {selectedDfsPlayer.opp}</p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-black/20">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2 border-b border-white/10 pb-2">
            {(['news', 'stats', 'gamelog'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setDfsModalTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                  dfsModalTab === tab ? 'bg-brand-neon text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'news' ? 'News' : tab === 'stats' ? 'Season stats' : 'Gameweek log'}
              </button>
            ))}
          </div>

          {dfsModalTab === 'stats' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Proj pts</span>
                <span className="text-xl font-mono font-bold text-brand-neon">{selectedDfsPlayer.proj}</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Avg pts</span>
                <span className="text-xl font-mono font-bold text-white">{selectedDfsPlayer.avg}</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">ADP</span>
                <span className="text-xl font-mono font-bold text-white">{selectedDfsPlayer.adp}</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">FDR</span>
                <span className="text-xl font-mono font-bold text-amber-300">{selectedDfsPlayer.opRk}</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Goals</span>
                <span className="text-lg font-mono font-bold text-white">{goals}</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 uppercase block">Assists</span>
                <span className="text-lg font-mono font-bold text-white">{assists}</span>
              </div>
              {(selectedDfsPlayer.position === 'GKP' || selectedDfsPlayer.position === 'DEF') && (
                <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Clean sheets</span>
                  <span className="text-lg font-mono font-bold text-white">{cleanSheets}</span>
                </div>
              )}
              {selectedDfsPlayer.position === 'GKP' && (
                <div className="bg-black/30 rounded-lg p-3 border border-white/5 text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">Saves</span>
                  <span className="text-lg font-mono font-bold text-white">{saves}</span>
                </div>
              )}
            </div>
          )}

          {dfsModalTab === 'news' && (
            <div className="space-y-3">
              <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scout feed</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedDfsPlayer.name} is projected <strong className="text-brand-neon">{selectedDfsPlayer.proj} pts</strong> in{' '}
                {selectedDfsPlayer.opp}. Fixture difficulty ranked <strong>{selectedDfsPlayer.opRk}</strong> for {selectedDfsPlayer.position} assets.
              </p>
              <span className="text-[10px] font-mono text-[#f97316] font-bold uppercase tracking-wider">Premier League · Updated outlook</span>
            </div>
          )}

          {dfsModalTab === 'gamelog' && (
            <div className="space-y-2">
              {[selectedDfsPlayer.avg + 4, selectedDfsPlayer.avg, selectedDfsPlayer.avg - 2, selectedDfsPlayer.avg + 1, selectedDfsPlayer.proj].map((pts, i) => (
                <div key={i} className="flex justify-between text-xs bg-white/5 px-3 py-2 rounded-lg">
                  <span className="text-slate-400">GW {38 - i}</span>
                  <span className="font-mono font-bold text-brand-neon">{pts.toFixed(1)} pts</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleToggleDfsQueue(selectedDfsPlayer.id)}
              disabled={isDrafted || dfsActiveSeatIndex !== 3}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-bold disabled:opacity-40"
            >
              <Star className={`w-4 h-4 ${isQueued ? 'fill-amber-400' : ''}`} />
              {isQueued ? 'Queued' : 'Add to queue'}
            </button>
            <button
              type="button"
              onClick={() => handleDfsManualDraft(selectedDfsPlayer)}
              disabled={isDrafted || dfsActiveSeatIndex !== 3}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#ea580c] hover:bg-brand-neon text-white hover:text-black text-xs font-bold disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              Draft player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
