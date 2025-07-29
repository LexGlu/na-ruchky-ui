"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const ErrorMessage = ({
  error,
  onRetry,
  isRetrying = false,
}: ErrorMessageProps) => {
  const t = useTranslations("Common");

  return (
    <div className="p-5 mb-6 bg-white border border-red-200 rounded-2xl shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>

        <div className="flex-1">
          <h3 className="mb-1 text-lg font-medium text-gray-900">
            {t("error")}
          </h3>

          <p className="mb-4 text-gray-600">
            {error ||
              "Сталася помилка при завантаженні даних. Будь ласка, спробуйте знову пізніше."}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("retrying")}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("retry")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
