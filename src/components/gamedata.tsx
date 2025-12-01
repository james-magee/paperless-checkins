import { useReducer } from "preact/hooks";
import type { Game } from "../util/manager";

// reducer logic
const gameReducer = (state, action) => {
  //
};

const teamReducer = (state, action) => {
  //
};

const GameData = ({
  initialGameData,
  children,
}: {
  initialGameData: Game[];
  children: React.ReactNode;
}) => {
  const [gamesState, gamesDispatch] = useReducer(gameReducer, initialGameData);
  const [teamsState, teamsDispatch] = useReducer(teamReducer, initialGameData);
  // Example
  // `dispatch({ teamsId: 1, type: "checkIn})

  return <>{children}</>;
};
