// src/components/bets/CopyBetModal.tsx
"use client";

import { useState, useTransition } from "react";
import { copyBet } from "@/app/actions/position";
import { Card } from "@/components/ui/Card";
import type { Bet } from "@/lib/types";

interface CopyBetModalProps {
  bet: Bet;
  userBankroll: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CopyBetModal({ bet, userBankroll, onClose, onSuccess }: CopyBetModalProps) {
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = () => {
    if (amount > userBankroll) {
      setError("Insufficient bankroll");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    startTransition(async () => {
      const result = await copyBet(bet, amount);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  };

  const inputStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-secondary)",
    color: "var(--color-text)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            COPY BET
          </h2>
          <button
            onClick={onClose}
            className="text-lg hover:opacity-80"
            style={{ color: "var(--color-muted)" }}
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--color-bg)" }}>
          <p className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
            {bet.market_question}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="px-2 py-1 rounded"
              style={{
                backgroundColor: bet.side === 'YES' ? 'var(--color-success)' : 'var(--color-danger)',
                color: 'var(--color-bg)',
              }}
            >
              {bet.side}
            </span>
            <span style={{ color: "var(--color-muted)" }}>
              @ {(bet.current_odds || bet.entry_odds).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-xs mb-2"
            style={{ color: "var(--color-muted)" }}
          >
            Amount to bet
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded text-sm"
              style={inputStyle}
              min={1}
              max={userBankroll}
            />
            <button
              onClick={() => setAmount(Math.floor(userBankroll * 0.1))}
              className="px-3 py-2 rounded text-xs"
              style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-text)" }}
            >
              10%
            </button>
            <button
              onClick={() => setAmount(Math.floor(userBankroll * 0.25))}
              className="px-3 py-2 rounded text-xs"
              style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-text)" }}
            >
              25%
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
            Available: ${userBankroll.toLocaleString()}
          </p>
        </div>

        <div className="mb-4 p-3 rounded" style={{ backgroundColor: "var(--color-bg)" }}>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "var(--color-muted)" }}>Potential return if {bet.side}:</span>
            <span style={{ color: "var(--color-success)" }}>
              ${(amount / (bet.current_odds || bet.entry_odds)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--color-muted)" }}>Potential profit:</span>
            <span style={{ color: "var(--color-success)" }}>
              +${((amount / (bet.current_odds || bet.entry_odds)) - amount).toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs mb-4" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded text-sm"
            style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-text)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={isPending}
            className="flex-1 py-2 rounded text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text)" }}
          >
            {isPending ? "Copying..." : "Copy Bet"}
          </button>
        </div>
      </Card>
    </div>
  );
}
