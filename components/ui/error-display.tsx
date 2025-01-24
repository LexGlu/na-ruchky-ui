import React from "react";
import { ApiError } from "@/lib/types/errors";

interface Props {
  error: ApiError;
}

/**
 * Maps ApiError to user-friendly messages.
 * Customize this function based on your application's needs.
 * @param error The ApiError object.
 * @returns A user-friendly error message.
 */
const getUserFriendlyMessage = (error: ApiError): string => {
  switch (error.status) {
    case 400:
      return (
        error.message ||
        "Неправильний запит. Будь ласка, перевірте введені дані."
      );
    case 401:
      return "Неавторизований доступ. Будь ласка, увійдіть у свій акаунт.";
    case 403:
      return "Доступ заборонено. Ви не маєте необхідних прав.";
    case 404:
      return "Ресурс не знайдено. Перевірте URL або поверніться назад.";
    case 500:
      return "Внутрішня помилка сервера. Будь ласка, спробуйте пізніше.";
    default:
      return error.message || "Сталася непередбачена помилка.";
  }
};

const ErrorDisplay: React.FC<Props> = ({ error }) => {
  const userMessage = getUserFriendlyMessage(error);

  return (
    <div
      className="p-2 bg-[#f8d7da] text-[#721c24] rounded-[10px] border-l-4 border-[#f5c6cb]"
      role="alert"
      aria-live="assertive"
    >
      <p>{userMessage}</p>
    </div>
  );
};

export default ErrorDisplay;
