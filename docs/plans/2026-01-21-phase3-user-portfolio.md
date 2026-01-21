# Phase 3: User Portfolio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add user authentication, follow/unfollow masters, and display user's portfolio with virtual bankroll.

**Architecture:** Supabase Auth for email + Google login. Server-side session management with cookies. User profile stored in `users` table linked to `auth.users`. Follow relationships in `follows` table. Portfolio page shows followed masters and virtual bankroll.

**Tech Stack:** Next.js 16 App Router, Supabase Auth, @supabase/ssr for cookie-based sessions, TypeScript

---

## Prerequisites

In Supabase Dashboard:
1. Go to **Authentication > Providers**
2. Ensure **Email** is enabled
3. For Google OAuth (optional for MVP): Configure Google provider with OAuth credentials

---

## Task 1: Add User Types

**Files:**
- Modify: `src/lib/types.ts`

**Step 1: Add user-related types to the existing file**

Add these types at the end of `src/lib/types.ts`:

```typescript
// User types
export interface User {
  id: string;
  username: string;
  virtual_bankroll: number;
  level: number;
  xp: number;
  created_at: string;
}

export interface Follow {
  user_id: string;
  master_id: string;
  created_at: string;
}

export interface UserWithFollows extends User {
  follows: Follow[];
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add user and follow types"
```

---

## Task 2: Create Users and Follows Database Tables

**Files:**
- Create: `supabase/migrations/002_users_follows.sql`

**Step 1: Create the migration file**

```sql
-- supabase/migrations/002_users_follows.sql

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  virtual_bankroll DECIMAL(12,2) DEFAULT 10000.00,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID REFERENCES masters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, master_id)
);

-- Indexes
CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_master_id ON follows(master_id);
CREATE INDEX idx_users_username ON users(username);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Follows policies
CREATE POLICY "Users can view their own follows" ON follows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can follow masters" ON follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow masters" ON follows
  FOR DELETE USING (auth.uid() = user_id);

-- Public read: Allow anyone to see follow counts (for master profiles)
CREATE POLICY "Anyone can count follows" ON follows
  FOR SELECT USING (true);
```

**Step 2: Run migration in Supabase**

In Supabase Dashboard > SQL Editor:
1. Paste the SQL
2. Run it

**Step 3: Verify tables exist**

In Table Editor, confirm:
- `users` table exists
- `follows` table exists

**Step 4: Commit**

```bash
git add supabase/migrations/002_users_follows.sql
git commit -m "feat: add users and follows database tables"
```

---

## Task 3: Install Supabase SSR Package

**Step 1: Install the package**

```bash
npm install @supabase/ssr
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @supabase/ssr for cookie-based auth"
```

---

## Task 4: Create Supabase Auth Utilities

**Files:**
- Create: `src/lib/supabase-server.ts`
- Create: `src/lib/supabase-browser.ts`

**Step 1: Create server-side Supabase client**

```typescript
// src/lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
```

**Step 2: Create browser-side Supabase client**

```typescript
// src/lib/supabase-browser.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/supabase-server.ts src/lib/supabase-browser.ts
git commit -m "feat: add Supabase SSR clients for server and browser"
```

---

## Task 5: Create Auth Middleware

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create middleware for session refresh**

```typescript
// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware for session refresh"
```

---

## Task 6: Create Login Page

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`

**Step 1: Create login actions (server actions)**

```typescript
// src/app/login/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  // First, sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user" };
  }

  // Then create the user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    username,
    virtual_bankroll: 10000,
    level: 1,
    xp: 0,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
```

**Step 2: Create login page**

```tsx
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { login, signup } from "./actions";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isSignUp ? await signup(formData) : await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-secondary)",
    color: "var(--color-text)",
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            {isSignUp ? "JOIN THE GUILD" : "ENTER THE GUILD"}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {isSignUp
              ? "Create your account and start learning"
              : "Welcome back, apprentice"}
          </p>
        </div>

        <Card>
          <form action={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs mb-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded text-sm"
                  style={inputStyle}
                  placeholder="your_handle"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 rounded text-sm"
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded text-sm"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-muted)" }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>

        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--color-muted)" }}
        >
          <Link href="/" className="hover:opacity-80 transition-opacity">
            ← Back to Masters
          </Link>
        </p>
      </div>
    </main>
  );
}
```

**Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/login/
git commit -m "feat: add login and signup page with email auth"
```

---

## Task 7: Update Header with Auth State

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Update Header to show auth state**

```tsx
// src/components/layout/Header.tsx
import Link from "next/link";
import { getUser } from "@/lib/supabase-server";
import { logout } from "@/app/login/actions";

export async function Header() {
  const user = await getUser();

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3"
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-secondary)",
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span
            className="text-lg"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            ♠
          </span>
          <span
            className="text-sm hidden sm:inline"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-text)" }}
          >
            THE GUILD
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            Masters
          </Link>

          {user ? (
            <>
              <Link
                href="/portfolio"
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-muted)" }}
              >
                Portfolio
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--color-muted)" }}
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-3 py-1 rounded transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-text)",
              }}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: update header with auth state and logout"
```

