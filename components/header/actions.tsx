"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import paw from "@/public/paw-dark.svg";

import { useAuth } from "@/store/auth-store";

export default function HeaderActions() {
  const t = useTranslations("Header.actions");
  const { user, setLogOutModalOpen, setAuthModalOpen } = useAuth();

  const handleLogOutBtnClick = () => {
    // Open the logout modal
    setLogOutModalOpen(true);
  };

  const handleAuthBtnClick = () => {
    // Open the auth modal
    setAuthModalOpen(true);
  };

  if (!user) {
    // Not logged in => show single “Увійти” button + paw button
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleAuthBtnClick}
          className="bg-black text-white hover:opacity-95 py-[10px] px-[26px] rounded-lg cursor-pointer"
        >
          {t("login")}
        </button>
        <button
          type="button"
          className="flex bg-black text-white hover:opacity-95 py-[13px] px-[15px] rounded-3xl cursor-pointer"
        >
          <Image src={paw} alt={t("pawIcon")} />
        </button>
      </div>
    );
  }

  // If user is logged in => greeting + logout
  return (
    <div className="flex items-center gap-3">
      <p className="font-semibold text-black">
        {user.first_name || user.email}
      </p>
      <div className="flex">
        <button
          onClick={handleLogOutBtnClick}
          className="bg-[#2A2B3C] text-white hover:opacity-95 py-[10px] px-[20px] rounded-lg cursor-pointer"
        >
          {t("logout")}
        </button>
        <button
          type="button"
          className="flex bg-[#2A2B3C] text-white hover:opacity-95 py-[10px] px-[15px] justify-center items-center rounded-3xl cursor-pointer"
        >
          <Image src={paw} alt={t("pawIcon")} />
        </button>
      </div>
    </div>
  );
}
