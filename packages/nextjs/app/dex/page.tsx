"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { LiquidityPanel } from "~~/components/example-ui/LiquidityPanel";
import { SwapPanel } from "~~/components/example-ui/SwapPanel";

const DEX: NextPage = () => {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"swap" | "liquidity">("swap");

  if (!isConnected) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/20 via-black to-sky-900/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative w-full max-w-md mx-4">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-3xl blur opacity-20"></div>

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-sky-950/40 to-black border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl">
            {/* Decorative element */}
            <div className="absolute top-4 right-4 w-8 h-8 border border-sky-400/30 rounded-lg rotate-45"></div>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full"></div>
                <div className="relative w-16 h-16 bg-black/40 border border-sky-500/30 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">💱</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                Simple DEX
              </h2>

              {/* Message */}
              <p className="text-sky-400/70 text-sm max-w-xs leading-relaxed">
                Please connect your wallet to use the DEX
              </p>

              {/* Decorative dots */}
              <div className="flex gap-2 pt-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-sky-500/30 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950/20 via-black to-sky-900/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-12 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full"></div>
            <h1 className="relative text-5xl font-bold bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500 bg-clip-text text-transparent mb-4">
              💱 Simple DEX
            </h1>
          </div>
          <p className="text-sky-400/70 text-lg">
            Swap tokens and provide liquidity using automated market maker (AMM)
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-black/40 border border-sky-500/30 rounded-2xl p-1.5 backdrop-blur-sm">
            <button
              className={`px-8 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === "swap"
                  ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "text-sky-400/70 hover:text-sky-300 hover:bg-sky-500/10"
              }`}
              onClick={() => setActiveTab("swap")}
            >
              <span>💱</span>
              Swap
            </button>
            <button
              className={`px-8 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === "liquidity"
                  ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-500/30"
                  : "text-sky-400/70 hover:text-sky-300 hover:bg-sky-500/10"
              }`}
              onClick={() => setActiveTab("liquidity")}
            >
              <span>💧</span>
              Liquidity
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex justify-center">{activeTab === "swap" ? <SwapPanel /> : <LiquidityPanel />}</div>
      </div>
    </div>
  );
};

export default DEX;
