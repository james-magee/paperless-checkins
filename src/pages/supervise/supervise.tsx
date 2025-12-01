import type { Manager } from "../../util/manager";
import { useEffect, useRef, useState } from "preact/hooks";
import { GamePanel } from "./games";

const SHOULD_LOG = true;
const log = (content: string) => {
  if (SHOULD_LOG) console.log(content);
};

type ManagerProps = {
  manager: Manager;
};

const Supervise = (props: ManagerProps) => {
  // not sure if it should be state or Ref.
  // const [playersSearchActive, setPlayersSearchActive] = useState();

  // REACT QUESTION:
  // when we do/don't involve state
  // should the Ref's actually be kept in their respective children....? Probably
  const [focusedPanel, setFocusedPanel] = useState<string | null>(null);

  // `TAB` to switch searches
  // useEffect(() => {
  //   log("running...");
  //   const handleTab = (event: KeyboardEvent) => {
  //     log(event.key);
  //     if (focusedPanel === null) return;
  //     if (event.key === "Tab") {
  //       event.preventDefault();
  //       if (focusedPanel === "games") {
  //         setFocusedPanel("players");
  //       } else if (focusedPanel === "players") {
  //         setFocusedPanel("games");
  //       }
  //     }
  //   };
  //   window.addEventListener("keydown", handleTab);
  //   return () => window.removeEventListener("keydown", handleTab);
  //   // this code needs to be "rewritten" every time focusedPanel changes
  // }, [focusedPanel]);

  return (
    <div id="supervising-container">
      {/*<PlayerPanel
        manager={props.manager}
        focused={focusedPanel === "players"}
        setFocused={() => setFocusedPanel("players")}
      />*/}
      <GamePanel
        manager={props.manager}
        focused={focusedPanel === "games"}
        setFocused={() => setFocusedPanel("games")}
      />
    </div>
  );
};

export default Supervise;
