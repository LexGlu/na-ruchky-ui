"use client";

import React, { useState } from "react";
import Image from "next/image";

import { useAuth } from "@/context/auth-context";
import { registerUser } from "@/lib/api/auth";

import { FormField } from "@/components/ui/form-fields";
import { Spinner } from "@/components/ui/spinner";

import cross from "@/public/cross.svg";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A single modal with two tabs: "Авторизація" (Login) and "Реєстрація".
 */
export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login } = useAuth();

  // Which tab is active?
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regError, setRegError] = useState("");

  // Loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  if (!open) return null;

  const handleTabSwitch = (tab: "login" | "register") => {
    setActiveTab(tab);
    setLoginError("");
    setRegError("");
  };

  // Handle login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch {
      setLoginError("Некоректний email або пароль");
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle register submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setIsRegisterLoading(true);

    try {
      await registerUser({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
      });
      // Optionally switch to login tab on success
      setActiveTab("login");
    } catch (err: any) {
      setRegError(err.info?.message || "Помилка при реєстрації");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      {/* Modal Container */}
      <div className="relative p-6 text-black">

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
        
        <div className="w-[480px] bg-white rounded-[20px] p-6">

          {/* Title / Subtitle */}
          {activeTab === "login" ? (
            <h2 className="text-lg font-semibold mb-4">
              Для входу у кабінет введіть свій email
            </h2>
          ) : (
            <h2 className="text-lg font-semibold mb-4">
              Заповніть форму для реєстрації
            </h2>
          )}

          {/* Auth Forms */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 mb-2">
              <FormField
                label="Email"
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                error={loginError ? undefined : undefined}
                required
              />
              <FormField
                label="Пароль"
                id="loginPassword"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />

              {loginError && (
                <p className="text-red-600 text-sm px-1">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoginLoading}
                className="mt-2 mx-auto w-40 bg-[#CAF97C] hover:bg-lime-400 text-black text-sm py-2 px-4 rounded-2xl flex items-center justify-center"
              >
                {isLoginLoading ? (
                  <div className="flex gap-2">
                    <Spinner />
                    Вхід...
                  </div>
                ) : (
                  "Відправити"
                )}
              </button>
            </form>
          )}

          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 mb-2">
              <FormField
                label="Email"
                id="regEmail"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <FormField
                label="Пароль"
                id="regPassword"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <FormField
                label="Ім’я"
                id="regFirstName"
                type="text"
                value={regFirstName}
                onChange={(e) => setRegFirstName(e.target.value)}
              />
              <FormField
                label="Прізвище"
                id="regLastName"
                type="text"
                value={regLastName}
                onChange={(e) => setRegLastName(e.target.value)}
              />

              {regError && (
                <p className="text-red-600 text-sm px-4 -mt-3">
                  {regError}
                </p>
              )}

              <button
                type="submit"
                disabled={isRegisterLoading}
                className="mt-2 mx-auto w-40 bg-[#CAF97C] hover:bg-lime-400 text-black text-sm py-2 px-4 rounded-2xl flex items-center justify-center"
              >
                {isRegisterLoading ? (
                  <>
                    <Spinner />
                    Реєстрація...
                  </>
                ) : (
                  "Відправити"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
