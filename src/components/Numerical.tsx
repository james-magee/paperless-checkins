import { useState, useEffect } from "preact/hooks";
import type { ComponentProps, JSX, Ref } from "preact";
import "./numerical.css";

const stringify = (n: number | null): string => {
  if (n === null) return "";
  return String(n);
};

const numeric = (s: string | null): boolean => {
  if (s === null) return false;
  return !Number.isNaN(Number(s));
};

export interface NumericalInputProps extends ComponentProps<"input"> {
  currentValue: number | null;
  updateValue: (newVal: number | null) => void;
}

export const NumericalInput = (props: NumericalInputProps) => {
  const validateInput = (event: InputEvent) => {
    event.preventDefault();
    if (event.inputType === "deleteSoftLineBackward") {
      props.updateValue(null);
      return;
    }

    if (event.inputType === "insertLineBreak") {
      return;
    }

    const input =
      event.inputType === "deleteContentBackward" ? "\b" : event.data;
    const str = stringify(props.currentValue);
    if (input === "\b") {
      if (str === "") return;
      const substr = str.substring(0, str.length - 1);
      if (substr.length === 0) {
        props.updateValue(null);
        return;
      }
      const num = Number(substr);
      props.updateValue(num);
    }
    if (numeric(input)) {
      const num = Number(str + input);
      if (Number.isNaN(num)) props.updateValue(null);
      props.updateValue(num);
    }
  };

  return (
    <div style={{ maxWidth: 100 }}>
      <input
        style={props.style}
        value={props.currentValue ?? ""}
        type="text"
        class="numerical"
        onBeforeInput={validateInput}
        {...props}
      ></input>
    </div>
  );
};
