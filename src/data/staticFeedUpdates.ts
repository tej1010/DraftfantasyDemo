import { Notification } from '../types';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const STATIC_FEED_UPDATES: Notification[] = [
  {
    id: 'feed-welcome',
    title: 'Welcome to Draft Fantasy!',
    message: 'Static demo mode — all data runs in the browser. Explore the dashboard, draft room, and waiver hub.',
    type: 'System',
    timestamp: hoursAgo(48),
    read: true,
  },
  {
    id: 'feed-gw-sim',
    title: 'Gameweek 1 fixtures locked',
    message: 'Head-to-head matchups are live in the Matchups tab. Run “Simulate GW” from My Squad to score your lineup.',
    type: 'Matchup',
    timestamp: hoursAgo(22),
    read: false,
  },
  {
    id: 'feed-waiver-priority',
    title: 'Waiver priority refreshed',
    message: 'Reverse standings order updated. Gegenpress City holds #1 priority — submit claims before processing.',
    type: 'Waiver',
    timestamp: hoursAgo(14),
    read: false,
  },
  {
    id: 'feed-fwwb-window',
    title: 'FWWB auction window open',
    message: 'Blind bids close Friday 21:00 GMT. You have $72 remaining in your Free Waiver Wire Budget pool.',
    type: 'Waiver',
    timestamp: hoursAgo(10),
    read: false,
  },
  {
    id: 'feed-injury-saka',
    title: 'Injury watch: Bukayo Saka',
    message: 'Arsenal report Saka completed full training — expected to start vs Brighton. Monitor before locking captain.',
    type: 'Injury',
    timestamp: hoursAgo(8),
    read: false,
  },
  {
    id: 'feed-draft-queue',
    title: 'Snake draft queue update',
    message: 'Premier Exhibition League draft order confirmed. Host can start the live room when all four seats are filled.',
    type: 'Draft',
    timestamp: hoursAgo(6),
    read: false,
  },
  {
    id: 'feed-transfer-isak',
    title: 'Transfer buzz: Alexander Isak',
    message: 'Scout wire lists Isak as top FWWB target ($28 avg winning bid). Only one manager can own him in this league.',
    type: 'Waiver',
    timestamp: hoursAgo(4),
    read: false,
  },
  {
    id: 'feed-h2h-reminder',
    title: 'H2H reminder: Tejpal FC vs Tiki Taka',
    message: 'Your next fixture kicks off Saturday 15:00 at Anfield (demo). Set 4-4-2 or switch formation in Tactical Squad.',
    type: 'Matchup',
    timestamp: hoursAgo(2),
    read: false,
  },
  {
    id: 'feed-db-update',
    title: 'Player database updated',
    message: 'Six new Premier League profiles added — Rice, Neto, Guimarães, Semenyo, Chalobah, and Wissa now searchable.',
    type: 'System',
    timestamp: hoursAgo(1),
    read: false,
  },
];
