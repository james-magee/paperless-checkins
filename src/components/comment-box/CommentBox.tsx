import type { TargetedEvent } from "preact";
import "./CommentBox.css";

export const CommentBox = ({
  onChange,
  content,
  placeholder,
}: {
  onChange: (content: string) => void;
  content: string;
  placeholder?: string;
}) => {
  const validateInput = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const { value, selectionStart }: any = event.target;
      if (value[selectionStart - 1] === "\n") {
        event.preventDefault();
      }
    }
  };

  return (
    <div>
      <textarea
        onKeyDown={validateInput}
        class="comment-box"
        onChange={(event: TargetedEvent<HTMLTextAreaElement>) =>
          onChange(event.currentTarget.value)
        }
        placeholder={placeholder ?? ""}
      >
        {content}
      </textarea>
    </div>
  );
};
