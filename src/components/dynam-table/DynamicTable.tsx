import type { StateUpdater, Dispatch } from "preact/hooks";
import { NumericalInput } from "../Numerical";
import "./DynamicTable.css";
import { useEffect, useState, useRef } from "preact/hooks";
import { memo } from "preact/compat";
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

  // update data
  const [autoFocusAt, setAutoFocusAt] = useState<{
    index: number;
    field: TabularField;
  } | null>(null);
  const dataUpdater = (field: TabularField, index: number) => {
    const updater = (field: TabularField, data: TabularData) => {
      setAutoFocusAt({ index: index, field: field });
      setRows((prev) => [
        ...prev.slice(0, index),
        data,
        ...prev.slice(index + 1),
      ]);
    };
    return updater;
  };

  // adding new player state
  const emptyObject: TabularData = Object.fromEntries(
    fields.map((f) => [f.name, null]),
  );
  const [insertData, setInsertData] = useState(emptyObject);
  const updateInsertData = (field: TabularField, entry: AllowedFieldType) => {
    setInsertData((prevData) => ({ ...prevData, [field.name]: entry }));
  };
  const addRow = () => {
    setRows((prevRows) => [...prevRows, insertData]);
    setInsertData(emptyObject);
  };

  // check if all required fields have been entered
  const newRowCompleted = () => {
    return !fields.some(
      (field) => field.required && insertData[field.name] === null,
    );
  };

  // event listener
  useEffect(() => {
    const addNewRowHandler = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      if (newRowCompleted()) addRow();
    };
    window.addEventListener("keydown", addNewRowHandler);
    return () => {
      window.removeEventListener("keydown", addNewRowHandler);
    };
  }, [insertData]);

  // question: how can we add a row without re-rendering everything? maybe it's OK
  // answer: it *is* OK.

  const MemoizedRow = memo(Row);

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
        {rows.map((rowObj, index) => (
          <tr key={index}>
            {fields.map((field) => (
              <TextCell
                field={field}
                content={rowObj[field.name] as string}
                onContentChange={(v) => dataUpdater(index, field)}
              />
            ))}
          </tr>
        ))}
        {/*{rows.map((rowData, index) => (
          <MemoizedRow
            autoFocusAt={
              autoFocusAt && autoFocusAt.index === index ? autoFocusAt : null
            }
            key={index}
            fields={fields}
            data={rowData}
            updateRowData={rowUpdater(index)}
          />
        ))}*/}
        <InserterRow
          onCellActivate={() => {}}
          fields={fields}
          updateCellData={updateInsertData}
          data={insertData}
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
  updateRowData?: (field: TabularField, newData: TabularData) => void;
  autoFocusAt?: { index: number; field: TabularField } | null;
}

const Row = (props: RowProps) => {
  const updateData = (field: TabularField, value: AllowedFieldType) => {
    props.updateRowData?.(field, { ...props.data, [field.name]: value });
  };

  return (
    <tr>
      {props.fields.map((field) => {
        if (field.type === "number")
          return (
            <NumericalCell
              autoFocus={props.autoFocusAt?.field.name == field.name}
              field={field}
              content={props.data[field.name] as number}
              onContentChange={(v) => updateData(field, v)}
            />
          );
        if (field.type === "string")
          return (
            <TextCell
              autoFocus={props.autoFocusAt?.field.name == field.name}
              field={field}
              content={props.data[field.name] as string}
              onContentChange={(v) => updateData(field, v)}
            />
          );
        if (field.type === "boolean")
          return (
            <BooleanCell
              // autoFocus={props.autoFocusAt?.field.name == field.name}
              field={field}
              content={props.data[field.name] as boolean}
              onContentChange={(v) => updateData(field, v)}
            />
          );
      })}
    </tr>
  );
};

interface CellProps<T> extends ComponentProps<"input"> {
  field: TabularField;
  onContentChange?: (newContent: T | null) => void;
  content?: T | null;
}

const BooleanCell = (props: CellProps<boolean>) => {
  return (
    <>
      <div>{props.field.name}</div>
      <div>{props.content}</div>
    </>
  );
};

const NumericalCell = (props: CellProps<number>) => {
  return (
    <td>
      <NumericalInput
        style={{ backgroundColor: "rgba(0,0,0,0)" }}
        currentValue={props.content ?? null}
        updateValue={(newVal) => props.onContentChange?.(newVal)}
        {...props}
      />
    </td>
  );
};

const TextCell = (props: CellProps<string>) => {
  return (
    <td>
      <input
        value={props.content ?? ""}
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          outline: "none",
          border: "none",
          maxWidth: 100,
        }}
        onChange={(event) => props.onContentChange?.(event.currentTarget.value)}
      ></input>
    </td>
  );
};

interface InserterRowProps extends RowProps {
  onCellActivate: () => void;
  updateCellData: (field: TabularField, entry: AllowedFieldType) => void;
}

/**
 * responsible for managing the state of new document inserts
 * @param props
 * @returns
 */
const InserterRow = (props: InserterRowProps) => {
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
              content={props.data[field.name] as number}
              onContentChange={(v) => props.updateCellData(field, v)}
              onFocus={props.onCellActivate}
              field={field}
            />
          );
        if (field.type === "string")
          return (
            <TextCell
              content={props.data[field.name] as string}
              onContentChange={(v) => props.updateCellData(field, v)}
              field={field}
            />
          );
        if (field.type === "boolean")
          return (
            <BooleanCell
              onContentChange={(v) => props.updateCellData(field, v)}
              content={props.data[field.name] as boolean}
              field={field}
            />
          );
      })}
    </tr>
  );
};
