import { useState, useEffect } from "preact/hooks";
import type { JSX, Ref } from "preact";
import "./numerical.css";

const stringify = (n: number | null): string => {
  if (n === null) return "";
  return String(n);
};

const numeric = (s: string | null): boolean => {
  if (s === null) return false;
  return !Number.isNaN(Number(s));
};

export const NumericalInput = ({
  value,
  setValue,
}: {
  value: number | null;
  setValue: (val: number | null) => void;
}) => {
  const validateInput = (event: InputEvent) => {
    event.preventDefault();
    if (event.inputType === "deleteSoftLineBackward") {
      setValue(null);
      return;
    }

    if (event.inputType === "insertLineBreak") {
      return;
    }

    const input =
      event.inputType === "deleteContentBackward" ? "\b" : event.data;
    const str = stringify(value);
    if (input === "\b") {
      if (str === "") return;
      const substr = str.substring(0, str.length - 1);
      if (substr.length === 0) {
        setValue(null);
        return;
      }
      const num = Number(substr);
      setValue(num);
    }
    if (numeric(input)) {
      const num = Number(str + input);
      if (Number.isNaN(num)) setValue(null);
      setValue(num);
    }
  };

  return (
    <div>
      <input
        value={value ?? ""}
        type="text"
        class="numerical"
        onBeforeInput={validateInput}
      ></input>
    </div>
  );
};
