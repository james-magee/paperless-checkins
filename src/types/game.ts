import type { Manager } from "../util/manager";

export type Score = number | null;

export interface Player {
  id: string; // probably their student number
  student_number: string;
  student_name: string;
  waiver_signed: boolean;
}

export interface Team {
  tier: Tier;
  name: string;
  players: Player[];
}

export type Tier =
  | "Womens"
  | "Mixed Tier 1"
  | "Mixed2A"
  | "Mixed2B"
  | "Open1"
  | "Open2";

export interface Game {
  // Game Information
  id: string | null;
  tier: Tier;
  play_time: string;
  field_name: string;
  comments: string | null;

  // Home Team Information
  home_team: Team;
  home_players_signed_in: Player[];
  home_score: Score;
  home_mvp: Player | null;
  home_comments: string | null;

  // Away Team Information
  away_team: Team;
  away_players_signed_in: Player[];
  away_score: Score;
  away_mvp: Player | null;
  away_comments: string | null;
}

type OptionalComments = {
  comments?: string;
  home_comments?: string;
  away_comments?: string;
};

export type RawGameType = Omit<
  Game,
  | "id"
  | "comments"
  | "home_comments"
  | "away_comments"
  | "home_players_signed_in"
  | "away_players_signed_in"
> &
  OptionalComments;

const GAME_ID = (g: RawGameType) =>
  `${g.play_time} ${g.tier} ${g.home_team.name} ${g.away_team.name}`;

// exceptions
class PlayerNotFoundException extends Error {
  constructor(message: string) {
    super();
    this.cause = message;
  }
}

/**
 * Used to safely update parts of a Game; not used to load in game sheets, etc.
 */
export class GameManager implements Game {
  // Game Information
  id: string | null;
  tier: Tier;
  play_time: string;
  field_name: string;
  comments: string | null;

  // Home Team Information
  home_team: Team;
  home_players_signed_in: Player[];
  home_score: Score;
  home_mvp: Player | null;
  home_comments: string | null;

  // Away Team Information
  away_team: Team;
  away_players_signed_in: Player[];
  away_score: Score;
  away_mvp: Player | null;
  away_comments: string | null;

  constructor(gameObject: RawGameType) {
    this.id = GAME_ID(gameObject);
    this.tier = gameObject.tier;
    this.play_time = gameObject.play_time;
    this.field_name = gameObject.field_name;
    this.comments = gameObject.comments ?? null;

    this.home_team = gameObject.home_team;
    this.home_players_signed_in = [];
    this.home_score = gameObject.home_score;
    this.home_mvp = gameObject.home_mvp;
    this.home_comments = gameObject.home_comments ?? null;

    this.away_team = gameObject.away_team;
    this.away_players_signed_in = [];
    this.away_score = gameObject.away_score;
    this.away_mvp = gameObject.away_mvp;
    this.away_comments = gameObject.away_comments ?? null;
  }

  // Player Methods

  toggleWaiverSigned(whichTeam: "home" | "away", player: Player): boolean {
    // player may be a copy of the genuine player gameObject
    const ps =
      whichTeam === "home" ? this.home_team.players : this.away_team.players;
    const actualPlayer = ps.filter((p) => p.id === player.id)[0];
    actualPlayer.waiver_signed = !actualPlayer.waiver_signed;
    return actualPlayer.waiver_signed;
  }

  /**
   * Little reason to "uncheck-in" a player; just useful for testing.
   * @param player
   * @returns
   */
  toggleCheckedIn(player: Player): boolean {
    // TODO, rewrite with maximum efficiency; have a "clear" version and a "fast" version.
    // determine player's team (very low-cost O(n))
    if (this.home_team.players.some((p) => p.id === player.id)) {
      // more efficient removal check:
      // filter for players with non-matching IDs; if same length, add new player, else set equal to filtered.
      const othersSignedIn = this.home_players_signed_in.filter(
        (p) => p.id !== player.id,
      );
      if (othersSignedIn.length === this.home_players_signed_in.length) {
        this.home_players_signed_in.push(player);
        return true;
      } else {
        this.home_players_signed_in = othersSignedIn;
        return false;
      }
    } else if (this.away_team.players.some((p) => p.id === player.id)) {
      const othersSignedIn = this.away_players_signed_in.filter(
        (p) => p.id !== player.id,
      );
      if (othersSignedIn.length === this.away_players_signed_in.length) {
        this.away_players_signed_in.push(player);
        return true;
      } else {
        this.away_players_signed_in = othersSignedIn;
        return false;
      }
    }
    throw new PlayerNotFoundException(
      `player: ${player.id} not found at game ${this.id}`,
    );
  }

  addSignedInField(team: "home" | "away"): (Player & { signedIn: boolean })[] {
    const allPlayers =
      team === "home" ? this.home_team.players : this.away_team.players;
    const signedInPlayers =
      team === "home"
        ? this.home_players_signed_in
        : this.away_players_signed_in;
    const signedIn = new Set<string>(signedInPlayers.map((p) => p.id));
    return allPlayers.map((p) => ({ ...p, signedIn: signedIn.has(p.id) }));
  }
}
