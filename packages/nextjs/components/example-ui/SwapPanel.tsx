"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const SwapPanel = () => {
  const { address: connectedAddress } = useAccount();
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isTokenAInput, setIsTokenAInput] = useState(true); // true = MTK->sUSDC, false = sUSDC->MTK
  const [isApprovedA, setIsApprovedA] = useState(false);
  const [isApprovedB, setIsApprovedB] = useState(false);

  // Get token addresses from DEX contract
  const { data: tokenAAddress } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "tokenA",
  });

  const { data: tokenBAddress } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "tokenB",
  });

  // Get token balances
  const { data: balanceA } = useScaffoldContractRead({
    contractName: "MyToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: balanceB } = useScaffoldContractRead({
    contractName: "SimpleUSDC",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Get token symbols
  const { data: symbolA } = useScaffoldContractRead({
    contractName: "MyToken",
    functionName: "symbol",
  });

  const { data: symbolB } = useScaffoldContractRead({
    contractName: "SimpleUSDC",
    functionName: "symbol",
  });

  // Check approvals
  const { data: allowanceA, refetch: refetchAllowanceA } = useScaffoldContractRead({
    contractName: "MyToken",
    functionName: "allowance",
    args: [connectedAddress, tokenAAddress],
  });

  const { data: allowanceB, refetch: refetchAllowanceB } = useScaffoldContractRead({
    contractName: "SimpleUSDC",
    functionName: "allowance",
    args: [connectedAddress, tokenBAddress],
  });

  // Update approval status
  useEffect(() => {
    if (inputAmount && allowanceA && allowanceB) {
      const inputAmountBN = parseUnits(inputAmount, isTokenAInput ? 18 : 6);
      setIsApprovedA(allowanceA >= inputAmountBN);
      setIsApprovedB(allowanceB >= inputAmountBN);
    }
  }, [inputAmount, allowanceA, allowanceB, isTokenAInput]);

  // Get swap quote
  const { data: swapQuote } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getSwapAmount",
    args: [
      isTokenAInput ? tokenAAddress : tokenBAddress,
      inputAmount ? parseUnits(inputAmount, isTokenAInput ? 18 : 6) : 0n,
    ],
  });

  // Update output amount when quote changes
  useEffect(() => {
    if (swapQuote) {
      const formatted = formatUnits(swapQuote, isTokenAInput ? 6 : 18);
      setOutputAmount(parseFloat(formatted).toFixed(6));
    } else {
      setOutputAmount("");
    }
  }, [swapQuote, isTokenAInput]);

  // Approve functions
  const { writeAsync: approveTokenA } = useScaffoldContractWrite({
    contractName: "MyToken",
    functionName: "approve",
    args: [tokenAAddress, parseUnits("1000000", 18)], // Approve large amount
  });

  const { writeAsync: approveTokenB } = useScaffoldContractWrite({
    contractName: "SimpleUSDC",
    functionName: "approve",
    args: [tokenBAddress, parseUnits("1000000", 6)], // Approve large amount
  });

  // Swap function
  const { writeAsync: executeSwap } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "swap",
    args: [
      isTokenAInput ? tokenAAddress : tokenBAddress,
      inputAmount ? parseUnits(inputAmount, isTokenAInput ? 18 : 6) : 0n,
    ],
  });

  const handleApprove = async () => {
    try {
      if (isTokenAInput) {
        await approveTokenA();
        notification.success("Token A approved!");
        setTimeout(() => refetchAllowanceA(), 2000);
      } else {
        await approveTokenB();
        notification.success("Token B approved!");
        setTimeout(() => refetchAllowanceB(), 2000);
      }
    } catch (error) {
      console.error("Approval failed:", error);
      notification.error("Approval failed");
    }
  };

  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      notification.error("Enter a valid amount");
      return;
    }

    try {
      await executeSwap();
      notification.success("Swap successful!");
      setInputAmount("");
      setOutputAmount("");
    } catch (error) {
      console.error("Swap failed:", error);
      notification.error("Swap failed");
    }
  };

  const handleFlipTokens = () => {
    setIsTokenAInput(!isTokenAInput);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0.0";
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  const needsApproval = isTokenAInput ? !isApprovedA : !isApprovedB;

  return (
    <div className="relative w-full max-w-md">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-3xl blur opacity-20"></div>

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-sky-950/40 to-black border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl">
        {/* Decorative dots */}
        <div className="absolute top-4 right-4">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></div>
            <div
              className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
            Swap Tokens
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-sky-500 to-transparent rounded-full mt-2 mx-auto"></div>
        </div>

        {/* Input Token */}
        <div className="mb-4">
          <label className="flex justify-between mb-2">
            <span className="text-sky-300 text-sm font-medium">From</span>
            <span className="text-sky-400/60 text-xs">
              Balance: {formatBalance(isTokenAInput ? balanceA : balanceB, isTokenAInput ? 18 : 6)}{" "}
              {isTokenAInput ? symbolA : symbolB}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              className="w-full bg-black/40 border border-sky-500/30 rounded-xl pl-4 pr-24 py-3 text-sky-100 placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300 font-medium text-sm">
              {isTokenAInput ? symbolA : symbolB}
            </span>
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center my-4">
          <button
            className="w-10 h-10 bg-black/40 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400/50 rounded-full flex items-center justify-center text-sky-300 hover:text-sky-200 transition-all transform hover:rotate-180 duration-300"
            onClick={handleFlipTokens}
          >
            <span className="text-xl">⇅</span>
          </button>
        </div>

        {/* Output Token */}
        <div className="mb-5">
          <label className="flex justify-between mb-2">
            <span className="text-sky-300 text-sm font-medium">To</span>
            <span className="text-sky-400/60 text-xs">
              Balance: {formatBalance(isTokenAInput ? balanceB : balanceA, isTokenAInput ? 6 : 18)}{" "}
              {isTokenAInput ? symbolB : symbolA}
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.0"
              className="w-full bg-black/40 border border-sky-500/30 rounded-xl pl-4 pr-24 py-3 text-sky-100 placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
              value={outputAmount}
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-300 font-medium text-sm">
              {isTokenAInput ? symbolB : symbolA}
            </span>
          </div>
        </div>

        {/* Exchange Rate */}
        {inputAmount && outputAmount && (
          <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl p-4 mb-6">
            <span className="text-sky-300 text-sm">
              Rate: 1 {isTokenAInput ? symbolA : symbolB} ≈{" "}
              {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(6)} {isTokenAInput ? symbolB : symbolA}
            </span>
          </div>
        )}

        {/* Action Button */}
        {needsApproval ? (
          <button
            className="w-full bg-black/40 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400/50 text-sky-300 hover:text-sky-200 rounded-xl py-3 font-medium transition-all"
            onClick={handleApprove}
          >
            Approve {isTokenAInput ? symbolA : symbolB}
          </button>
        ) : (
          <button
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={handleSwap}
            disabled={!inputAmount || parseFloat(inputAmount) <= 0}
          >
            Swap
          </button>
        )}
      </div>
    </div>
  );
};
