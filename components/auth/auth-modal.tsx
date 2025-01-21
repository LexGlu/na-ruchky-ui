"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import { useAuth } from "@/store/auth-store";
import { authService } from "@/lib/api/auth";

import { FormField } from "@/components/ui/form-fields";
import { Spinner } from "@/components/ui/spinner";

import cross from "@/public/cross.svg";

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

export default function AuthModal() {
  const { login, isAuthModalOpen, setAuthModalOpen } = useAuth();

  const onClose = useCallback(() => {
    // Close the modal
    setAuthModalOpen(false);
  }, [setAuthModalOpen]);

  // Tabs
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

  // Errors
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Loading
  const [isLoading, setIsLoading] = useState({
    login: false,
    register: false,
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isAuthModalOpen]);

  // Close modal on 'Escape'
  const handleEscClose = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isAuthModalOpen) {
      document.addEventListener("keydown", handleEscClose);
    } else {
      document.removeEventListener("keydown", handleEscClose);
    }
    return () => document.removeEventListener("keydown", handleEscClose);
  }, [isAuthModalOpen, handleEscClose]);

  // Close on outside click
  const handleOutsideClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Switch tabs
  const handleTabSwitch = useCallback((tab: "login" | "register") => {
    setActiveTab(tab);
    setLoginError("");
    setRegisterError("");
  }, []);

  // Consolidated change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      if (activeTab === "login") {
        setLoginData((prev) => ({ ...prev, [name]: value }));
      } else {
        setRegisterData((prev) => ({ ...prev, [name]: value }));
      }
    },
    [activeTab]
  );

  // Handle form submits depending on tab
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "login") {
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
    } else {
      setRegisterError("");
      setIsLoading((prev) => ({ ...prev, register: true }));
      try {
        await authService.registerUser({
          email: registerData.email,
          password: registerData.password,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        });
        // Switch to login on success
        setActiveTab("login");
      } catch (err: unknown) {
        const error = err as { info?: { message: string } };
        setRegisterError(error.info?.message || "Помилка при реєстрації");
      } finally {
        setIsLoading((prev) => ({ ...prev, register: false }));
      }
    }
  };

  // Configuration for each tab to reduce repetition
  const formConfigs = {
    login: {
      title: "Для входу у кабінет введіть свій email",
      fields: [
        {
          label: "Email",
          id: "loginEmail",
          name: "email",
          type: "email",
          value: loginData.email,
          required: true,
        },
        {
          label: "Пароль",
          id: "loginPassword",
          name: "password",
          type: "password",
          value: loginData.password,
          required: true,
        },
      ],
      error: loginError,
      isLoading: isLoading.login,
      button: {
        normalText: "Відправити",
        loadingText: "Вхід...",
      },
    },
    register: {
      title: "Заповніть форму для реєстрації",
      fields: [
        {
          label: "Email",
          id: "regEmail",
          name: "email",
          type: "email",
          value: registerData.email,
          required: true,
        },
        {
          label: "Пароль",
          id: "regPassword",
          name: "password",
          type: "password",
          value: registerData.password,
          required: true,
        },
        {
          label: "Ім’я",
          id: "regFirstName",
          name: "firstName",
          type: "text",
          value: registerData.firstName,
          required: false,
        },
        {
          label: "Прізвище",
          id: "regLastName",
          name: "lastName",
          type: "text",
          value: registerData.lastName,
          required: false,
        },
      ],
      error: registerError,
      isLoading: isLoading.register,
      button: {
        normalText: "Відправити",
        loadingText: "Реєстрація...",
      },
    },
  };

  // If not open, don't render anything
  const modalContent = (
    <AnimatePresence>
      {isAuthModalOpen && (
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
            {/* Tab Headers & Close Button */}
            <div className="flex gap-2">
              <div className="flex pb-1 pr-1">
                <div className="flex rounded-br-[20px] z-1">
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center p-3 bg-white rounded-full"
                  >
                    <Image src={cross} alt="Close" />
                  </button>
                </div>
              </div>

              <div className="flex gap-7">
                <div className="relative flex">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("login")}
                    className={`auth-tab px-4 mt-2py-2 text-xl text-black leading-5 rounded-t-3xl bg-white ${
                      activeTab === "login" ? "opacity-100" : "opacity-80"
                    }`}
                  >
                    Авторизація
                  </button>
                </div>
                <div className="relative flex">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("register")}
                    className={`auth-tab px-4 py-2 text-xl text-black leading-5 rounded-t-3xl bg-white  ${
                      activeTab === "register" ? "opacity-100" : "opacity-80"
                    }`}
                  >
                    Реєстрація
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="w-full bg-white p-6 rounded-[20px]">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {formConfigs[activeTab].title}
              </h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {formConfigs[activeTab].fields.map((field) => (
                  <FormField
                    key={field.id}
                    label={field.label}
                    id={field.id}
                    name={field.name}
                    type={field.type}
                    value={field.value}
                    onChange={handleInputChange}
                    required={field.required}
                  />
                ))}

                {/* Error */}
                {formConfigs[activeTab].error && (
                  <p className="text-red-600 text-sm px-2">
                    {formConfigs[activeTab].error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formConfigs[activeTab].isLoading}
                  className="mt-4 w-full bg-[#CAF97C] hover:bg-lime-400 text-black text-sm py-2 px-4 rounded-2xl flex items-center justify-center disabled:opacity-50"
                >
                  {formConfigs[activeTab].isLoading ? (
                    <div className="flex gap-2 items-center">
                      <Spinner />
                      {formConfigs[activeTab].button.loadingText}
                    </div>
                  ) : (
                    formConfigs[activeTab].button.normalText
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render modal in portal
  if (typeof document !== "undefined") {
    return ReactDOM.createPortal(modalContent, document.body);
  }
  return null;
}
