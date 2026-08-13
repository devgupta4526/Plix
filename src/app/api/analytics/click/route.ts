import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

// Public click-tracking endpoint — no auth required
// Called via navigator.sendBeacon from the public profile page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkId, productId } = body as { linkId?: string; productId?: string };

    if (linkId) {
      await client.link.update({
        where: { id: linkId },
        data: { clicks: { increment: 1 } },
      });
    } else if (productId) {
      await client.product.update({
        where: { id: productId },
        data: { clicks: { increment: 1 } },
      });
    } else {
      return NextResponse.json({ error: "linkId or productId required" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
