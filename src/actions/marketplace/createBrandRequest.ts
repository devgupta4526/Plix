"use server";

import { client } from "@/lib/prisma";
import { BrandRequestSchema, type BrandRequestInput } from "./brandRequestSchema";
export type { BrandRequestInput };

export async function createBrandRequest(data: BrandRequestInput) {
  const parsed = BrandRequestSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 400, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const record = await client.brandRequest.create({
      data: {
        ...parsed.data,
        status: "NEW",
      },
    });
    return { status: 200, data: { id: record.id } };
  } catch (error) {
    return { status: 500, error: "Failed to submit request" };
  }
}
