"use client";

import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const LiquidityPanel = () => {
  const { address: connectedAddress } = useAccount();
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [isApprovedA, setIsApprovedA] = useState(false);
  const [isApprovedB, setIsApprovedB] = useState(false);

  // Get token addresses
  const { data: tokenAAddress } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "tokenA",
  });

  const { data: tokenBAddress } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "tokenB",
  });

  // Get reserves
  const { data: reserves } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getReserves",
  });

  const reserveA = reserves?.[0] || 0n;
  const reserveB = reserves?.[1] || 0n;
  const totalLiquidity = reserves?.[2] || 0n;

  // Get user liquidity
  const { data: userLiquidityData, refetch: refetchUserLiquidity } = useScaffoldContractRead({
    contractName: "SimpleDEX",
    functionName: "getUserLiquidity",
    args: [connectedAddress],
  });

  const userLiquidity = userLiquidityData?.[0] || 0n;
  const userShareBasisPoints = userLiquidityData?.[1] || 0n;
  const userSharePercent = Number(userShareBasisPoints) / 100; // Convert basis points to percent

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
    if (amountA && amountB && allowanceA && allowanceB) {
      const amountABN = parseUnits(amountA, 18);
      const amountBBN = parseUnits(amountB, 6);
      setIsApprovedA(allowanceA >= amountABN);
      setIsApprovedB(allowanceB >= amountBBN);
    }
  }, [amountA, amountB, allowanceA, allowanceB]);

  // Approve functions
  const { writeAsync: approveTokenA } = useScaffoldContractWrite({
    contractName: "MyToken",
    functionName: "approve",
    args: [tokenAAddress, parseUnits("1000000", 18)],
  });

  const { writeAsync: approveTokenB } = useScaffoldContractWrite({
    contractName: "SimpleUSDC",
    functionName: "approve",
    args: [tokenBAddress, parseUnits("1000000", 6)],
  });

  // Add liquidity
  const { writeAsync: addLiquidity } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "addLiquidity",
    args: [amountA ? parseUnits(amountA, 18) : 0n, amountB ? parseUnits(amountB, 6) : 0n],
  });

  // Remove liquidity
  const { writeAsync: removeLiquidity } = useScaffoldContractWrite({
    contractName: "SimpleDEX",
    functionName: "removeLiquidity",
    args: [removeAmount ? parseUnits(removeAmount, 18) : 0n],
  });

  const handleApproveA = async () => {
    try {
      await approveTokenA();
      notification.success("Token A approved!");
      setTimeout(() => refetchAllowanceA(), 2000);
    } catch (error) {
      console.error("Approval failed:", error);
      notification.error("Approval failed");
    }
  };

  const handleApproveB = async () => {
    try {
      await approveTokenB();
      notification.success("Token B approved!");
      setTimeout(() => refetchAllowanceB(), 2000);
    } catch (error) {
      console.error("Approval failed:", error);
      notification.error("Approval failed");
    }
  };

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      notification.error("Enter valid amounts");
      return;
    }

    try {
      await addLiquidity();
      notification.success("Liquidity added!");
      setAmountA("");
      setAmountB("");
      setTimeout(() => refetchUserLiquidity(), 2000);
    } catch (error) {
      console.error("Add liquidity failed:", error);
      notification.error("Add liquidity failed");
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!removeAmount || parseFloat(removeAmount) <= 0) {
      notification.error("Enter valid amount");
      return;
    }

    try {
      await removeLiquidity();
      notification.success("Liquidity removed!");
      setRemoveAmount("");
      setTimeout(() => refetchUserLiquidity(), 2000);
    } catch (error) {
      console.error("Remove liquidity failed:", error);
      notification.error("Remove liquidity failed");
    }
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0.0";
    return parseFloat(formatUnits(balance, decimals)).toFixed(4);
  };

  // Calculate expected output for removing liquidity
  const expectedA =
    removeAmount && totalLiquidity > 0n ? (parseUnits(removeAmount, 18) * reserveA) / totalLiquidity : 0n;
  const expectedB =
    removeAmount && totalLiquidity > 0n ? (parseUnits(removeAmount, 18) * reserveB) / totalLiquidity : 0n;

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      {/* Pool Stats */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-3xl blur opacity-20"></div>

        <div className="relative bg-gradient-to-br from-sky-950/40 to-black border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
              Pool Statistics
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-sky-500 to-transparent rounded-full mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 border border-sky-500/20 rounded-2xl p-6 hover:border-sky-500/40 transition-colors">
              <div className="text-sky-400/70 text-xs font-medium uppercase tracking-wider mb-2">Reserve {symbolA}</div>
              <div className="text-3xl font-bold text-sky-300">{formatBalance(reserveA, 18)}</div>
            </div>

            <div className="bg-black/40 border border-sky-500/20 rounded-2xl p-6 hover:border-sky-500/40 transition-colors">
              <div className="text-sky-400/70 text-xs font-medium uppercase tracking-wider mb-2">Reserve {symbolB}</div>
              <div className="text-3xl font-bold text-sky-300">{formatBalance(reserveB, 6)}</div>
            </div>

            <div className="bg-black/40 border border-sky-500/20 rounded-2xl p-6 hover:border-sky-500/40 transition-colors">
              <div className="text-sky-400/70 text-xs font-medium uppercase tracking-wider mb-2">Your Share</div>
              <div className="text-3xl font-bold text-sky-300">{userSharePercent.toFixed(2)}%</div>
              <div className="text-sky-400/60 text-sm mt-1">{formatBalance(userLiquidity, 18)} LP tokens</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Liquidity */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 to-sky-400 rounded-3xl blur opacity-20"></div>

          <div className="relative bg-gradient-to-br from-sky-950/40 to-black border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                Add Liquidity
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-sky-500 to-transparent rounded-full mt-2"></div>
            </div>

            {/* Token A Input */}
            <div className="mb-5">
              <label className="flex justify-between mb-2">
                <span className="text-sky-300 text-sm font-medium">{symbolA} Amount</span>
                <span className="text-sky-400/60 text-xs">Balance: {formatBalance(balanceA, 18)}</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="w-full bg-black/40 border border-sky-500/30 rounded-xl px-4 py-3 text-sky-100 placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                value={amountA}
                onChange={e => setAmountA(e.target.value)}
              />
            </div>

            {/* Token B Input */}
            <div className="mb-5">
              <label className="flex justify-between mb-2">
                <span className="text-sky-300 text-sm font-medium">{symbolB} Amount</span>
                <span className="text-sky-400/60 text-xs">Balance: {formatBalance(balanceB, 6)}</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="w-full bg-black/40 border border-sky-500/30 rounded-xl px-4 py-3 text-sky-100 placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                value={amountB}
                onChange={e => setAmountB(e.target.value)}
              />
            </div>

            {/* Pool Ratio Info */}
            {reserveA > 0n && reserveB > 0n && (
              <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl p-4 mb-6">
                <span className="text-sky-300 text-xs">
                  Current pool ratio: 1 {symbolA} ={" "}
                  {(Number(formatUnits(reserveB, 6)) / Number(formatUnits(reserveA, 18))).toFixed(4)} {symbolB}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {!isApprovedA && (
                <button
                  className="w-full bg-black/40 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400/50 text-sky-300 hover:text-sky-200 rounded-xl py-2.5 font-medium transition-all"
                  onClick={handleApproveA}
                >
                  Approve {symbolA}
                </button>
              )}
              {!isApprovedB && (
                <button
                  className="w-full bg-black/40 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400/50 text-sky-300 hover:text-sky-200 rounded-xl py-2.5 font-medium transition-all"
                  onClick={handleApproveB}
                >
                  Approve {symbolB}
                </button>
              )}
              {isApprovedA && isApprovedB && (
                <button
                  className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={handleAddLiquidity}
                  disabled={!amountA || !amountB}
                >
                  Add Liquidity
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Remove Liquidity */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 to-sky-600 rounded-3xl blur opacity-20"></div>

          <div className="relative bg-gradient-to-br from-black to-sky-950/40 border border-sky-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
                Remove Liquidity
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-sky-500 to-transparent rounded-full mt-2"></div>
            </div>

            {/* LP Token Input */}
            <div className="mb-5">
              <label className="flex justify-between mb-2">
                <span className="text-sky-300 text-sm font-medium">LP Token Amount</span>
                <span className="text-sky-400/60 text-xs">Available: {formatBalance(userLiquidity, 18)}</span>
              </label>
              <input
                type="number"
                placeholder="0.0"
                className="w-full bg-black/40 border border-sky-500/30 rounded-xl px-4 py-3 text-sky-100 placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                value={removeAmount}
                onChange={e => setRemoveAmount(e.target.value)}
              />
            </div>

            {/* Expected Output */}
            {removeAmount && (
              <div className="bg-sky-500/20 border border-sky-500/30 rounded-2xl p-4 mb-6">
                <div className="text-sky-300 text-xs space-y-1">
                  <p className="font-semibold mb-2">You will receive:</p>
                  <p>
                    • {formatBalance(expectedA, 18)} {symbolA}
                  </p>
                  <p>
                    • {formatBalance(expectedB, 6)} {symbolB}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={handleRemoveLiquidity}
              disabled={!removeAmount || parseFloat(removeAmount) <= 0}
            >
              Remove Liquidity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
