import { forwardRef } from "react";

interface ChatTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatTextarea = forwardRef<HTMLTextAreaElement, ChatTextareaProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder = "Type your message here...",
      disabled,
    },
    ref
  ) => {
    return (
      <div className="flex flex-grow flex-row items-start">
        <textarea
          ref={ref}
          name="input"
          id="chat-input"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0 custom-scrollbar"
          aria-label="Message input"
          aria-describedby="chat-input-description"
          autoComplete="off"
          style={{ height: "48px !important" }}
        />
        <div id="chat-input-description" className="sr-only">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    );
  }
);

ChatTextarea.displayName = "ChatTextarea";
