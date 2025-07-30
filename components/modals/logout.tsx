"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store";
import { logoutUser, setLogoutModalOpen } from "@/store/auth/auth.slice";
import {
  selectLogoutModalOpen,
  selectAuthLoading,
  selectAuthError,
} from "@/store/auth/auth.selectors";

export default function LogOutModal() {
  const dispatch = useAppDispatch();
  const isLogoutModalOpen = useAppSelector(selectLogoutModalOpen);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (!loading) {
      dispatch(setLogoutModalOpen(false));
      setLocalError(null);
    }
  }, [loading, dispatch]);

  const handleLogout = async () => {
    setLocalError(null);

    try {
      await dispatch(logoutUser()).unwrap();
      // Modal will close automatically when logout succeeds
    } catch (err) {
      const errorMessage = typeof err === "string" ? err : "Logout failed.";
      setLocalError(errorMessage);
      console.error("Logout failed:", err);
    }
  };

  // Update local error from Redux error
  useEffect(() => {
    if (error && isLogoutModalOpen) {
      setLocalError(error);
    }
  }, [error, isLogoutModalOpen]);

  // Add/remove modal-open class on body for preventing background scrolling
  useEffect(() => {
    if (isLogoutModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isLogoutModalOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLogoutModalOpen && !loading) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [handleClose, isLogoutModalOpen, loading]);

  return (
    <Modal
      isOpen={isLogoutModalOpen}
      onOpenChange={handleClose}
      shadow="lg"
      className="shadow-xl bg-white dark:bg-gray-800 p-0 rounded-2xl max-w-md mx-auto w-full"
      backdrop="blur"
      hideCloseButton={true}
    >
      <ModalContent className="z-50 max-h-screen overflow-hidden">
        {() => (
          <>
            <div className="absolute right-4 top-4">
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                disabled={loading}
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ModalHeader className="px-6 pt-8 pb-4 text-xl  font-semibold text-center dark:text-white">
              Підтвердження виходу
            </ModalHeader>

            <ModalBody className="px-8 py-4">
              <p className="text-gray-700 dark:text-gray-300 text-center mb-2">
                Ви впевнені, що хочете вийти?
              </p>
              {localError && (
                <div
                  className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center"
                  role="alert"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {localError}
                  </p>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex flex-col sm:flex-row gap-4 p-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                className={`flex-1 order-2 sm:order-1 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-5 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleClose}
                disabled={loading}
              >
                Скасувати
              </button>
              <button
                className={`flex-1 order-1 sm:order-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleLogout}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Вихід...</span>
                  </span>
                ) : (
                  "Вийти"
                )}
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
