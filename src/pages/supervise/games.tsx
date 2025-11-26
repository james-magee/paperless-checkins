import type { Manager, Game, Team, Player } from "../../util/manager";
import { useState, useEffect, useRef } from "preact/hooks";
import type { JSX, RefObject } from "preact";
import "./games.css";
import { NumericalInput } from "../../components/Numerical";
import type React from "preact/compat";

// the game sheet will only be shown if there is a single result.
export const GamePanel = ({
  manager,
  focused,
  setFocused,
}: {
  manager: Manager;
  focused: boolean;
  setFocused: () => void;
}) => {
  const [searchString, setSearchString] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // TODO: implement the complicated "back-state" idea here

  useEffect(() => {
    if (focused) searchRef?.current?.focus();
  }, [focused]);

  useEffect(() => {
    setSearchResults(manager.findGames(searchString));
    // TODO: good learning moment -> the
    console.log("GAME RESULTS FROM: ", searchString, searchResults);
  }, [searchString]);

  const setResult = (g: Game) => {
    setSearchString(
      `${g.play_time} ${g.tier} ${g.home_team.name} ${g.away_team.name}`,
    );
  };

  return (
    <div id="gamepanel-container">
      {/* search */}
      <div className="search-container">
        <input
          onFocus={setFocused}
          ref={searchRef}
          type="text"
          onChange={(event: JSX.TargetedEvent<HTMLInputElement, Event>) =>
            setSearchString(event.currentTarget.value)
          }
          value={searchString}
        ></input>
      </div>
      {/* results or gamesheet */}
      {searchResults.length === 0 ? (
        <div></div>
      ) : searchResults.length === 1 ? (
        <GameSheet game={searchResults[0]} />
      ) : (
        <div id="game-previews">
          {searchResults.map((g) => (
            <GamePreview game={g} onClick={() => setResult(g)} />
          ))}
        </div>
      )}
    </div>
  );
};

const GamePreview = ({
  game,
  onClick,
}: {
  game: Game;
  onClick: () => void;
}) => {
  return (
    <div class="game-preview" onClick={onClick}>
      <div>{game.away_team.name}</div>
      <div>{game.home_team.name}</div>
      <div>{game.play_time}</div>
    </div>
  );
};

const GameSheet = ({ game }: { game: Game }) => {
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);

  const updateHomeScore = (score: number | null) => {
    game.home_score = score;
    setHomeScore(score);
  };

  const updateAwayScore = (score: number | null) => {
    game.away_score = score;
    setAwayScore(score);
  };

  return (
    <div class="game-sheet">
      <div class="teams">
        <TeamArea
          team={game.home_team}
          score={homeScore}
          updateScore={updateHomeScore}
        />
        <TeamArea
          team={game.away_team}
          score={awayScore}
          updateScore={updateAwayScore}
        />
      </div>
    </div>
  );
};

const TeamArea = ({
  team,
  score,
  updateScore,
}: {
  team: Team;
  score: number | null;
  updateScore: (score: number | null) => void;
}) => {
  // const playerRefMap = new Map<Player, RefObject<HTMLDivElement>>();
  // for (const player of team.players) {
  //   playerRefMap.set(player, useRef<HTMLDivElement>(null));
  // }

  // const togglePlayerSignedIn = (p: Player) => {
  //   p.signed_in = !p.signed_in;
  //   const ref = playerRefMap.get(p);
  //   const cstr = p.signed_in ? "waiverbox checked" : "waiverbox";
  //   ref!.current!.style = "background-color: black";
  //   console.log("HELLO?");
  //   console.log(ref);
  //   ref!.current!.base;
  //   ref!.current!.className = cstr;
  // };

  const playerSignInState = new Map();
  for (const player of team.players) {
    console.log("HERE");
    playerSignInState.set(player, useState<boolean>(player.signed_in));
  }

  const signedIn = (p: Player) => playerSignInState.get(p)[0];

  const handleSignInToggle = (p: Player) => {
    p.signed_in = !p.signed_in;
    const [_, setState] = playerSignInState.get(p);
    setState(p.signed_in);
  };

  // // multiple useEffects, or a single useEffect for all values?
  // useEffect(() => {

  // }, Array.from(playerSignInState.values()));

  return (
    <div class="team-panel">
      {/* header area */}
      <div>
        <span>Home Team</span>
        <span style={{ marginLeft: 10, fontWeight: 800 }}>{team.name}</span>
      </div>
      {/* table area */}
      <table class={"player-table"}>
        <thead>
          <tr>
            <th>{"Signed in"}</th>
            <th>{"Student Number"}</th>
            <th>{"Student Name"}</th>
            <th>{"Waiver Signed"}</th>
          </tr>
        </thead>
        <tbody>
          {team.players.map((p) => {
            return (
              <tr>
                <td style={{ display: "flex", flexDirection: "row" }}>
                  <span style={{ width: 25, marginRight: 5 }}>
                    {signedIn(p) ? "yes" : "no"}
                  </span>
                  <Checkbox
                    label=""
                    checked={signedIn(p)}
                    toggle={() => handleSignInToggle(p)}
                  />
                </td>
                <td>{p.student_number}</td>
                <td>{p.student_name}</td>
                <td>{p.waiver_signed ? "yes" : "no"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* score area */}
      <div>
        <NumericalInput value={score} setValue={updateScore} />
      </div>

      {/* comments area */}
    </div>
  );
};

const Checkbox = ({
  label,
  checked,
  toggle,
  ...props
}: {
  label: string;
  checked: boolean;
  toggle: () => void;
} & React.ComponentProps<"div">) => {
  return (
    <div className="checkbox">
      <div className="field-label">{label}</div>
      <div
        ref={props.ref}
        onClick={toggle}
        className={checked ? "waiverbox checked" : "waiverbox"}
      ></div>
    </div>
  );
};
