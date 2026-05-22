import React, { useState } from 'react';
import { PREMIER_LEAGUE_TEAMS, teamCrestUrl } from '../data/premierLeagueTeams';

function TeamCrest({ crestId, code, color }: { crestId: number; code: string; color: string }) {
  const [failed, setFailed] = useState(false);
  const src = teamCrestUrl(crestId);

  if (failed) {
    return (
      <span
        className="league-hero-logo-fallback"
        style={{ background: color }}
      >
        {code}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="league-hero-logo-img"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function PremierLeagueLogosBackdrop() {
  return (
    <div className="league-hero-logos-backdrop" aria-hidden>
      <div className="league-hero-logos-mask" />
      <div className="league-hero-logos-grid">
        {PREMIER_LEAGUE_TEAMS.map((team, i) => (
          <div
            key={team.id}
            className="league-hero-logo-cell"
            style={{ ['--logo-i' as string]: i }}
          >
            <TeamCrest crestId={team.crestId} code={team.code} color={team.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
