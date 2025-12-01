import type { ComponentProps } from "preact";
import "./StudentNameInput.css";

export const StudentNameInput = ({
  onChange,
  ...props
}: { onChange: (value: string) => void } & ComponentProps<"input">) => {
  return <input class="stu-name-input" type="text" ref={props.ref}></input>;
};
