import type { Manager } from "../../util/manager";
import type { Game, Team, Player, Tier } from "../../types/game";
import { GameManager } from "../../types/game";
import { useState, useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact";
import "./games.css";
import { NumericalInput } from "../../components/Numerical";
import { CommentBox } from "../../components/comment-box/CommentBox";
import { DynamicTable } from "../../components/dynam-table/DynamicTable";
import type {
  AllowedFieldType,
  TabularData,
  TabularField,
} from "../../components/dynam-table/DynamicTable";

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
  const [searchResults, setSearchResults] = useState<GameManager[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused) searchRef?.current?.focus();
  }, [focused]);

  // useEffect(() => {
  //   window.addEventListener("keydown", runSearchHandler);
  //   return () => window.removeEventListener("keydown", runSearchHandler);
  // }, [searchString]);

  // const runSearchHandler = (event: KeyboardEvent) => {
  //   if (event.key !== "Enter") return;
  //   setSearchResults(manager.findGames(searchString));
  // };

  const setResult = (g: Game) => {
    const searchString = `${g.play_time}  ${g.tier}  ${g.home_team.name}  ${g.away_team.name}`;
    // we don't necessarily need to do this
    // setSearchString(searchString);
    setSearchResults(manager.findGames(searchString));
  };

  return (
    <div id="gamepanel-container">
      {/* search */}
      <div className="search-container">
        <input
          onFocus={setFocused}
          ref={searchRef}
          type="text"
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key !== "Enter") return;
            setSearchResults(manager.findGames(searchString));
          }}
          onChange={(event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
            setSearchString(event.currentTarget.value);
          }}
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
  game: GameManager;
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

const GameSheet = ({ game }: { game: GameManager }) => {
  const [homeScore, setHomeScore] = useState<number | null>(null);
  const [awayScore, setAwayScore] = useState<number | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team>(game.home_team);
  const [awayTeam, setAwayTeam] = useState<Team>(game.away_team);

  useEffect(() => {
    setHomeScore(game.home_score);
    setAwayScore(game.away_score);
    setHomeTeam(game.home_team);
    setAwayTeam(game.away_team);
  }, [game]);

  const updateHomeScore = (score: number | null) => {
    game.home_score = score ?? -1;
    setHomeScore(score);
  };

  const updateAwayScore = (score: number | null) => {
    game.away_score = score ?? -1;
    setAwayScore(score);
  };

  return (
    <div class="game-sheet">
      {/* game information */}
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "row",
          justifyContent: "left",
        }}
      >
        <GameInformation game={game} />
      </div>
      {/* teams data entry */}
      <div class="teams">
        <TeamArea
          gameManager={game}
          team={homeTeam}
          whichTeam="home"
          score={homeScore}
          updateScore={updateHomeScore}
        />
        <TeamArea
          gameManager={game}
          team={awayTeam}
          whichTeam="away"
          score={awayScore}
          updateScore={updateAwayScore}
        />
      </div>
    </div>
  );
};

