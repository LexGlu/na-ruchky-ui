"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "@/context/auth-context";
import { registerUser } from "@/lib/api/auth";

import { FormField } from "@/components/ui/form-fields";
import { Spinner } from "@/components/ui/spinner";

import cross from "@/public/cross.svg";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: "-50px", scale: 0.95 },
  visible: { opacity: 1, y: "0", scale: 1 },
  exit: { opacity: 0, y: "50px", scale: 0.95 },
};

/**
 * A modal component for user authentication with "Login" and "Register" tabs.
 */
export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Error states
  const [loginError, setLoginError] = useState<string>("");
  const [registerError, setRegisterError] = useState<string>("");

  // Loading states
  const [isLoading, setIsLoading] = useState<{
    login: boolean;
    register: boolean;
  }>({
    login: false,
    register: false,
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  // Close modal on 'Escape' key press
  const handleEscClose = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscClose);
    } else {
      document.removeEventListener("keydown", handleEscClose);
    }

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleEscClose);
    };
  }, [open, handleEscClose]);

  // Handle outside click
  const handleOutsideClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Switch active tab
  const handleTabSwitch = useCallback(
    (tab: "login" | "register") => {
      setActiveTab(tab);
      setLoginError("");
      setRegisterError("");
    },
    []
  );

  // Handle input changes for login
  const handleLoginChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLoginData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Handle input changes for register
  const handleRegisterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Handle login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading((prev) => ({ ...prev, login: true }));

    try {
      await login(loginData.email, loginData.password);
      onClose();
    } catch {
      setLoginError("Некоректний email або пароль");
    } finally {
      setIsLoading((prev) => ({ ...prev, login: false }));
    }
  };

  // Handle register submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setIsLoading((prev) => ({ ...prev, register: true }));

    try {
      await registerUser({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
      });
      // Optionally switch to login tab on success
      setActiveTab("login");
    } catch (err: any) {
      setRegisterError(err.info?.message || "Помилка при реєстрації");
    } finally {
      setIsLoading((prev) => ({ ...prev, register: false }));
    }
  };

  // If not open, don't render anything
  // Handled by AnimatePresence

  // Modal content
  const modalContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-black"
          onClick={handleOutsideClick}
          aria-modal="true"
          role="dialog"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-2">
              <div className="flex pb-1 pr-1">
                <div className="flex rounded-br-[20px] z-1">
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center p-3 bg-white rounded-full"
                  >
                    <Image src={cross} alt="cross" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTabSwitch("login")}
                className={`px-4 mt-2py-2 text-xl text-black leading-5 rounded-t-3xl bg-white ${
                  activeTab === "login"
                    ? "opacity-100"
                    : "opacity-80"
                }`}
              >
                Авторизація
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch("register")}
                className={`px-4 py-2 text-xl text-black leading-5 rounded-t-3xl bg-white  ${
                  activeTab === "register"
                    ? "opacity-100"
                    : "opacity-80"
                }`}
              >
                Реєстрація
              </button>

            </div>

            {/* Modal Body */}
            <div className="w-full bg-white p-6 rounded-[20px]">
              {/* Title */}
              {activeTab === "login" ? (
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Для входу у кабінет введіть свій email
                </h2>
              ) : (
                <h2 className="text-lg font-semibold mb-4 text-center">
                  Заповніть форму для реєстрації
                </h2>
              )}

              {/* Forms */}
              {activeTab === "login" ? (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  <FormField
                    label="Email"
                    id="loginEmail"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                  <FormField
                    label="Пароль"
                    id="loginPassword"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />

                  {loginError && (
                    <p className="text-red-600 text-sm px-2">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading.login}
                    className="mt-4 w-full bg-[#CAF97C] hover:bg-lime-400 text-black text-sm py-2 px-4 rounded-2xl flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading.login ? (
                      <div className="flex gap-2 items-center">
                        <Spinner />
                        Вхід...
                      </div>
                    ) : (
                      "Відправити"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                  <FormField
                    label="Email"
                    id="regEmail"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                  <FormField
                    label="Пароль"
                    id="regPassword"
                    name="password"
                    type="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                  <FormField
                    label="Ім’я"
                    id="regFirstName"
                    name="firstName"
                    type="text"
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                  />
                  <FormField
                    label="Прізвище"
                    id="regLastName"
                    name="lastName"
                    type="text"
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                  />

                  {registerError && (
                    <p className="text-red-600 text-sm px-2">
                      {registerError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading.register}
                    className="mt-4 w-full bg-[#CAF97C] hover:bg-lime-400 text-black text-sm py-2 px-4 rounded-2xl flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading.register ? (
                      <div className="flex gap-2 items-center">
                        <Spinner />
                        Реєстрація...
                      </div>
                    ) : (
                      "Відправити"
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render modal using React Portal for better accessibility and stacking context
  if (typeof document !== "undefined") {
    return ReactDOM.createPortal(modalContent, document.body);
  }

  return null;
}
