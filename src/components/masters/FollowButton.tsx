// src/components/masters/FollowButton.tsx
"use client";

import { useState, useTransition } from "react";
import { followMaster, unfollowMaster } from "@/app/actions/follow";

interface FollowButtonProps {
  masterId: string;
  isFollowing: boolean;
  isAuthenticated: boolean;
}

export function FollowButton({ masterId, isFollowing, isAuthenticated }: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(isFollowing);

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        }}
      >
        Sign in to Follow
      </a>
    );
  }

  const handleClick = () => {
    startTransition(async () => {
      if (following) {
        const result = await unfollowMaster(masterId);
        if (!result.error) {
          setFollowing(false);
        }
      } else {
        const result = await followMaster(masterId);
        if (!result.error) {
          setFollowing(true);
        }
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 rounded text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        backgroundColor: following ? "var(--color-secondary)" : "var(--color-primary)",
        color: "var(--color-text)",
        border: following ? "1px solid var(--color-muted)" : "none",
      }}
    >
      {isPending ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
