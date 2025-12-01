import type { StateUpdater, Dispatch } from "preact/hooks";
import { NumericalInput } from "../Numerical";
import "./DynamicTable.css";
import { useEffect, useState, useRef } from "preact/hooks";
import type { ComponentProps, TargetedEvent } from "preact";

export type AllowedFieldType = string | number | boolean | null;

export type TabularData = {
  [key: string]: AllowedFieldType;
};

// interface TabularField<T extends object> {
//   name: keyof t;
//   type: "number" | "string" | "boolean";
//   editable: boolean;
// }

export interface TabularField {
  name: string;
  type: "number" | "string" | "boolean";
  editable: boolean;
  required?: boolean; // for inserting
}

export const DynamicTable = ({
  fields,
  data,
}: {
  fields: TabularField[];
  data: TabularData[];
}) => {
  // data --- eventually get via hook or something else
  const [rows, setRows] = useState(data);

  const hstrs = fields.map((h) => String(h.name));

  // adding new player state
  const [addingRow, setAddingRow] = useState(false);
  const [insertData, setInsertData] = useState<{
    [key: string]: AllowedFieldType;
  }>(Object.fromEntries(fields.map((f) => [f.name, null])));
  const updateInsertData = (field: TabularField, entry: AllowedFieldType) => {
    setInsertData((prevData) => ({ ...prevData, [field.name]: entry }));
  };
  const addRow = (row: TabularData) => {
    setAddingRow(false);
    setRows((prevRows) => [...prevRows, row]);
  };

  // question: how can we add a row without re-rendering everything? maybe it's OK
  // answer: it *is* OK.

  return (
    <table class="dyntab">
      <thead>
        <tr>
          {hstrs.map((hstr) => (
            <Header name={hstr} />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((rowData) => (
          <Row fields={fields} data={rowData} />
        ))}
        <InserterRow
          onCellActivate={() => {}}
          fields={fields}
          updateData={updateInsertData}
          data={insertData}
          addRow={addRow}
        />
      </tbody>
    </table>
  );
};

const Header = ({ name }: { name: string }) => {
  return <th style={{ textAlign: "left" }}>{name}</th>;
};

interface RowProps extends ComponentProps<"tr"> {
  fields: TabularField[];
  data: TabularData;
}

const Row = (props: RowProps) => {
  // const dataRef = useRef<TabularData>(dataObject);
  // const oldRef = useRef<TabularData | null>(null);
  // const localState = new Map<
  //   string,
  //   [AllowedFieldType, Dispatch<StateUpdater<AllowedFieldType>>]
  // >();

  // if (oldRef.current === null || dataObject === oldRef.current)
  //   fields
  //     .filter((field) => field !== null)
  //     .forEach((field) =>
  //       localState.set(field.name, useState(dataObject[field.name])),
  //     );

  // if (dataObject != dataRef.current) {
  //   oldRef.current = dataRef.current;
  //   dataRef.current = dataObject;
  // }

  // // if (!localState.has(field.name)) return <></>;
  // // const [val, setval] = localState.get(field.name)!;
  // // if (typeof val != "number") return <></>;

  // // useEffect(() => {
  // //   // run only on mount
  // // }, []);

  return (
    <tr>
      {props.fields.map((field) => {
        if (field.type === "number")
          return (
            <NumericalCell
              field={field}
              entry={props.data[field.name] as number}
            />
          );
        if (field.type === "string")
          return (
            <TextCell field={field} entry={props.data[field.name] as string} />
          );
        if (field.type === "boolean")
          return (
            <BooleanCell
              field={field}
              entry={props.data[field.name] as boolean}
            />
          );
      })}
    </tr>
  );
};

interface CellProps<T> extends ComponentProps<"input"> {
  field: TabularField;
  entry: T;
  onContentChange?: (newContent: T) => void;
  content?: T;
}

const BooleanCell = (props: CellProps<boolean>) => {
  return (
    <>
      <div>{props.field.name}</div>
      <div>{props.entry}</div>
    </>
  );
};

const NumericalCell = (props: CellProps<number>) => {
  const [val, setVal] = useState<number | null>(props.entry);

  return (
    <td>
      <NumericalInput
        style={{ backgroundColor: "rgba(0,0,0,0)" }}
        currentValue={val}
        updateValue={(newVal) => setVal(newVal)}
        {...props}
      />
    </td>
  );
};

const TextCell = (props: CellProps<string>) => {
  const [val, setVal] = useState<string | null>(props.entry);

  return (
    <td>
      <input
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          outline: "none",
          border: "none",
          maxWidth: 100,
        }}
        onChange={(e) => setVal(e.currentTarget.value)}
      >
        {val}
      </input>
    </td>
  );
};

interface InserterRowProps extends RowProps {
  onCellActivate: () => void;
  updateData: (field: TabularField, entry: AllowedFieldType) => void;
  addRow: (row: TabularData) => void;
}

/**
 * responsible for managing the state of new document inserts
 * @param props
 * @returns
 */
const InserterRow = (props: InserterRowProps) => {
  const [active, setActive] = useState(false);

  // input for each entry
  const [items, setItems] = useState(Object.values(props.data));
  const completed = () =>
    !props.fields.some(
      (field, index) => field.required && items[index] !== null,
    );

  // move to parent element
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      // check if all fields have been entered correctly
      if (completed()) {
      }
    };

    window.addEventListener("keypress", handleEnter);
  }, []);

  return (
    <tr
      style={{
        backgroundColor: "lightgray",
      }}
    >
      {props.fields.map((field) => {
        if (field.type === "number")
          return (
            <NumericalCell
              onContentChange={(v) => props.updateData(field, v)}
              onKeyDown={(event) => console.log(event.key)}
              onFocus={props.onCellActivate}
              field={field}
              entry={props.data[field.name] as number}
            />
          );
        if (field.type === "string")
          return (
            <TextCell
              onContentChange={(v) => props.updateData(field, v)}
              field={field}
              entry={props.data[field.name] as string}
            />
          );
        if (field.type === "boolean")
          return (
            <BooleanCell
              onContentChange={(v) => props.updateData(field, v)}
              field={field}
              entry={props.data[field.name] as boolean}
            />
          );
      })}
    </tr>
  );
};