---

## Task 8: Create User Queries

**Files:**
- Modify: `src/lib/queries.ts`

**Step 1: Add user-related query functions**

Add these functions at the end of `src/lib/queries.ts`:

```typescript
// Add these imports at the top if not already present
import type { User, Follow } from "./types";

// User queries
export async function getUserFollows(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("master_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching follows:", error);
    return [];
  }

  return data.map((f) => f.master_id);
}

export async function isFollowingMaster(userId: string, masterId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("master_id")
    .eq("user_id", userId)
    .eq("master_id", masterId)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

export async function getFollowedMasters(userId: string): Promise<MasterWithStats[]> {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      master:masters (
        *,
        master_stats (*)
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching followed masters:", error);
    return [];
  }

  return data.map((f: any) => f.master) as MasterWithStats[];
}

export async function getMasterFollowerCount(masterId: string): Promise<number> {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("master_id", masterId);

  if (error) {
    console.error("Error fetching follower count:", error);
    return 0;
  }

  return count || 0;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add user follow query functions"
```

---

## Task 9: Create Follow/Unfollow Actions

**Files:**
- Create: `src/app/actions/follow.ts`

**Step 1: Create follow actions**

```typescript
// src/app/actions/follow.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export async function followMaster(masterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("follows").insert({
    user_id: user.id,
    master_id: masterId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true };
}

export async function unfollowMaster(masterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("user_id", user.id)
    .eq("master_id", masterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true };
}
```

**Step 2: Commit**

```bash
mkdir -p src/app/actions
git add src/app/actions/follow.ts
git commit -m "feat: add follow/unfollow server actions"
```

---

## Task 10: Create Follow Button Component

**Files:**
- Create: `src/components/masters/FollowButton.tsx`

**Step 1: Create the follow button**

```tsx
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
```

**Step 2: Update masters index export**

```tsx
// src/components/masters/index.ts
export { MasterCard } from "./MasterCard";
export { LeaderboardFilters } from "./LeaderboardFilters";
export { FollowButton } from "./FollowButton";
```

**Step 3: Commit**

```bash
git add src/components/masters/FollowButton.tsx src/components/masters/index.ts
git commit -m "feat: add follow button component"
```

---

## Task 11: Add Follow Button to Master Profile

**Files:**
- Modify: `src/app/masters/[username]/page.tsx`

**Step 1: Update master profile page with follow button**

Add imports at the top:
```tsx
import { getUser } from "@/lib/supabase-server";
import { isFollowingMaster, getMasterFollowerCount } from "@/lib/queries";
import { FollowButton } from "@/components/masters";
```

After fetching the master, add:
```tsx
const user = await getUser();
const isFollowing = user ? await isFollowingMaster(user.id, master.id) : false;
const followerCount = await getMasterFollowerCount(master.id);
```

In the profile header section, add the follow button and follower count after the streak emoji:
```tsx
<div className="flex items-center gap-4">
  {stats?.current_streak && Math.abs(stats.current_streak) >= 3 && (
    <span className="text-2xl">
      {"🔥".repeat(Math.min(Math.abs(stats.current_streak), 5))}
    </span>
  )}
  <FollowButton
    masterId={master.id}
    isFollowing={isFollowing}
    isAuthenticated={!!user}
  />
</div>
```

Add follower count stat in the stats grid:
```tsx
<Stat label="Followers" value={followerCount} />
```

**Full updated file:**

