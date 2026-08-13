"use server";

import { client } from "@/lib/prisma";
import { onCurrentUser } from "../user";

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

export const getProfileByUserId = async (userId: string) => {
  return client.profile.findUnique({
    where: { userId },
    include: {
      links: { orderBy: { position: "asc" } },
      products: { orderBy: { position: "asc" }, where: { active: true } },
    },
  });
};

export const getPublicProfile = async (username: string) => {
  return client.profile.findUnique({
    where: { username },
    include: {
      links: {
        where: { active: true },
        orderBy: { position: "asc" },
      },
      products: {
        where: { active: true },
        orderBy: { position: "asc" },
      },
    },
  });
};

// ──────────────────────────────────────────────
// Server actions
// ──────────────────────────────────────────────

export const getOrCreateProfile = async () => {
  const user = await onCurrentUser();
  try {
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, firstname: true, lastname: true },
    });
    if (!dbUser) return { status: 404, data: null };

    const existing = await client.profile.findUnique({
      where: { userId: dbUser.id },
    });
    if (existing) return { status: 200, data: existing };

    // Generate a default username from their name or clerk id
    const base = (
      ((dbUser.firstname ?? "") + (dbUser.lastname ?? "")).toLowerCase().replace(/\s+/g, "") ||
      user.id.slice(0, 8)
    );
    const username = await uniqueUsername(base);

    const created = await client.profile.create({
      data: {
        userId: dbUser.id,
        username,
        displayName: `${dbUser.firstname ?? ""} ${dbUser.lastname ?? ""}`.trim() || null,
      },
    });
    return { status: 201, data: created };
  } catch (error: any) {
    return { status: 500, data: null };
  }
};

async function uniqueUsername(base: string): Promise<string> {
  let candidate = base || "user";
  let suffix = 0;
  while (true) {
    const slug = suffix === 0 ? candidate : `${candidate}${suffix}`;
    const existing = await client.profile.findUnique({ where: { username: slug } });
    if (!existing) return slug;
    suffix++;
  }
}

export const updateProfile = async (data: {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  themeId?: string;
  themeConfig?: Record<string, unknown>;
  published?: boolean;
}) => {
  const user = await onCurrentUser();
  try {
    const dbUser = await client.user.findUnique({ where: { clerkId: user.id }, select: { id: true } });
    if (!dbUser) return { status: 404, data: "User not found" };

    const updated = await client.profile.update({
      where: { userId: dbUser.id },
      data: {
        ...(data.username !== undefined && { username: data.username }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.themeId !== undefined && { themeId: data.themeId }),
        ...(data.themeConfig !== undefined && { themeConfig: data.themeConfig as any }),
        ...(data.published !== undefined && { published: data.published }),
      },
    });
    return { status: 200, data: updated };
  } catch (error: any) {
    if (error.code === "P2002") return { status: 409, data: "Username already taken" };
    return { status: 500, data: "Failed to update profile" };
  }
};

export const checkUsernameAvailable = async (username: string) => {
  try {
    const existing = await client.profile.findUnique({ where: { username } });
    return { available: !existing };
  } catch {
    return { available: false };
  }
};
