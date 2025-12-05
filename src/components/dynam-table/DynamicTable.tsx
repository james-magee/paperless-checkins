import type { StateUpdater, Dispatch } from "preact/hooks";
import { NumericalInput } from "../Numerical";
// import { }
import "./DynamicTable.css";
import { useEffect, useState, useRef } from "preact/hooks";
import { memo } from "preact/compat";
import type { ComponentProps, TargetedEvent } from "preact";

export type AllowedFieldType = string | number | boolean | null;

export type TabularData = {
  [key: string]: AllowedFieldType;
};

export interface TabularField {
  name: string;
  type: "number" | "string" | "boolean";
  editable?: boolean;
  required?: boolean; // for inserting
  headerLabel?: string; // default will be name
}

// could do: a custom mapping between field type and Component (good for checkbox, e.g.)
// should do: if this component receives props, it should also receive the updater method

export const DynamicTable = ({
  fields,
  data,
  dataUpdate,
  dataAdd,
}: {
  fields: TabularField[];
  data: TabularData[];
  dataUpdate?: (
    index: number,
    field: TabularField,
    entry: AllowedFieldType,
  ) => void;
  dataAdd?: (addedData: TabularData) => void;
}) => {
  // data --- eventually get via hook or something else
  const [rows, setRows] = useState(data);

  // update data
  const [autoFocusAt, setAutoFocusAt] = useState<{
    index: number;
    field: TabularField;
  } | null>(null);

  const dataUpdater = (
    index: number,
    field: TabularField,
    entry: AllowedFieldType,
  ) => {
    setAutoFocusAt({ index: index, field: field });
    if (dataUpdate) dataUpdate(index, field, entry);
    else
      setRows((prev) => [
        ...prev.slice(0, index),
        { ...prev[index], [field.name]: entry },
        ...prev.slice(index + 1),
      ]);
  };

  // if (dataUpdate)
  //   dataUpdater = (
  //     index: number,
  //     field: TabularField,
  //     entry: AllowedFieldType,
  //   ) => {
  //     setAutoFocusAt({ index: index, field: field });
  //     dataUpdate;
  //   };
  // else
  //   dataUpdater = (
  //     index: number,
  //     field: TabularField,
  //     entry: AllowedFieldType,
  //   ) => {
  //     if (entry === "") entry = null;
  //     setAutoFocusAt({ index: index, field: field });
  // setRows((prev) => [
  //   ...prev.slice(0, index),
  //   { ...prev[index], [field.name]: entry },
  //   ...prev.slice(index + 1),
  // ]);
  //   };

  // adding new player state
  const emptyObject: TabularData = Object.fromEntries(
    fields.map((f) => [f.name, null]),
  );
  const [insertData, setInsertData] = useState(emptyObject);
  const updateInsertData = (field: TabularField, entry: AllowedFieldType) => {
    if (entry === "") entry = null;
    setInsertData((prevData) => ({ ...prevData, [field.name]: entry }));
  };
  const addRow = () => {
    setRows((prevRows) => [...prevRows, insertData]);
  };

  const newRowCompleted = () => {
    // check if all required fields have been entered, or if no fields have been entered
    let anythingEntered = false;
    for (const field of fields) {
      if (field.required && insertData[field.name] === null) return false;
      if (insertData[field.name] !== null) anythingEntered = true;
    }
    return anythingEntered;
  };

  // event listener
  useEffect(() => {
    const addNewRowHandler = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      if (newRowCompleted()) {
        if (dataAdd) dataAdd?.(insertData);
        else addRow();
        setInsertData(emptyObject);
      }
    };
    window.addEventListener("keydown", addNewRowHandler);
    return () => {
      window.removeEventListener("keydown", addNewRowHandler);
    };
  }, [insertData]);

  // question: how can we add a row without re-rendering everything? maybe it's OK
  // answer: it *is* OK.
  const MemoizedTextCell = memo(TextCell);
  const MemoizedBoolCell = memo(BoolCell);

  const dataSource = dataUpdate ? data : rows;

  return (
    <table class="dyntab">
      <thead>
        <tr>
          {fields.map((field) => (
            <Header headerLabel={field.headerLabel ?? field.name} />
          ))}
        </tr>
      </thead>
      <tbody>
        {dataSource.map((rowObj, index) => (
          <tr key={index}>
            {fields.map((field) => {
              if (field.type === "string")
                return (
                  <MemoizedTextCell
                    autoFocus={
                      autoFocusAt?.index === index &&
                      autoFocusAt?.field.name === field.name
                    }
                    key={field.name}
                    field={field}
                    content={rowObj[field.name] as string}
                    onContentChange={(v) => dataUpdater(index, field, v)}
                  />
                );
              if (field.type === "boolean")
                return (
                  <MemoizedBoolCell
                    key={field.name}
                    field={field}
                    content={rowObj[field.name] as boolean}
                    onContentChange={(v) => dataUpdater(index, field, v)}
                  />
                );
            })}
          </tr>
        ))}
        <tr>
          {fields.map((field) =>
            field.type === "boolean" ? (
              <BoolCell
                key={field.name}
                field={field}
                content={insertData[field.name] as boolean}
                onContentChange={(v) => updateInsertData(field, v)}
              />
            ) : (
              <TextCell
                // autoFocus={
                //   autoFocusAt?.index === -1 &&
                //   autoFocusAt?.field.name === field.name
                // }
                key={field.name}
                field={field}
                content={insertData[field.name] as string}
                onContentChange={(v) => updateInsertData(field, v)}
              />
            ),
          )}
        </tr>
        {/*<InserterRow
          onCellActivate={() => {}}
          fields={fields}
          updateCellData={updateInsertData}
          data={insertData}
        />*/}
      </tbody>
    </table>
  );
};

