import type {
  Score,
  Player,
  Game,
  Team,
  Tier,
  RawGameType,
} from "../types/game";

export const defaultCsv = `student_number,     student_name,       waiver_signed,      team_name,      play_time,      comments,    signed_in
71716401,           Bobby Joe,          False,              C-rollers,      7:30,           mvp type shi,     false
73716401,           Another Joe,        True,               B-rollers,      7:30,           mvp type shi,     false
81816421,           Bobby Jane,         True,               C-rollers,      7:30,           mvp type shi,     false
72728401,           Sam Bigsam,         False,              Big-dawgs,      7:30,           mvp type shi,     false
`;

const mockPlayers: Player[] = [
  {
    id: "1",
    student_number: "8181001",
    student_name: "Test Subject",
    waiver_signed: true,
  },
  {
    id: "2",
    student_number: "7171001",
    student_name: "Alice Johnson",
    waiver_signed: true,
  },
  {
    id: "3",
    student_number: "7171002",
    student_name: "Ben Thompson",
    waiver_signed: false,
  },
  {
    id: "4",
    student_number: "7171003",
    student_name: "Catherine Li",
    waiver_signed: true,
  },
  {
    id: "5",
    student_number: "7171004",
    student_name: "David Kim",
    waiver_signed: true,
  },
  {
    id: "6",
    student_number: "7171005",
    student_name: "Emily Carter",
    waiver_signed: false,
  },
  {
    id: "7",
    student_number: "7171006",
    student_name: "Franklin Moore",
    waiver_signed: true,
  },
  {
    id: "8",
    student_number: "7171007",
    student_name: "Grace Nguyen",
    waiver_signed: true,
  },
  {
    id: "9",
    student_number: "7171008",
    student_name: "Henry Patel",
    waiver_signed: false,
  },
  {
    id: "10",
    student_number: "7171009",
    student_name: "Isabella Gomez",
    waiver_signed: true,
  },
  {
    id: "11",
    student_number: "7171010",
    student_name: "Jack Wilson",
    waiver_signed: true,
  },
  {
    id: "12",
    student_number: "7171011",
    student_name: "Katherine Brown",
    waiver_signed: false,
  },
  {
    id: "13",
    student_number: "7171012",
    student_name: "Liam Davis",
    waiver_signed: true,
  },
  {
    id: "14",
    student_number: "7171013",
    student_name: "Maria Rodriguez",
    waiver_signed: true,
  },
  {
    id: "15",
    student_number: "7171014",
    student_name: "Noah Anderson",
    waiver_signed: false,
  },
  {
    id: "16",
    student_number: "7171015",
    student_name: "Olivia Martinez",
    waiver_signed: true,
  },
  {
    id: "17",
    student_number: "7171016",
    student_name: "Paul Roberts",
    waiver_signed: false,
  },
  {
    id: "18",
    student_number: "7171017",
    student_name: "Quinn Stewart",
    waiver_signed: true,
  },
  {
    id: "19",
    student_number: "7171018",
    student_name: "Rachel Evans",
    waiver_signed: true,
  },
  {
    id: "20",
    student_number: "7171019",
    student_name: "Samuel Green",
    waiver_signed: false,
  },
  {
    id: "21",
    student_number: "7171020",
    student_name: "Tina Lewis",
    waiver_signed: true,
  },
];

export const mockTeamA: Team = {
  tier: "Mixed Tier 1" as Tier,
  name: "Crollers",
  players: mockPlayers.slice(0, 10),
};

export const mockTeamB: Team = {
  tier: "Mixed Tier 1" as Tier,
  name: "Brollers",
  players: mockPlayers.slice(10, 20),
};

export const gameA: RawGameType = {
  tier: "Mixed Tier 1",
  play_time: "7:30",
  field_name: "McInnes 1",
  home_team: mockTeamA,
  home_score: null,
  home_mvp: null,
  away_team: mockTeamB,
  away_score: null,
  away_mvp: null,
};

export const gameB: RawGameType = {
  tier: "Mixed Tier 1",
  play_time: "8:30",
  field_name: "McInnes 2",
  home_team: mockTeamB,
  home_score: null,
  home_mvp: null,
  away_team: mockTeamA,
  away_score: null,
  away_mvp: null,
};
