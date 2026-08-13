"use server";

import { client } from "@/lib/prisma";
import { onCurrentUser } from "../user";

async function getProfileId(): Promise<string | null> {
  const user = await onCurrentUser();
  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { profile: { select: { id: true } } },
  });
  return dbUser?.profile?.id ?? null;
}

export const createLink = async (data: { label: string; url: string; icon?: string }) => {
  try {
    const profileId = await getProfileId();
    if (!profileId) return { status: 404, data: "Profile not found" };

    // Assign position = current max + 1
    const max = await client.link.aggregate({ where: { profileId }, _max: { position: true } });
    const position = (max._max.position ?? -1) + 1;

    const link = await client.link.create({ data: { ...data, profileId, position } });
    return { status: 200, data: link };
  } catch (error: any) {
    return { status: 500, data: "Failed to create link" };
  }
};

export const updateLink = async (
  linkId: string,
  data: { label?: string; url?: string; icon?: string; active?: boolean }
) => {
  try {
    const profileId = await getProfileId();
    if (!profileId) return { status: 404, data: "Profile not found" };

    const link = await client.link.update({
      where: { id: linkId, profileId },
      data,
    });
    return { status: 200, data: link };
  } catch {
    return { status: 500, data: "Failed to update link" };
  }
};

export const deleteLink = async (linkId: string) => {
  try {
    const profileId = await getProfileId();
    if (!profileId) return { status: 404, data: "Profile not found" };

    await client.link.delete({ where: { id: linkId, profileId } });
    return { status: 200, data: "Link deleted" };
  } catch {
    return { status: 500, data: "Failed to delete link" };
  }
};

export const reorderLinks = async (orderedIds: string[]) => {
  try {
    const profileId = await getProfileId();
    if (!profileId) return { status: 404, data: "Profile not found" };

    const updates = orderedIds.map((id, index) =>
      client.link.update({ where: { id, profileId }, data: { position: index } })
    );
    await client.$transaction(updates);
    return { status: 200, data: "Links reordered" };
  } catch {
    return { status: 500, data: "Failed to reorder links" };
  }
};