const TeamArea = ({
  gameManager,
  whichTeam,
  team,
  score,
  updateScore,
}: {
  gameManager: GameManager;
  whichTeam: "home" | "away";
  team: Team;
  score: number | null;
  updateScore: (score: number | null) => void;
}) => {
  const teamRef = useRef<Team>(team);
  const [localPlayers, setLocalplayers] = useState<
    (Player & { signedIn: boolean })[]
  >(gameManager.addSignedInField(whichTeam));

  // CommentBox state
  const [comments, setComments] =
    whichTeam === "home"
      ? useState(gameManager.home_comments)
      : useState(gameManager.away_comments);
  const updateComments = (content: string) => {
    if (whichTeam === "home") {
      gameManager.home_comments = content;
    } else {
      gameManager.away_comments = content;
    }
    setComments(content);
  };

  // change state whenever the game changes
  useEffect(() => {
    if (team != teamRef.current) {
      setLocalplayers(gameManager.addSignedInField(whichTeam));
    }

    if (team != teamRef.current) {
      if (whichTeam === "home") {
        setComments(gameManager.home_comments ?? "");
      } else {
        setComments(gameManager.away_comments ?? "");
      }
    }

    teamRef.current = team;
  }, [team]);

  // reactful variant
  const dataUpdater = (
    index: number,
    field: TabularField,
    entry: AllowedFieldType,
  ) => {
    debugger;

    if (entry === "") entry = null;
    const newLocalPlayers = [
      ...localPlayers.slice(0, index),
      { ...localPlayers[index], [field.name]: entry },
      ...localPlayers.slice(index + 1),
    ];
    gameManager.update(whichTeam, newLocalPlayers);
    setLocalplayers(newLocalPlayers);
  };

  const dataAdder = (addedData: TabularData) => {
    const newPlayer = addedData as unknown as Player & { signedIn: boolean };
    const newLocalPlayers = [...localPlayers, newPlayer];
    gameManager.update(whichTeam, newLocalPlayers);
    setLocalplayers(newLocalPlayers);
  };

  return (
    <div class="team-panel">
      {/* header area */}
      <div>
        <span>{whichTeam === "home" ? "Home Team" : "Away Team"}</span>
        <span style={{ marginLeft: 10, fontWeight: 800 }}>{team.name}</span>
      </div>

      {/* table area */}
      <DynamicTable
        dataAdd={dataAdder}
        dataUpdate={dataUpdater}
        fields={[
          {
            name: "signedIn",
            headerLabel: "Signed In",
            type: "boolean",
            editable: true,
          },
          {
            name: "student_number",
            headerLabel: "Student Number",
            type: "string",
            editable: true,
          },
          {
            name: "student_name",
            headerLabel: "Student Name",
            type: "string",
            editable: true,
          },
          {
            name: "waiver_signed",
            headerLabel: "Waiver",
            type: "boolean",
            editable: true,
          },
        ]}
        data={localPlayers}
      />

      {/*<table class={"player-table"} style={{ zIndex: 10 }}>
        <thead>
          <tr>
            <th>{"Signed in"}</th>
            <th>{"Student Number"}</th>
            <th>{"Student Name"}</th>
            <th>{"Waiver"}</th>
          </tr>
        </thead>
        <tbody>
          {localPlayers.map((p) => {
            return (
              <tr>
                <td style={{ display: "flex", flexDirection: "row" }}>
                  <span style={{ width: 25, marginRight: 5 }}>
                    {p.signedIn ? "yes" : "no"}
                  </span>
                  <Checkbox
                    label=""
                    checked={p.signedIn}
                    toggle={() => togglePlayerSignIn(p)}
                  />
                </td>
                <td>{p.student_number}</td>
                <td>{p.student_name}</td>
                <td style={{ display: "flex", flexDirection: "row" }}>
                  <span style={{ width: 25, marginRight: 5 }}>
                    {p.waiver_signed ? "yes" : "no"}
                  </span>
                  <Checkbox
                    label=""
                    checked={p.waiver_signed}
                    toggle={() => togglePlayerWaiver(p)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {addingNewPlayer && (
        <table
          style={{
            backgroundColor: "lightblue",
            zIndex: 2,
            marginTop: -24,
            paddingTop: 5,
          }}
          class={"player-table"}
        >
          <thead style={{ height: 0.5, opacity: 0 }}>
            <th>{"Signed in"}</th>
            <th>{"Student Number"}</th>
            <th>{"Student Name"}</th>
            <th>{"Waiver"}</th>
          </thead>
          <tbody>
            <NewPlayerRow />
          </tbody>
        </table>
      )}*/}

      {/* add-player btn */}
      {/*<div style={{ opacity: addingNewPlayer ? 0.2 : 1 }}>
        <AddPlayerButton
          disabled={!addingNewPlayer}
          onClick={beginAddNewPlayer}
        />
      </div>*/}

      {/* score area */}
      <div style={{ marginTop: 10 }}>
        <div>Score</div>
        <NumericalInput currentValue={score} updateValue={updateScore} />
      </div>

      {/* comments area */}
      <div style={{ marginTop: 10 }}>
        <div>Comments</div>
        <CommentBox
          content={comments ?? ""}
          onChange={updateComments}
          placeholder="here"
        />
      </div>
    </div>
  );
};

const GameInformation = ({ game }: { game: Game }) => {
  return (
    <div class="game-info">
      <div style={{ fontWeight: 500 }}>Game Information</div>
      <table>
        <thead></thead>
        <tbody>
          <tr>
            <td>Time:</td>
            <td>
              <i style={{ marginLeft: 10, color: "navy", fontWeight: 600 }}>
                {game.play_time}
              </i>
            </td>
          </tr>
          <tr>
            <td>Tier:</td>
            <td>
              <i style={{ marginLeft: 10, color: "navy", fontWeight: 600 }}>
                {game.tier}
              </i>
            </td>
          </tr>
          <tr>
            <td>Home:</td>
            <td>
              <i style={{ marginLeft: 10, color: "navy", fontWeight: 600 }}>
                {game.home_team.name}
              </i>
            </td>
          </tr>
          <tr>
            <td>Away:</td>
            <td>
              <i style={{ marginLeft: 10, color: "navy", fontWeight: 600 }}>
                {game.away_team.name}
              </i>
            </td>
          </tr>
          <tr>
            <td>Location:</td>
            <td>
              <i style={{ marginLeft: 10, color: "navy", fontWeight: 600 }}>
                {game.field_name}
              </i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
