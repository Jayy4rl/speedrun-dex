"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Logo } from "~~/components/Logo";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-950/20 via-black to-sky-900/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 flex items-center flex-col pt-20 px-5">
        {/* Hero Section */}
        <div className="flex flex-col gap-6 items-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full"></div>
            <h1 className="relative text-center">
              <span className="block text-sky-400 text-sm font-semibold tracking-widest uppercase mb-3">
                Welcome to
              </span>
              <span className="flex items-center gap-4 text-6xl font-bold bg-gradient-to-r from-sky-300 via-sky-400 to-sky-500 bg-clip-text text-transparent">
                <Logo size={56} /> Scaffold-Lisk
              </span>
            </h1>
          </div>

          {/* Connected Address Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative flex items-center gap-3 bg-black border border-sky-500/30 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
              <p className="text-sky-300 font-medium text-sm">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          </div>

          {/* Code Instructions */}
          <div className="max-w-2xl space-y-3">
            <p className="text-center text-sky-400/70 leading-relaxed">
              Get started by editing{" "}
              <code className="bg-black/60 border border-sky-500/30 text-sky-300 px-2 py-1 rounded-lg text-sm font-mono">
                packages/nextjs/app/page.tsx
              </code>
            </p>
            <p className="text-center text-sky-400/70 leading-relaxed">
              Edit your smart contract{" "}
              <code className="bg-black/60 border border-sky-500/30 text-sky-300 px-2 py-1 rounded-lg text-sm font-mono">
                YourContract.sol
              </code>{" "}
              in{" "}
              <code className="bg-black/60 border border-sky-500/30 text-sky-300 px-2 py-1 rounded-lg text-sm font-mono">
                packages/hardhat/contracts
              </code>
            </p>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="w-full max-w-7xl pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            {/* Debug Contracts Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative h-full bg-gradient-to-br from-sky-950/40 to-black border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl hover:border-sky-500/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-black/40 border border-sky-500/30 rounded-2xl flex items-center justify-center">
                    <BugAntIcon className="h-8 w-8 text-sky-400" />
                  </div>
                  <p className="text-sky-300 leading-relaxed">
                    Tinker with your smart contract using the{" "}
                    <Link
                      href="/debug"
                      passHref
                      className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                    >
                      Debug Contracts
                    </Link>{" "}
                    tab.
                  </p>
                </div>
              </div>
            </div>

            {/* Block Explorer Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative h-full bg-gradient-to-br from-black to-sky-950/40 border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl hover:border-sky-500/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-black/40 border border-sky-500/30 rounded-2xl flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-8 w-8 text-sky-400" />
                  </div>
                  <p className="text-sky-300 leading-relaxed">
                    Explore your local transactions with the{" "}
                    <Link
                      href="/blockexplorer"
                      passHref
                      className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                    >
                      Block Explorer
                    </Link>{" "}
                    tab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pb-10 flex gap-2 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-sky-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
