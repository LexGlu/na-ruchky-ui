"use client";

import React, { useState } from "react";
import Image from "next/image";
import paw from "@/public/paw-dark.svg";
import { useAuth } from "@/context/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";

export default function HeaderActions() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (!user) {
    // Not logged in => show single “Увійти” button + paw button
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setShowAuth(true)}
          className="bg-[#2A2B3C] text-white hover:opacity-95 py-[10px] px-[26px] rounded-2xl"
        >
          Увійти
        </button>
        <button
          type="button"
          className="flex bg-[#2A2B3C] text-white hover:opacity-95 py-[13px] px-[15px] rounded-3xl"
        >
          <Image src={paw} alt="paw icon" />
        </button>

        {/* Single AuthModal with tabs (login & register) */}
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
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
          onClick={() => logout()}
          className="bg-[#2A2B3C] text-white hover:opacity-95 py-[10px] px-[20px] rounded-2xl"
        >
          Вийти
        </button>
        <button
          type="button"
          className="flex bg-[#2A2B3C] text-white hover:opacity-95 py-[10px] px-[15px] justify-center items-center rounded-3xl"
        >
          <Image src={paw} alt="paw icon" />
        </button>
      </div>
    </div>
  );
}
