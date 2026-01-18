import { gameA, gameB } from "./default";
import { similarity } from "./sim";
import type { Player, RawGameType } from "../types/game";
import { GameManager as Game } from "../types/game";

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
  findPlayers: (input: string) => Player[]; // not in use
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

// TODO:    maybe the threshold should change depend on the probable number of fields that
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
    if (query.length < 1) return [];
    try {
      const [time, tier, homeTeamName, awayTeamName] = query.split("  ");
      const game = timeGameMap.get(time);
      if (game !== undefined) {
        return game.filter(
          (g) =>
            g.home_team.name === homeTeamName &&
            g.away_team.name === awayTeamName &&
            g.home_team.tier === tier &&
            g.away_team.tier === tier,
        );
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
      .filter(([sim]): boolean => {
        if (sim >= 1.0) {
          threshold = 1.0;
          return true;
        } else {
          return sim > threshold;
        }
      })
      .sort(([s1, _], [s2, __]) => (s1 > s2 ? -1 : 1))
      .map(([, g]) => g)
      .sort((g1, g2) => (g1.play_time > g2.play_time ? 1 : -1))
      .map((g) => (console.log("RESULT OF SERACH: ", g), g));
  };
  return findGames;
};

const createManagerFromGames = (games: RawGameType[]): Manager => {
  const players = games
    .map((g) => g.home_team.players.concat(g.away_team.players))
    .flat(1);
  const gameManagers = games.map((g) => new Game(g));
  const findPlayers = findPlayersFactory(players);
  const findGames = findGamesFactory(gameManagers);
  return { findPlayers, findGames };
};

export const defaultManager = createManagerFromGames([gameA, gameB]);
