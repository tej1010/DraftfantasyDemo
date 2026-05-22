export interface DfsScheduleMatch {
  id: string;
  day: 1 | 2 | 3;
  dayLabel: string;
  kickoff: string;
  teamA: string;
  teamB: string;
  isUserMatch: boolean;
  userOpponent: string | null;
  status: 'Upcoming' | 'Live' | 'Completed';
}

const DAY_META: { day: 1 | 2 | 3; label: string; kickoff: string }[] = [
  { day: 1, label: 'Friday · Day 1', kickoff: 'Fri 7:00 PM CDT' },
  { day: 2, label: 'Saturday · Day 2', kickoff: 'Sat 1:00 PM CDT' },
  { day: 3, label: 'Sunday · Day 3', kickoff: 'Sun 4:25 PM CDT' },
];

export function buildDfsTournamentSchedule(userName: string): DfsScheduleMatch[] {
  const u = userName || 'You';
  const rounds: { day: 1 | 2 | 3; a: string; b: string }[] = [
    { day: 1, a: u, b: 'BotAlpha' },
    { day: 1, a: 'BotBeta', b: 'BotGamma' },
    { day: 2, a: u, b: 'BotBeta' },
    { day: 2, a: 'BotAlpha', b: 'BotGamma' },
    { day: 3, a: u, b: 'BotGamma' },
    { day: 3, a: 'BotAlpha', b: 'BotBeta' },
  ];

  return rounds.map((r, idx) => {
    const meta = DAY_META.find(d => d.day === r.day)!;
    const isUserMatch = r.a === u || r.b === u;
    const userOpponent = isUserMatch ? (r.a === u ? r.b : r.a) : null;
    const status: DfsScheduleMatch['status'] = r.day === 1 ? 'Live' : 'Upcoming';

    return {
      id: `sched-${idx + 1}`,
      day: r.day,
      dayLabel: meta.label,
      kickoff: meta.kickoff,
      teamA: r.a,
      teamB: r.b,
      isUserMatch,
      userOpponent,
      status,
    };
  });
}

export function formatScheduleForShare(contestTitle: string, userName: string, matches: DfsScheduleMatch[]): string {
  const lines: string[] = [
    `🏆 ${contestTitle}`,
    `Manager: ${userName}`,
    `Tournament Schedule — Head-to-Head Matchups`,
    '',
  ];

  let lastDay = 0;
  for (const m of matches) {
    if (m.day !== lastDay) {
      lastDay = m.day;
      lines.push(`${m.dayLabel} (${m.kickoff})`);
    }
    const youTag = m.isUserMatch ? ' ← YOUR MATCH' : '';
    lines.push(`  • ${m.teamA} vs ${m.teamB}${youTag}`);
  }

  lines.push('');
  lines.push('Complete bracket (6 matchups · 4 managers):');
  matches.forEach((m, i) => {
    lines.push(`${i + 1}. ${m.teamA} vs ${m.teamB}`);
  });

  return lines.join('\n');
}

export function getUserScheduleSummary(matches: DfsScheduleMatch[], userName: string) {
  const userMatches = matches.filter(m => m.isUserMatch);
  return userMatches.map(m => ({
    day: m.dayLabel,
    opponent: m.userOpponent,
    kickoff: m.kickoff,
    status: m.status,
  }));
}
