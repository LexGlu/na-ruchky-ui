import React from "react";

type MessageType = "error" | "success" | "info";

interface MessageDisplayProps {
  type: MessageType;
  message: string;
}

const typeStyles: Record<MessageType, string> = {
  error: "bg-red-100 text-red-700 border-red-400",
  success: "bg-green-100 text-green-700 border-green-400",
  info: "bg-blue-100 text-blue-700 border-blue-400",
};

/**
 * Displays a user-friendly message based on the type.
 * @param type The type of message: error, success, or info.
 * @param message The message content to display.
 * @returns A styled message component.
 */
const AuthFeedback: React.FC<MessageDisplayProps> = ({ type, message }) => {
  return (
    <div
      className={`p-2 ${typeStyles[type]} rounded-[10px] border-l-4`}
      role={type === "error" ? "alert" : "status"}
      aria-live="assertive"
    >
      <p>{message}</p>
    </div>
  );
};

export default AuthFeedback;
