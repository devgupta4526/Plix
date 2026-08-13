"use server";

import { client } from "@/lib/prisma";
import { onCurrentUser } from "../user";

export const listTemplates = async () => {
  try {
    const templates = await client.template.findMany({
      where: { isPublic: true },
      orderBy: [{ usageCount: "desc" }, { createdAt: "asc" }],
    });
    return { status: 200, data: templates };
  } catch {
    return { status: 500, data: [] };
  }
};

export const applyTemplate = async (templateSlug: string) => {
  const user = await onCurrentUser();
  try {
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { profile: { select: { id: true } } },
    });
    if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

    // Increment usageCount
    await client.template.update({
      where: { slug: templateSlug },
      data: { usageCount: { increment: 1 } },
    });

    const updated = await client.profile.update({
      where: { id: dbUser.profile.id },
      data: { themeId: templateSlug, themeConfig: {} },
    });
    return { status: 200, data: updated };
  } catch {
    return { status: 500, data: "Failed to apply template" };
  }
};

export const updateThemeOverride = async (themeConfig: Record<string, unknown>) => {
  const user = await onCurrentUser();
  try {
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { profile: { select: { id: true } } },
    });
    if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

    const updated = await client.profile.update({
      where: { id: dbUser.profile.id },
      data: { themeConfig: themeConfig as any },
    });
    return { status: 200, data: updated };
  } catch {
    return { status: 500, data: "Failed to update theme" };
  }
};

export const publishTemplate = async (name: string) => {
  const user = await onCurrentUser();
  try {
    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, profile: { select: { themeConfig: true, themeId: true } } },
    });
    if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

    // Merge base template config with user overrides
    const base = await client.template.findUnique({ where: { slug: dbUser.profile.themeId } });
    const config = { ...(base?.config as object ?? {}), ...(dbUser.profile.themeConfig as object ?? {}) };

    const slug = `custom-${dbUser.id.slice(0, 8)}-${Date.now()}`;
    const template = await client.template.create({
      data: { slug, name, config, isPublic: true, createdBy: dbUser.id },
    });
    return { status: 200, data: template };
  } catch {
    return { status: 500, data: "Failed to publish template" };
  }
};
