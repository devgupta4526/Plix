"use server";

import { client } from "@/lib/prisma";
import { onCurrentUser } from "../user";

async function getProfileAndUser() {
  const user = await onCurrentUser();
  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, profile: { select: { id: true } } },
  });
  return { clerkId: user.id, dbUser };
}

export const createProduct = async (data: {
  name: string;
  description?: string;
  imageUrl?: string;
  price?: string;
  promoUrl: string;
  ctaLabel?: string;
  autoDmEnabled?: boolean;
  // For auto-DM provisioning
  dmMode?: "comment" | "dm" | "smartai";
  keyword?: string;
  postId?: string;
  postCaption?: string;
  postMedia?: string;
  postMediaType?: "IMAGE" | "VIDEO" | "CAROSEL_ALBUM";
}) => {
  const { clerkId, dbUser } = await getProfileAndUser();
  if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

  try {
    const max = await client.product.aggregate({
      where: { profileId: dbUser.profile.id },
      _max: { position: true },
    });
    const position = (max._max.position ?? -1) + 1;

    let automationId: string | undefined;

    if (data.autoDmEnabled && data.dmMode && data.keyword) {
      // Provision a real Automation row (same pattern as existing automation creation)
      const automation = await client.user.update({
        where: { clerkId },
        data: { automations: { create: { name: data.name, active: true } } },
        select: { automations: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true } } },
      });
      const newAutomationId = automation.automations[0]?.id;
      if (!newAutomationId) throw new Error("Failed to create automation");
      automationId = newAutomationId;

      // Add keyword
      await client.automation.update({
        where: { id: automationId },
        data: { keywords: { create: { word: data.keyword } } },
      });

      // Add listener
      const listenerType = data.dmMode === "smartai" ? "SMARTAI" : "MESSAGE";
      const prompt =
        data.dmMode === "smartai"
          ? `Product: ${data.name}. ${data.description ?? ""}. Send the user this link: ${data.promoUrl}`
          : data.promoUrl;

      await client.automation.update({
        where: { id: automationId },
        data: {
          listener: {
            create: {
              listener: listenerType,
              prompt,
              commentReply: data.dmMode === "comment" ? "Sent you the link! 📩" : undefined,
            },
          },
        },
      });

      // Add trigger for comment mode
      if (data.dmMode === "comment") {
        await client.automation.update({
          where: { id: automationId },
          data: { trigger: { create: { type: "COMMENT" } } },
        });
        // Attach post if provided
        if (data.postId && data.postMedia) {
          await client.automation.update({
            where: { id: automationId },
            data: {
              posts: {
                create: {
                  postid: data.postId,
                  caption: data.postCaption,
                  media: data.postMedia,
                  mediaType: data.postMediaType ?? "IMAGE",
                },
              },
            },
          });
        }
      }
    }

    const product = await client.product.create({
      data: {
        profileId: dbUser.profile.id,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        promoUrl: data.promoUrl,
        ctaLabel: data.ctaLabel ?? "Get it",
        autoDmEnabled: !!data.autoDmEnabled,
        automationId: automationId ?? null,
        position,
      },
    });
    return { status: 200, data: product };
  } catch (error: any) {
    return { status: 500, data: error.message };
  }
};

export const updateProduct = async (
  productId: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    price?: string;
    promoUrl?: string;
    ctaLabel?: string;
    active?: boolean;
    autoDmEnabled?: boolean;
  }
) => {
  const { dbUser } = await getProfileAndUser();
  if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

  try {
    const product = await client.product.findFirst({
      where: { id: productId, profileId: dbUser.profile.id },
      include: { Automation: { include: { listener: true } } },
    });
    if (!product) return { status: 404, data: "Product not found" };

    // If promoUrl changed and there's a linked automation with a MESSAGE listener, update it
    if (data.promoUrl && product.Automation?.listener && product.Automation.listener.listener === "MESSAGE") {
      await client.listener.update({
        where: { automationId: product.automationId! },
        data: { prompt: data.promoUrl },
      });
    }

    const updated = await client.product.update({
      where: { id: productId },
      data,
    });
    return { status: 200, data: updated };
  } catch {
    return { status: 500, data: "Failed to update product" };
  }
};

export const deleteProduct = async (productId: string) => {
  const { dbUser } = await getProfileAndUser();
  if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

  try {
    await client.product.delete({ where: { id: productId, profileId: dbUser.profile.id } });
    return { status: 200, data: "Product deleted" };
  } catch {
    return { status: 500, data: "Failed to delete product" };
  }
};

export const reorderProducts = async (orderedIds: string[]) => {
  const { dbUser } = await getProfileAndUser();
  if (!dbUser?.profile) return { status: 404, data: "Profile not found" };

  try {
    const updates = orderedIds.map((id, index) =>
      client.product.update({ where: { id, profileId: dbUser.profile!.id }, data: { position: index } })
    );
    await client.$transaction(updates);
    return { status: 200, data: "Products reordered" };
  } catch {
    return { status: 500, data: "Failed to reorder products" };
  }
};

export const getProducts = async () => {
  const { dbUser } = await getProfileAndUser();
  if (!dbUser?.profile) return { status: 404, data: [] as any[] };

  try {
    const products = await client.product.findMany({
      where: { profileId: dbUser.profile.id },
      orderBy: { position: "asc" },
      include: { Automation: { include: { listener: true, keywords: true } } },
    });
    return { status: 200, data: products };
  } catch {
    return { status: 500, data: [] as any[] };
  }
};
