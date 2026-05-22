export type PremierLeagueTeam = {
  id: string;
  name: string;
  code: string;
  crestId: number;
  color: string;
};

export const PREMIER_LEAGUE_TEAMS: PremierLeagueTeam[] = [
  { id: 'arsenal', name: 'Arsenal', code: 'ARS', crestId: 57, color: '#EF0107' },
  { id: 'aston-villa', name: 'Aston Villa', code: 'AVL', crestId: 58, color: '#670E36' },
  { id: 'bournemouth', name: 'Bournemouth', code: 'BOU', crestId: 104, color: '#DA291C' },
  { id: 'brentford', name: 'Brentford', code: 'BRE', crestId: 402, color: '#E30613' },
  { id: 'brighton', name: 'Brighton', code: 'BHA', crestId: 397, color: '#0057B8' },
  { id: 'chelsea', name: 'Chelsea', code: 'CHE', crestId: 61, color: '#034694' },
  { id: 'crystal-palace', name: 'Crystal Palace', code: 'CRY', crestId: 354, color: '#1B458F' },
  { id: 'everton', name: 'Everton', code: 'EVE', crestId: 62, color: '#003399' },
  { id: 'fulham', name: 'Fulham', code: 'FUL', crestId: 63, color: '#FFFFFF' },
  { id: 'ipswich', name: 'Ipswich', code: 'IPS', crestId: 108, color: '#003399' },
  { id: 'leicester', name: 'Leicester', code: 'LEI', crestId: 338, color: '#003090' },
  { id: 'liverpool', name: 'Liverpool', code: 'LIV', crestId: 64, color: '#C8102E' },
  { id: 'man-city', name: 'Man City', code: 'MCI', crestId: 65, color: '#6CABDD' },
  { id: 'man-utd', name: 'Man Utd', code: 'MUN', crestId: 66, color: '#DA291C' },
  { id: 'newcastle', name: 'Newcastle', code: 'NEW', crestId: 67, color: '#241F20' },
  { id: 'nottm-forest', name: "Nott'm Forest", code: 'NFO', crestId: 351, color: '#DD0000' },
  { id: 'southampton', name: 'Southampton', code: 'SOU', crestId: 340, color: '#D71920' },
  { id: 'spurs', name: 'Spurs', code: 'TOT', crestId: 73, color: '#132257' },
  { id: 'west-ham', name: 'West Ham', code: 'WHU', crestId: 563, color: '#7A263A' },
  { id: 'wolves', name: 'Wolves', code: 'WOL', crestId: 76, color: '#FDB913' },
];

export function teamCrestUrl(crestId: number) {
  return `https://crests.football-data.org/${crestId}.png`;
}
