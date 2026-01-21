// src/components/bets/BetListWithCopy.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BetCard } from "./BetCard";
import { CopyBetModal } from "./CopyBetModal";
import type { Bet } from "@/lib/types";

interface BetListWithCopyProps {
  bets: Bet[];
  userBankroll: number | null;
  isAuthenticated: boolean;
}

export function BetListWithCopy({ bets, userBankroll, isAuthenticated }: BetListWithCopyProps) {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const router = useRouter();

  const handleCopyClick = (bet: Bet) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setSelectedBet(bet);
  };

  const handleCopySuccess = () => {
    setSelectedBet(null);
    router.refresh();
  };

  return (
    <>
      <div className="space-y-3">
        {bets.map((bet) => (
          <BetCard
            key={bet.id}
            bet={bet}
            onCopy={bet.status === 'OPEN' ? () => handleCopyClick(bet) : undefined}
          />
        ))}
      </div>

      {selectedBet && userBankroll !== null && (
        <CopyBetModal
          bet={selectedBet}
          userBankroll={userBankroll}
          onClose={() => setSelectedBet(null)}
          onSuccess={handleCopySuccess}
        />
      )}
    </>
  );
}