const Header = ({ headerLabel }: { headerLabel: string }) => {
  return <th style={{ textAlign: "left" }}>{headerLabel}</th>;
};

interface CellProps<T> extends ComponentProps<"input"> {
  field: TabularField;
  onContentChange?: (newContent: T | null) => void;
  content?: T | null;
}

const TextCell = (props: CellProps<string>) => {
  const ref = useRef<HTMLInputElement>(null);

  // If you want to memoize the cells,
  useEffect(() => {
    if (props.autoFocus) {
      ref?.current?.focus();
    }
  }, [props.autoFocus]);

  return (
    <td>
      <input
        ref={ref}
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

const BoolCell = (props: CellProps<boolean>) => {
  // const ref = useRef<HTMLInputElement>(null);

  // // If you want to memoize the cells,
  // useEffect(() => {
  //   if (props.autoFocus) {
  //     ref?.current?.focus();
  //   }
  // }, [props.autoFocus]);

  // toggle, or if undefined, set to true
  const toggle = () => props.onContentChange?.(!(props.content ?? false));

  return (
    <td style={{ width: 100 }} onClick={toggle}>
      <Checkbox
        // label={props.field.name}
        checked={props.content ?? false}
        toggle={() => {}}
      />
      {/*<input
        ref={ref}
        value={props.content ?? ""}
        style={{
          backgroundColor: "rgba(0,0,0,0)",
          outline: "none",
          border: "none",
          maxWidth: 100,
        }}
        onChange={(event) => props.onContentChange?.(event.currentTarget.value)}
      ></input>*/}
    </td>
  );
};

const Checkbox = ({
  label,
  checked,
  toggle,
  ...props
}: {
  label?: string;
  checked: boolean;
  toggle: () => void;
} & React.ComponentProps<"div">) => {
  return (
    <div className="checkbox">
      {label && <div className="field-label">{label}</div>}
      <div
        ref={props.ref}
        onClick={toggle}
        className={checked ? "waiverbox checked" : "waiverbox"}
      ></div>
    </div>
  );
};
