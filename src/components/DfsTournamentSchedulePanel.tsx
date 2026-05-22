import React, { useMemo, useState } from 'react';
import { Calendar, Share2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  buildDfsTournamentSchedule,
  formatScheduleForShare,
  getUserScheduleSummary,
  DfsScheduleMatch,
} from '../utils/dfsTournamentSchedule';

interface DfsTournamentSchedulePanelProps {
  contestTitle: string;
  userName: string;
  showSchedule: boolean;
  onToggleSchedule: () => void;
  onShareToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function DfsTournamentSchedulePanel({
  contestTitle,
  userName,
  showSchedule,
  onToggleSchedule,
  onShareToast,
}: DfsTournamentSchedulePanelProps) {
  const [copied, setCopied] = useState(false);
  const matches = useMemo(() => buildDfsTournamentSchedule(userName), [userName]);
  const userSummary = useMemo(() => getUserScheduleSummary(matches, userName), [matches, userName]);
  const shareText = useMemo(
    () => formatScheduleForShare(contestTitle, userName, matches),
    [contestTitle, userName, matches]
  );

  const notify = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    onShareToast?.(msg, type);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      notify('Full schedule copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('Could not copy schedule. Try again.', 'error');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${contestTitle} — Schedule`,
          text: shareText,
        });
        notify('Schedule shared!', 'success');
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    handleCopy();
  };

  const matchesByDay = useMemo(() => {
    const map = new Map<number, DfsScheduleMatch[]>();
    matches.forEach(m => {
      const list = map.get(m.day) || [];
      list.push(m);
      map.set(m.day, list);
    });
    return map;
  }, [matches]);

  return (
    <div className="border-t border-white/10 bg-[#0b0f19]">
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onToggleSchedule}
          className="flex items-center gap-2 text-sm font-display font-black text-white uppercase tracking-wider hover:text-brand-neon transition"
        >
          <Calendar className="w-4 h-4 text-brand-neon" />
          Show Schedule
          {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showSchedule && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-neon" /> : <Copy className="w-3.5 h-3.5" />}
              Copy List
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-purple-600 text-xs font-bold text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Schedule
            </button>
          </div>
        )}
      </div>

      {showSchedule && (
        <div className="px-4 pb-5 space-y-4">
          <div className="rounded-xl border border-brand-neon/25 bg-brand-neon/5 p-3">
            <p className="text-[10px] font-mono uppercase text-brand-neon font-bold tracking-wider mb-2">
              Your matchups ({userName})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {userSummary.map((s, i) => (
                <div key={i} className="bg-black/30 rounded-lg px-3 py-2 border border-white/10">
                  <p className="text-[10px] text-slate-400">{s.day}</p>
                  <p className="text-sm font-bold text-white">
                    vs <span className="text-brand-neon">{s.opponent}</span>
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">{s.kickoff}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-[#111827] px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Complete tournament schedule
              </span>
              <span className="text-[10px] font-mono text-slate-500">{matches.length} H2H fixtures</span>
            </div>

            {[1, 2, 3].map(day => {
              const dayMatches = matchesByDay.get(day) || [];
              if (dayMatches.length === 0) return null;
              return (
                <div key={day} className="border-b border-white/5 last:border-b-0">
                  <div className="px-3 py-1.5 bg-black/40 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {dayMatches[0].dayLabel} · {dayMatches[0].kickoff}
                  </div>
                  {dayMatches.map(m => (
                    <div
                      key={m.id}
                      className={`px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 ${
                        m.isUserMatch ? 'bg-brand-purple/10 border-l-2 border-brand-neon' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-white shrink-0">{m.teamA}</span>
                        <span className="text-[10px] font-mono text-slate-500">vs</span>
                        <span className="text-xs font-bold text-white shrink-0">{m.teamB}</span>
                        {m.isUserMatch && (
                          <span className="text-[8px] font-black uppercase bg-brand-neon text-black px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          m.status === 'Live'
                            ? 'bg-red-500/15 text-red-400 animate-pulse'
                            : m.status === 'Completed'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <pre className="hidden md:block text-[10px] font-mono text-slate-500 bg-black/40 rounded-lg p-3 border border-white/5 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {shareText}
          </pre>
        </div>
      )}
    </div>
  );
}
