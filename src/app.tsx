import { useState } from "preact/hooks";
import "./app.css";
import type { Manager } from "./util/manager";
import {
  defaultManager,
  // isPlayer,
  // isPlayerArray,
} from "./util/manager";
import { csvParse } from "./util/csvparse";
import { defaultCsv } from "./util/default.ts";
import Supervise from "./pages/supervise/supervise.tsx";
import Start from "./pages/temp.tsx";
import { DynamicTable } from "./components/dynam-table/DynamicTable.tsx";
import { Test } from "./components/dynam-table/Demo.tsx";

const PAGES = {
  START: "start",
  LOOKUP: "lookup",
  SUPERVISE: "supervise",
  TEMP: "temp",
};

export function App() {
  const [page, setPage] = useState(PAGES.SUPERVISE);
  const [manager, setManager] = useState<Manager>(defaultManager);
  const csvLoad = (parsed: any) => {
    // setManager(createManager(isPlayerArray(parsed) ? parsed : []));
    setPage(PAGES.SUPERVISE);
  };
  return (
    <div id="app-container">
      {page === PAGES.SUPERVISE && <Supervise manager={manager} />}
      {page === PAGES.START && <Start csvLoad={csvLoad} />}
      {page === PAGES.TEMP && <Test />}
      {/*{page === PAGES.LOOKUP && <Lookup csvLoad={csvLoad} />}*/}
    </div>
  );
}
