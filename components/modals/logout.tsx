"use client"

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,

} from "@heroui/modal";
import { useAuth } from "@/store/auth-store";

interface LogOutModalProps {}

const LogOutModal: React.FC<LogOutModalProps> = () => {
  const { logout, isLogoutModalOpen, setLogOutModalOpen } = useAuth();

  const onClose = () => {
    // Close the modal
    setLogOutModalOpen(false);
  };


  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await logout();
      onClose();
    } catch (err: any) {
      setError(err.message || "Logout failed.");
      console.error("Logout failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isLogoutModalOpen}
        onOpenChange={onClose}
        shadow="lg"
        className="shadow-lg bg-white p-6 rounded-[20px] text-black"
        hideCloseButton={true}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-lg">
                Підтвердження виходу
              </ModalHeader>
              <ModalBody>
                <p>Ви впевнені, що хочете вийти?</p>
                {error && (
                  <p className="text-red-500 mt-2">
                    {error}
                  </p>
                )}
              </ModalBody>
              <ModalFooter className="flex justify-end gap-2">
                <button
                  className={`bg-gray-300 text-gray-800 px-4 py-2 rounded-2xl ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Скасувати
                </button>
                <button
                  className={`bg-red-500 text-white px-4 py-2 rounded-2xl ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleLogout}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Вихід..." : "Вийти"}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LogOutModal;
