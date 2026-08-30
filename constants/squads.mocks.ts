import { Squad } from "@/components/squad-card";

// ── Squad detail types ────────────────────────────────────────────────────────

export enum AttendanceStatus {
  Going    = 'going',
  Maybe    = 'maybe',
  NotGoing = 'not_going',
}

export interface SquadPlayer {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  overall: number;
  attendance: AttendanceStatus;
  isCaptain?: boolean;
  userId: string | null;
  hasAccount: boolean;
  status: 'pending' | 'accepted';
}

export interface SquadDetail {
  squadId: string;
  nextMatchDate: string;
  players: SquadPlayer[];
}

export const SQUAD_DETAIL_MOCK: SquadDetail = {
  squadId: '1',
  nextMatchDate: '2026-05-31',
  players: [
    { id: 'p0',  firstName: 'Filip',   lastName: 'Prudant', number: 1, overall: 50, attendance: AttendanceStatus.Maybe, userId: null, hasAccount: false, status: 'accepted' },
    { id: 'p5',  firstName: 'Seba',    lastName: 'Araya',   number: 2, overall: 50, attendance: AttendanceStatus.Going, userId: null, hasAccount: false, status: 'accepted' },
    { id: 'p2',  firstName: 'Jose',    lastName: 'Guerra',  number: 3, overall: 50, attendance: AttendanceStatus.Going, userId: null, hasAccount: false, status: 'accepted' },
    { id: 'p3',  firstName: 'Jacob',   lastName: 'Guerra',  number: 3, overall: 50, attendance: AttendanceStatus.Going, userId: null, hasAccount: false, status: 'accepted' },
    { id: 'p1',  firstName: 'Joaquín', lastName: 'Lopez',   number: 9, overall: 50, attendance: AttendanceStatus.Going, userId: null, hasAccount: false, status: 'accepted' },
  ],
};

// ── Squad list mocks ──────────────────────────────────────────────────────────

export const MY_SQUADS: Squad[] = [
  {
    id: '1',
    name: 'Los Baljeetles',
    playerCount: 12,
    role: 'Capitán',
    captainName: 'N. Baljeet',
    createdYear: 2022,
    color: '#1A7A3C',
    played: 30,
    drawn: 1,
    lost: 28,
    winRate: 1,
    recentForm: ['W', 'D', 'L', 'L', 'L'],
  },
  {
    id: '2',
    name: 'Los Tigres',
    playerCount: 9,
    role: 'Jugador',
    captainName: 'M. García',
    createdYear: 2021,
    color: '#D4A017',
    played: 10,
    drawn: 2,
    lost: 4,
    winRate: 40,
    recentForm: ['L', 'W', 'L', 'D', 'W'],
  },
];

export const ALL_SQUADS = [...MY_SQUADS];
