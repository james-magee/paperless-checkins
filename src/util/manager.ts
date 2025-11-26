import { gameA, gameB } from "./default";
import { similarity } from "./sim";

type Tier = "Womens" | "Mixed1" | "Mixed2A" | "Mixed2B" | "Open1" | "Open2";
type Score = number | null;

// players might be duplicated a few times if they play on multiple teams
// which isn't an issue
// - in a very space-efficient relation database, we'd probably have a table for unique players
//   and a player_team column that links the player and team, but this isn't necessary here.
export interface Player {
  student_number: string;
  student_name: string;
  waiver_signed: boolean;
  team_name: string;
  team_tier: string;
  team_id: string;
  signed_in: boolean;
}

export interface Team {
  tier?: Tier;
  name: string;
  players: Player[];
}

export interface Game {
  tier: Tier;
  play_time: string;
  field_name: string;
  home_team: Team;
  home_score: Score;
  home_mvp: Player | null;
  away_team: Team;
  away_score: Score;
  away_mvp: Player | null;

  id: string;
}

const GAME_ID = (g: Game | Omit<Game, "id">) =>
  `${g.play_time} ${g.tier} ${g.home_team} ${g.away_team}`;

export const isPlayer = (o: any): o is Player => {
  // TODO: change to team_id
  return (
    o &&
    o.student_number &&
    o.student_name &&
    o.team_name &&
    o.play_time &&
    o.waiver_signed !== undefined
  );
};

export const isPlayerArray = (o: any[]): o is Player[] => {
  const result = o.every((o) => isPlayer(o));
  console.log(result);
  return result;
};

export interface Manager {
  findPlayers: (input: string) => Player[];
  findGames: (input: string) => Game[];
}

const findPlayersFactory = (
  players: Player[],
): ((searchStr: string) => Player[]) => {
  const findPlayers = (searchStr: string): Player[] => {
    searchStr = searchStr.toLowerCase();
    if (searchStr.length <= 0) return [];
    const matches = new Set<Player>();
    // find players based on id
    players
      .filter((p) =>
        String(p.student_number).toLowerCase().startsWith(searchStr),
      )
      .forEach((p) => {
        console.log(p);
        matches.add(p);
      });
    // find players based on partial name matches
    const anyNameMatch = (p: Player) =>
      p.student_name
        .split(" ")
        .map((n) => n.toLowerCase())
        .some((n) => n.startsWith(searchStr));
    const fullNameMatch = (p: Player) =>
      p.student_name.toLowerCase().startsWith(searchStr);
    players
      .filter((p) => anyNameMatch(p) || fullNameMatch(p))
      .forEach((p) => {
        console.log(p);
        matches.add(p);
      });
    return Array.from(matches);
  };
  return findPlayers;
};

// THOUGHT: maybe the threshold should change depend on the probable number of fields that
//          are being entered.
const findGamesFactory = (
  games: Game[],
  threshold: number = 0.01,
): ((query: string) => Game[]) => {
  // convert objects to strings
  const stringify = (game: Game): string =>
    `${game.home_team.name} ${game.away_team.name} ${game.play_time}`.toLowerCase();
  const strings: [string, Game][] = games.map((g: Game) => [stringify(g), g]);

  // O(1) lookups
  const timeGameMap = new Map<string, Game[]>();
  games.forEach((g) => {
    if (!timeGameMap.has(g.play_time))
      timeGameMap.set(g.play_time, new Array());
    timeGameMap.get(g.play_time)?.push(g);
  });

  const findGames = (query: string): Game[] => {
    // first, check if it is a formal search up
    if (query.length < 1) return [];

    try {
      const [time, tier, homeTeamName, awayTeamName] = query.split(" ");
      if (timeGameMap.has(time)) {
        const res = timeGameMap
          ?.get(time)
          ?.filter(
            (g) =>
              g.home_team.name === homeTeamName &&
              g.away_team.name === awayTeamName &&
              g.home_team.tier === tier &&
              g.away_team.tier === tier,
          );
        if (res!.length > 1) {
          console.log("Shouldn't have duplicate games...");
        }
        if (res!.length === 1) {
          return res!;
        }
      }
    } catch {}

    query = query.toLowerCase();
    return strings
      .map(([s, g]): [number, Game] => [similarity(s, query), g])
      .map(
        ([s, g]): [number, Game] => (
          console.log(s, g.away_team.name, g.home_team.name),
          [s, g]
        ),
      )
      .filter(([sim]): boolean => sim > threshold)
      .sort(([s1, _], [s2, __]) => (s1 > s2 ? -1 : 1))
      .map(([, g]) => g)
      .sort((g1, g2) => (g1.play_time > g2.play_time ? 1 : -1))
      .map((g) => (console.log("RESULT OF SERACH: ", g), g));
  };
  return findGames;
};

// const findGamesFactory = (games: Game[]): ((searchStr: string) => Game[]) => {
//   const findGames = (searchStr: string): Game[] => {
//     if (searchStr.length <= 0) return [];
//     searchStr = searchStr.toLowerCase();
//     const matchingGames = new Set<Game>();
//     // find games by home team
//     const stendsWith = (s: string) =>
//       s.startsWith(searchStr) || s.endsWith(searchStr);
//     games
//       .filter((g) => stendsWith(g.home_team.name.toLowerCase()))
//       .forEach((g) => matchingGames.add(g));
//
//     // find games by away team
//     games
//       .filter((g) => stendsWith(g.away_team.name.toLowerCase()))
//       .forEach((g) => matchingGames.add(g));
//     return Array.from(matchingGames);
//   };
//   return findGames;
// };

export const createManagerFromSheet = (sheet: Player[]): Manager => {
  const players = sheet !== null ? sheet : [];
  const findPlayers = findPlayersFactory(players);
  return { findPlayers };
};

const createManagerFromGames = (games: Omit<Game, "id">[]): Manager => {
  const players = games
    .map((g) => g.home_team.players.concat(g.away_team.players))
    .flat(1);
  const gamesWithId = games.map((g) => ({ ...g, id: GAME_ID(g) }));
  const findPlayers = findPlayersFactory(players);
  const findGames = findGamesFactory(gamesWithId);
  return { findPlayers, findGames };
};

export const defaultManager = createManagerFromGames([gameA, gameB]);
