import type { ComponentProps } from "preact";
import "./StudentNumberInput.css";

export const StudentNumberInput = ({
  onChange,
  ...props
}: { onChange: (value: string) => void } & ComponentProps<"input">) => {
  return <input class="stu-num-input" type="text" ref={props.ref}></input>;
};
