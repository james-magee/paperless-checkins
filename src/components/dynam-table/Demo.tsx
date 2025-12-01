import { DynamicTable } from "./DynamicTable";
import type { TabularField, TabularData } from "./DynamicTable";

const DEMO_FIELDS: TabularField[] = [
  {
    name: "name",
    type: "string",
    editable: true,
  },
  {
    name: "age",
    type: "number",
    editable: true,
  },
  {
    name: "height",
    type: "number",
    editable: true,
  },
];

const DEMO_DATA: TabularData[] = [
  {
    name: "joe",
    age: 14,
    height: 102,
  },
  {
    name: "bob",
    age: 25,
    height: 153,
  },
  {
    name: "tim",
    age: 42,
    height: 180,
  },
];

export const Test = () => {
  return (
    <div>
      <DynamicTable fields={DEMO_FIELDS} data={DEMO_DATA} />
    </div>
  );
};
