import { useState } from "preact/hooks";
import "./app.css";
import type { Manager } from "./util/manager";
import {
  createManagerFromSheet as createManager,
  defaultManager,
  isPlayer,
  isPlayerArray,
} from "./util/manager";
import { csvParse } from "./util/csvparse";
import { defaultCsv } from "./util/default.ts";
import Supervise from "./pages/supervise/supervise.tsx";
import Start from "./pages/temp.tsx";

const PAGES = {
  START: "start",
  LOOKUP: "lookup",
  SUPERVISE: "supervise",
};

export function App() {
  const [page, setPage] = useState(PAGES.SUPERVISE);
  const [manager, setManager] = useState<Manager>(
    defaultManager,
    // createManager(
    //   isPlayerArray(csvParse(defaultCsv)) ? csvParse(defaultCsv) : [],
    // ),
  );
  const csvLoad = (parsed: any) => {
    // setManager(createManager(isPlayerArray(parsed) ? parsed : []));
    setPage(PAGES.SUPERVISE);
  };
  return (
    <div id="app-container">
      {page === PAGES.SUPERVISE && <Supervise manager={manager} />}
      {page === PAGES.START && <Start csvLoad={csvLoad} />}
      {/*{page === PAGES.LOOKUP && <Lookup csvLoad={csvLoad} />}*/}
    </div>
  );

  // const [page, setPage] = useState(PAGES.SUPERVISE);
  // const [manager, setManager] = useState<Manager>(
  //   defaultManager,
  //   // createManager(
  //   //   isPlayerArray(csvParse(defaultCsv)) ? csvParse(defaultCsv) : [],
  //   // ),
  // );
  // const csvLoad = (parsed: any) => {
  //   setManager(createManager(isPlayerArray(parsed) ? parsed : []));
  //   setPage(PAGES.SUPERVISE);
  // };
  // return (
  //   <div id="app-container">
  //     {page === PAGES.SUPERVISE && <Supervise manager={manager} />}
  //     {page === PAGES.START && <Start csvLoad={csvLoad} />}
  //     {/*{page === PAGES.LOOKUP && <Lookup csvLoad={csvLoad} />}*/}
  //   </div>
  // );
}
