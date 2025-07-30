"use client";

import React from "react";
import { useTranslations } from "next-intl";

const BaseLoader = () => {
  // Mock translation function for demo
  const t = useTranslations("Common");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C8E6A0] via-[#B8E090] to-[#A8DA80] relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full animate-float-slow"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-white rounded-full animate-float-medium delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-white rounded-full animate-float-fast delay-2000"></div>
        <div className="absolute bottom-32 right-32 w-5 h-5 bg-white rounded-full animate-float-slow delay-1500"></div>
      </div>

      <div className="text-center p-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 max-w-md mx-4 relative">
        {/* Main walking pets animation */}
        <div className="relative mb-8">
          {/* Walking path */}

          {/* Walking paw prints trail */}
          <div>
            <div className="relative w-full h-8">
              <div className="absolute left-6 animate-paw-step-1">
                <div className="text-sm opacity-60">🐾</div>
              </div>
              <div className="absolute left-12 animate-paw-step-2">
                <div className="text-sm opacity-80">🐾</div>
              </div>
              <div className="absolute left-20 animate-paw-step-3">
                <div className="text-base opacity-90">🐾</div>
              </div>
              <div className="absolute right-20 animate-paw-step-4">
                <div className="text-base opacity-90 transform scale-x-[-1]">
                  🐾
                </div>
              </div>
              <div className="absolute right-12 animate-paw-step-5">
                <div className="text-sm opacity-80 transform scale-x-[-1]">
                  🐾
                </div>
              </div>
              <div className="absolute right-6 animate-paw-step-6">
                <div className="text-sm opacity-60 transform scale-x-[-1]">
                  🐾
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {t("findingCompanion")}
          </h2>
          <p className="text-gray-700 text-base font-medium">
            {t("preparingMeeting")}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full bg-green-100 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-progress"></div>
        </div>

        {/* Decorative pet parade */}
        <div className="mt-6 flex justify-center space-x-4 opacity-70">
          <div className="animate-bounce-gentle delay-0">🐶</div>
          <div className="animate-bounce-gentle delay-300">🐱</div>
          <div className="animate-bounce-gentle delay-600">🐰</div>
          <div className="animate-bounce-gentle delay-900">🐹</div>
        </div>
      </div>

      {/* Background floating paws */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl text-white/20 animate-float-paw delay-0">
          🐾
        </div>
        <div className="absolute top-32 right-16 text-3xl text-white/15 animate-float-paw delay-1000">
          🐾
        </div>
        <div className="absolute bottom-32 left-20 text-4xl text-white/20 animate-float-paw delay-2000">
          🐾
        </div>
        <div className="absolute bottom-20 right-32 text-2xl text-white/15 animate-float-paw delay-1500">
          🐾
        </div>
        <div className="absolute top-1/2 left-10 text-3xl text-white/10 animate-float-paw delay-3000">
          🐾
        </div>
        <div className="absolute top-1/2 right-10 text-3xl text-white/10 animate-float-paw delay-2500">
          🐾
        </div>
      </div>

      <style jsx>{`
        @keyframes walk-right {
          0%,
          100% {
            transform: translateX(-50px) scale(1);
          }
          50% {
            transform: translateX(50px) scale(1.1);
          }
        }

        @keyframes walk-left {
          0%,
          100% {
            transform: translateX(50px) scale(1) scaleX(-1);
          }
          50% {
            transform: translateX(-50px) scale(1.1) scaleX(-1);
          }
        }

        @keyframes paw-step-1 {
          0%,
          20%,
          100% {
            opacity: 0.3;
            transform: translateY(0px) scale(0.8);
          }
          10% {
            opacity: 1;
            transform: translateY(-3px) scale(1);
          }
        }

        @keyframes paw-step-2 {
          10%,
          30%,
          100% {
            opacity: 0.4;
            transform: translateY(0px) scale(0.9);
          }
          20% {
            opacity: 1;
            transform: translateY(-3px) scale(1);
          }
        }

        @keyframes paw-step-3 {
          20%,
          40%,
          100% {
            opacity: 0.5;
            transform: translateY(0px) scale(0.9);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px) scale(1.1);
          }
        }

        @keyframes paw-step-4 {
          30%,
          50%,
          100% {
            opacity: 0.5;
            transform: translateY(0px) scale(0.9);
          }
          40% {
            opacity: 1;
            transform: translateY(-4px) scale(1.1);
          }
        }

        @keyframes paw-step-5 {
          40%,
          60%,
          100% {
            opacity: 0.4;
            transform: translateY(0px) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px) scale(1);
          }
        }

        @keyframes paw-step-6 {
          50%,
          70%,
          100% {
            opacity: 0.3;
            transform: translateY(0px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateY(-3px) scale(1);
          }
        }

        @keyframes paw-walk-1 {
          0%,
          100% {
            transform: translateX(-50%) translateY(2px) rotate(0deg);
          }
          25% {
            transform: translateX(-50%) translateY(-2px) rotate(5deg);
          }
          50% {
            transform: translateX(-50%) translateY(2px) rotate(0deg);
          }
          75% {
            transform: translateX(-50%) translateY(-2px) rotate(-5deg);
          }
        }

        @keyframes paw-walk-2 {
          0%,
          100% {
            transform: translateY(-50%) translateX(2px) rotate(0deg);
          }
          25% {
            transform: translateY(-50%) translateX(-2px) rotate(5deg);
          }
          50% {
            transform: translateY(-50%) translateX(2px) rotate(0deg);
          }
          75% {
            transform: translateY(-50%) translateX(-2px) rotate(-5deg);
          }
        }

        @keyframes paw-walk-3 {
          0%,
          100% {
            transform: translateX(-50%) translateY(-2px) rotate(0deg);
          }
          25% {
            transform: translateX(-50%) translateY(2px) rotate(5deg);
          }
          50% {
            transform: translateX(-50%) translateY(-2px) rotate(0deg);
          }
          75% {
            transform: translateX(-50%) translateY(2px) rotate(-5deg);
          }
        }

        @keyframes paw-walk-4 {
          0%,
          100% {
            transform: translateY(-50%) translateX(-2px) rotate(0deg);
          }
          25% {
            transform: translateY(-50%) translateX(2px) rotate(5deg);
          }
          50% {
            transform: translateY(-50%) translateX(-2px) rotate(0deg);
          }
          75% {
            transform: translateY(-50%) translateX(2px) rotate(-5deg);
          }
        }

        @keyframes float-heart {
          0%,
          100% {
            transform: translateX(-50%) translateY(0px) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-10px) scale(1.1);
          }
        }

        @keyframes float-paw {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.4;
          }
          66% {
            transform: translateY(-10px) rotate(-3deg);
            opacity: 0.3;
          }
        }

        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes bounce-smooth {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-walk-right {
          animation: walk-right 4s ease-in-out infinite;
        }
        .animate-walk-left {
          animation: walk-left 4s ease-in-out infinite;
        }
        .animate-paw-step-1 {
          animation: paw-step-1 2s ease-in-out infinite;
        }
        .animate-paw-step-2 {
          animation: paw-step-2 2s ease-in-out infinite;
        }
        .animate-paw-step-3 {
          animation: paw-step-3 2s ease-in-out infinite;
        }
        .animate-paw-step-4 {
          animation: paw-step-4 2s ease-in-out infinite;
        }
        .animate-paw-step-5 {
          animation: paw-step-5 2s ease-in-out infinite;
        }
        .animate-paw-step-6 {
          animation: paw-step-6 2s ease-in-out infinite;
        }
        .animate-paw-walk-1 {
          animation: paw-walk-1 3s ease-in-out infinite;
        }
        .animate-paw-walk-2 {
          animation: paw-walk-2 3s ease-in-out infinite 0.75s;
        }
        .animate-paw-walk-3 {
          animation: paw-walk-3 3s ease-in-out infinite 1.5s;
        }
        .animate-paw-walk-4 {
          animation: paw-walk-4 3s ease-in-out infinite 2.25s;
        }
        .animate-float-heart {
          animation: float-heart 2s ease-in-out infinite;
        }
        .animate-float-paw {
          animation: float-paw 6s ease-in-out infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-bounce-smooth {
          animation: bounce-smooth 1.5s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 4s linear infinite;
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 3s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BaseLoader;
