import type { Player, Manager } from "../../util/manager";
import { useState, useEffect, useRef } from "preact/hooks";
import type { JSX, Ref } from "preact";
import "./players.css";

type ManagerProps = {
  manager: Manager;
};

export const PlayerPanel = ({
  manager,
  focused,
  setFocused,
}: {
  manager: Manager;
  focused: boolean;
  setFocused: () => void;
}) => {
  const [searchString, setSearchString] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(-1);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused) searchRef?.current?.focus();
  }, [focused]);

  useEffect(() => {
    const p = manager.findPlayers(searchString);
    setSelectedPlayerIndex(-1);
    setPlayers(p);
  }, [searchString]);

  // listen for keyboard events
  useEffect(() => {
    const handleDownArrow = () => {
      const newIndex = Math.min(selectedPlayerIndex + 1, players.length - 1);
      setSelectedPlayerIndex(newIndex);
    };

    const handleUpArrow = () => {
      const newIndex = Math.max(-1, selectedPlayerIndex - 1);
      setSelectedPlayerIndex(newIndex);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleDownArrow();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleUpArrow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPlayerIndex, players]);

  return (
    <div id="playerview-container">
      {/* search area */}
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
      {/* results area */}
      <div id="playerview-resultsarea">
        {players.map((p, index) => {
          if (selectedPlayerIndex === index) {
            return (
              <PlayerCard
                key={index}
                player={p}
                onClick={() => {
                  setSelectedPlayerIndex(index);
                }}
              />
            );
          }
          return (
            <PlayerCardPreview
              key={index}
              player={p}
              onClick={() => {
                setSelectedPlayerIndex(index);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const PlayerCardPreview = ({
  player,
  onClick,
}: {
  player: Player;
  onClick: () => void;
}) => {
  return (
    <div className="playercardpreview" onClick={onClick}>
      <div>{player.student_name}</div>
      <div>{player.student_number}</div>
      <div>{player.team_name}</div>
    </div>
  );
};

const PlayerCard = ({
  player,
  onClick,
}: {
  player: Player;
  onClick: () => void;
}) => {
  const [waiver, setWaiver] = useState(player.waiver_signed);
  const [signedIn, setSignedIn] = useState(player.signed_in);

  return (
    <div className="playercard" onClick={onClick}>
      {/* fixed column */}
      <div className="fixed-info">
        <Field title={"Name"} value={player.student_name} />
        <Field title={"StudentId"} value={player.student_name} />
        <Field title={"Team"} value={player.team_name} />
      </div>
      {/* editable column */}
      <div className="editable-info">
        <Checkbox
          label={"Waiver"}
          checked={waiver}
          toggle={() => {
            player.waiver_signed = !player.waiver_signed;
            setWaiver(player.waiver_signed);
          }}
        />
        <Checkbox
          label={"Signed In"}
          checked={signedIn}
          toggle={() => {
            player.signed_in = !player.signed_in;
            setSignedIn(player.signed_in);
          }}
        />
      </div>
    </div>
  );
};

const Field = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className="field">
      <div className="field-label">{title}</div>
      <div className="field-value">{value}</div>
    </div>
  );
};

const Checkbox = ({
  label,
  checked,
  toggle,
}: {
  label: string;
  checked: boolean;
  toggle: () => void;
}) => {
  return (
    <div className="checkbox">
      <div className="field-label">{label}</div>
      <div
        onClick={toggle}
        className={checked ? "waiverbox checked" : "waiverbox"}
      ></div>
    </div>
  );
};
