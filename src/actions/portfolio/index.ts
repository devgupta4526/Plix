"use server";

import { client } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { PortfolioItemInput } from "./schema";
import { PortfolioItemSchema } from "./schema";

export type { PortfolioItemInput };

export async function listPortfolioItems() {
  const items = await client.portfolioItem.findMany({
    orderBy: { position: "asc" },
  });
  return { status: 200, data: items };
}

export async function createPortfolioItem(data: PortfolioItemInput) {
  await requireAdmin();
  const parsed = PortfolioItemSchema.safeParse(data);
  if (!parsed.success) return { status: 400, error: parsed.error.flatten() };

  const max = await client.portfolioItem.aggregate({ _max: { position: true } });
  const position = (max._max.position ?? -1) + 1;

  const item = await client.portfolioItem.create({
    data: { ...parsed.data, position, metrics: parsed.data.metrics as any },
  });
  return { status: 200, data: item };
}

export async function updatePortfolioItem(id: string, data: Partial<PortfolioItemInput>) {
  await requireAdmin();
  const item = await client.portfolioItem.update({
    where: { id },
    data: { ...data, metrics: data.metrics as any },
  });
  return { status: 200, data: item };
}

export async function deletePortfolioItem(id: string) {
  await requireAdmin();
  await client.portfolioItem.delete({ where: { id } });
  return { status: 200 };
}

export async function reorderPortfolioItems(orderedIds: string[]) {
  await requireAdmin();
  const updates = orderedIds.map((id, index) =>
    client.portfolioItem.update({ where: { id }, data: { position: index } })
  );
  await client.$transaction(updates);
  return { status: 200 };
}
