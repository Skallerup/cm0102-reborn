// Små linjeikoner til menuen (24×24, stroke = currentColor)
const P: Record<string, string> = {
  inbox: 'M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z',
  squad: 'M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M17 5.2a3 3 0 0 1 0 5.6M4 19v-1a3 3 0 0 1 2-2.8M7 5.2a3 3 0 0 0 0 5.6',
  tactics: 'M4 4h16v16H4zM4 12h16M12 4v16M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6',
  training: 'M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12',
  fixtures: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4M8 14h2M14 14h2M8 17h2',
  competitions: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4',
  transfers: 'M4 8h13l-3-3M20 16H7l3 3',
  scouting: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14M20 20l-4-4',
  assistant: 'M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z',
  staff: 'M9 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M12 14v3',
  finance: 'M12 3v18M16 7h-5.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H7',
  club: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z',
  ranking: 'M4 20v-7h5v7M9.5 20V6h5v14M15 20v-4h5v4M3 20h18',
  awards: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12M8.5 14l-1.5 7 5-3 5 3-1.5-7',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 3',
  jobs: 'M4 8h16v11H4zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16',
  options: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  save: 'M5 3h11l3 3v15H5zM8 3v5h7V3M8 21v-7h8v7',
  quit: 'M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10',
};

export function Icon({ name }: { name: string }) {
  const d = P[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
