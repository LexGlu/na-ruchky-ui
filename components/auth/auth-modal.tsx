"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";

import { motion, AnimatePresence } from "motion/react";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  loginUser,
  googleLoginUser,
  registerUser,
  setAuthModalOpen,
  clearError,
} from "@/store/auth/auth.slice";
import {
  selectAuthModalOpen,
  selectAuthLoading,
  selectAuthError,
} from "@/store/auth/auth.selectors";

import GoogleAuthButton from "@/components/auth/google-auth-btn";

import { FormField } from "@/components/ui/form-fields";
import { PuffLoader } from "react-spinners";

import cross from "@/public/cross.svg";
import AuthFeedback from "@/components/ui/auth-feedback";

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

type TabType = "login" | "register";

interface Message {
  type: "error" | "success" | "info";
  text: string;
}

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const isAuthModalOpen = useAppSelector(selectAuthModalOpen);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const onClose = useCallback(() => {
    dispatch(setAuthModalOpen(false));
    dispatch(clearError());
    setLoginMessage(null);
    setRegisterMessage(null);
  }, [dispatch]);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>("login");

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

  // Local messages (for tab-specific feedback)
  const [loginMessage, setLoginMessage] = useState<Message | null>(null);
  const [registerMessage, setRegisterMessage] = useState<Message | null>(null);

  // Loading states for different operations
  const [isLoading, setIsLoading] = useState({
    login: false,
    register: false,
    google: false,
  });

  // Update local loading state based on Redux loading
  useEffect(() => {
    setIsLoading((prev) => ({
      ...prev,
      login: loading && activeTab === "login",
      register: loading && activeTab === "register",
    }));
  }, [loading, activeTab]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      if (activeTab === "login") {
        setLoginMessage({ type: "error", text: error });
      } else {
        setRegisterMessage({ type: "error", text: error });
      }
    }
  }, [error, activeTab]);

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
  const handleTabSwitch = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      dispatch(clearError());
      setLoginMessage(null);
      setRegisterMessage(null);
    },
    [dispatch]
  );

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

  // Handle Google login success
  const handleGoogleLoginSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle Google login error
  const handleGoogleLoginError = useCallback((errorMessage: string) => {
    setLoginMessage({
      type: "error",
      text: errorMessage || "An error occurred during Google sign-in.",
    });
  }, []);

  // Handle form submits depending on tab
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "login") {
      setLoginMessage(null);
      dispatch(clearError());

      try {
        await dispatch(
          loginUser({
            email: loginData.email,
            password: loginData.password,
          })
        ).unwrap();
        // Modal will close automatically via Redux state
      } catch (err) {
        // Error is handled by useEffect above
        console.error("Login error:", err);
      }
    } else {
      setRegisterMessage(null);
      dispatch(clearError());

      try {
        await dispatch(
          registerUser({
            email: registerData.email,
            password: registerData.password,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
          })
        ).unwrap();

        setActiveTab("login");
        setLoginMessage({
          type: "success",
          text: "Реєстрація успішна! Будь ласка, перевірте свій email для підтвердження.",
        });
      } catch (err) {
        console.error("Registration error:", err);
      }
    }
  };

  // Handle Google login through Redux
  const handleGoogleLogin = useCallback(
    async (token: string) => {
      setIsLoading((prev) => ({ ...prev, google: true }));

      try {
        await dispatch(googleLoginUser(token)).unwrap();
        handleGoogleLoginSuccess();
      } catch (err) {
        const errorMessage =
          typeof err === "string" ? err : "Google login failed";
        handleGoogleLoginError(errorMessage);
      } finally {
        setIsLoading((prev) => ({ ...prev, google: false }));
      }
    },
    [dispatch, handleGoogleLoginSuccess, handleGoogleLoginError]
  );

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
          showRequiredIndicator: false,
        },
        {
          label: "Пароль",
          id: "loginPassword",
          name: "password",
          type: "password",
          value: loginData.password,
          required: true,
          showRequiredIndicator: false,
        },
      ],
      message: loginMessage,
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
          showRequiredIndicator: true,
        },
        {
          label: "Пароль",
          id: "regPassword",
          name: "password",
          type: "password",
          value: registerData.password,
          required: true,
          showRequiredIndicator: true,
        },
        {
          label: "Ім'я",
          id: "regFirstName",
          name: "firstName",
          type: "text",
          value: registerData.firstName,
          required: false,
          showRequiredIndicator: false,
        },
        {
          label: "Прізвище",
          id: "regLastName",
          name: "lastName",
          type: "text",
          value: registerData.lastName,
          required: false,
          showRequiredIndicator: false,
        },
      ],
      message: registerMessage,
      isLoading: isLoading.register,
      button: {
        normalText: "Відправити",
        loadingText: "Реєстрація...",
      },
    },
  };

  // If not open, don't render anything
  const modalContent = (
    <>
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-black px-2 lg:px-0"
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
                <div className="flex">
                  <div className="flex pb-1 rounded-br-[20px] z-1">
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center p-3 bg-white rounded-full cursor-pointer"
                      aria-label="Close modal"
                    >
                      <Image src={cross} alt="Close" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-[-4px]">
                  <div className="relative flex mr-[4px]">
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("login")}
                      className={`auth-tab px-4 py-2 text-xl text-black leading-5 rounded-t-2xl bg-white cursor-pointer ${
                        activeTab === "login" ? "opacity-100" : "opacity-80"
                      }`}
                    >
                      Авторизація
                    </button>
                  </div>
                  <div className="relative flex ml-[-12px]">
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("register")}
                      className={`auth-tab px-6 py-2 text-xl text-black leading-5 rounded-t-2xl bg-white cursor-pointer ${
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
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-4">
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
                        showRequiredIndicator={field.showRequiredIndicator}
                      />
                    ))}

                    {/* Error */}
                    {formConfigs[activeTab].message && (
                      <AuthFeedback
                        type={formConfigs[activeTab].message.type}
                        message={formConfigs[activeTab].message.text}
                      />
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={formConfigs[activeTab].isLoading}
                    className="mt-4 w-full bg-[#CAF97C] hover:bg-lime-400 text-black text-sm py-[10px] px-4 rounded-2xl flex items-center justify-center disabled:opacity-50 cursor-pointer"
                  >
                    {formConfigs[activeTab].isLoading ? (
                      <div className="flex gap-2 items-center">
                        <PuffLoader size={20} />
                        {formConfigs[activeTab].button.loadingText}
                      </div>
                    ) : (
                      formConfigs[activeTab].button.normalText
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">або</span>
                    <div className="flex-grow h-px bg-gray-300"></div>
                  </div>

                  {/* Google Sign-In Button */}
                  <div className="flex justify-center">
                    <GoogleAuthButton
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      isLoading={isLoading.google}
                      setIsLoading={(loading) =>
                        setIsLoading((prev) => ({ ...prev, google: loading }))
                      }
                      googleLogin={handleGoogleLogin}
                    />
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Render modal in portal
  if (typeof document !== "undefined") {
    return ReactDOM.createPortal(modalContent, document.body);
  }
  return null;
}
