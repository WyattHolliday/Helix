import { Message } from "@/types/text";

const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ');

export const ChatMessage = ({ content, role }: Message) => {
  return (
    <div
      className={classNames(
        "flex w-full animate-fade-in",
        role == "assistant" ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={classNames(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
          role == "assistant"
            ? "bg-gray-100 text-gray-900"
            : "bg-gray-900 text-white"
        )}
      >
        {content}
      </div>
    </div>
  );
};