```tsx
// src/app/masters/[username]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMasterByUsername, getMasterBets, isFollowingMaster, getMasterFollowerCount } from "@/lib/queries";
import { getUser } from "@/lib/supabase-server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { BetCard } from "@/components/bets";
import { FollowButton } from "@/components/masters";

interface PageProps {
  params: Promise<{ username: string }>;
}

export const revalidate = 60;

export default async function MasterProfilePage({ params }: PageProps) {
  const { username } = await params;
  const master = await getMasterByUsername(username);

  if (!master) {
    notFound();
  }

  const [bets, user, followerCount] = await Promise.all([
    getMasterBets(master.id, { limit: 10 }),
    getUser(),
    getMasterFollowerCount(master.id),
  ]);

  const isFollowing = user ? await isFollowingMaster(user.id, master.id) : false;
  const stats = master.master_stats;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-muted)" }}
        >
          ← Back to Masters
        </Link>

        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: "var(--color-secondary)",
                  fontFamily: "var(--font-pixel)",
                  color: "var(--color-accent)",
                }}
              >
                #{stats?.rank || "—"}
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl"
                  style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
                >
                  {master.display_name}
                </h1>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  @{master.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {stats?.current_streak && Math.abs(stats.current_streak) >= 3 && (
                <span className="text-2xl">
                  {"🔥".repeat(Math.min(Math.abs(stats.current_streak), 5))}
                </span>
              )}
              <FollowButton
                masterId={master.id}
                isFollowing={isFollowing}
                isAuthenticated={!!user}
              />
            </div>
          </div>

          {master.bio && (
            <p className="text-sm mb-4" style={{ color: "var(--color-text)" }}>
              {master.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {master.primary_markets.map((market) => (
              <Badge key={market}>{market}</Badge>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4" style={{ borderTop: "1px solid var(--color-secondary)" }}>
            <Stat label="Total Bets" value={stats?.total_bets || 0} />
            <Stat
              label="Win Rate"
              value={stats?.win_rate ? `${stats.win_rate.toFixed(1)}%` : "—"}
            />
            <Stat
              label="Total Return"
              value={stats?.total_return ? `+${stats.total_return.toFixed(0)}%` : "—"}
              variant={stats?.total_return && stats.total_return > 0 ? "success" : "default"}
            />
            <Stat label="Followers" value={followerCount} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Stat label="Wins" value={stats?.wins || 0} variant="success" />
            <Stat label="Losses" value={stats?.losses || 0} variant="danger" />
            <Stat
              label="Current Streak"
              value={stats?.current_streak ? (stats.current_streak > 0 ? `${stats.current_streak}W` : `${Math.abs(stats.current_streak)}L`) : "—"}
              variant={stats?.current_streak && stats.current_streak > 0 ? "success" : stats?.current_streak && stats.current_streak < 0 ? "danger" : "default"}
            />
            <Stat label="Best Streak" value={stats?.best_streak ? `${stats.best_streak}W` : "—"} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Stat label="Contrarian Score" value={`${stats?.contrarian_score || 50}/100`} />
            <Stat label="Open Positions" value={stats?.pending || 0} />
          </div>
        </Card>

        {/* Recent Bets */}
        <div className="mb-4">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            RECENT BETS
          </h2>

          {bets.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No bets yet.
            </p>
          ) : (
            <div className="space-y-3">
              {bets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/masters/[username]/page.tsx
git commit -m "feat: add follow button to master profile page"
```

---

## Task 12: Create Portfolio Page

**Files:**
- Create: `src/app/portfolio/page.tsx`

**Step 1: Create portfolio page**

```tsx
// src/app/portfolio/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getUserProfile } from "@/lib/supabase-server";
import { getFollowedMasters } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { MasterCard } from "@/components/masters";

export const revalidate = 60;

export default async function PortfolioPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, followedMasters] = await Promise.all([
    getUserProfile(),
    getFollowedMasters(user.id),
  ]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-xl md:text-3xl mb-2"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-primary)" }}
          >
            YOUR HAND
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            Your portfolio and followed masters
          </p>
        </div>

        {/* Bankroll Card */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
            >
              VIRTUAL BANKROLL
            </h2>
            <span
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-muted)",
              }}
            >
              Level {profile?.level || 1}
            </span>
          </div>

          <div className="text-center py-4">
            <p
              className="text-4xl font-bold"
              style={{ color: "var(--color-success)" }}
            >
              ${(profile?.virtual_bankroll || 10000).toLocaleString()}
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--color-muted)" }}
            >
              Starting balance: $10,000
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: "1px solid var(--color-secondary)" }}>
            <Stat label="XP" value={profile?.xp || 0} />
            <Stat label="Level" value={profile?.level || 1} />
            <Stat label="Following" value={followedMasters.length} />
          </div>
        </Card>

        {/* Followed Masters */}
        <div className="mb-4">
          <h2
            className="text-sm mb-4"
            style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
          >
            FOLLOWING ({followedMasters.length})
          </h2>

          {followedMasters.length === 0 ? (
            <Card hover={false}>
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
                  You&apos;re not following any masters yet.
                </p>
                <Link
                  href="/"
                  className="inline-block px-4 py-2 rounded text-sm transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-text)",
                  }}
                >
                  Browse Masters
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {followedMasters.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon */}
        <Card hover={false} className="mt-8">
          <div className="text-center py-4">
            <p
              className="text-xs mb-2"
              style={{ fontFamily: "var(--font-pixel)", color: "var(--color-accent)" }}
            >
              COMING SOON
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Copy trades, track positions, and build your track record
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
```

**Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/portfolio/page.tsx
git commit -m "feat: add portfolio page with bankroll and followed masters"
```

---

## Task 13: Final Build and Push

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Test locally**

Run: `npm run dev`

Test these flows:
1. Visit `/login` - see login form
2. Sign up with email/password
3. Header shows "Portfolio" and "Logout"
4. Visit a master profile - see Follow button
5. Click Follow - button changes to "Following"
6. Visit `/portfolio` - see followed master
7. Logout - header shows "Sign In" again

**Step 3: Push to GitHub**

```bash
git push origin main
```

---

## Summary

Phase 3 complete. You now have:

1. **User authentication** with email signup/login via Supabase Auth
2. **Session management** with cookies via @supabase/ssr
3. **User profiles** with username, virtual bankroll ($10,000), level, and XP
4. **Follow system** - users can follow/unfollow masters
5. **Portfolio page** showing bankroll and followed masters
6. **Dynamic header** showing auth state and logout

**Database tables added:**
- `users` - user profiles linked to auth.users
- `follows` - follow relationships

**Next: Phase 4 (Copy Mode)** - Apprenticeships, position copying, bet resolution
