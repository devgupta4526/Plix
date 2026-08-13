import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

// NOTE: This endpoint requires @vercel/blob to be installed and BLOB_READ_WRITE_TOKEN set.
// Run: npm install @vercel/blob
// Then set BLOB_READ_WRITE_TOKEN in your .env

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN not set. Run: npm install @vercel/blob and set the env var." },
      { status: 501 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const filename = `avatars/${userId}-${Date.now()}.${file.name.split(".").pop()}`;

    // POST directly to Vercel Blob API (no npm package needed)
    const blobRes = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": file.type,
        "x-api-version": "7",
        "x-allowed-content-types": file.type,
      },
      body: arrayBuffer,
    });

    if (!blobRes.ok) {
      const err = await blobRes.text();
      return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 });
    }

    const json = await blobRes.json() as { url: string };
    const url: string = json.url;

    const dbUser = await client.user.findUnique({
      where: { clerkId: userId },
      select: { profile: { select: { id: true } } },
    });
    if (dbUser?.profile) {
      await client.profile.update({ where: { id: dbUser.profile.id }, data: { avatarUrl: url } });
    }

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
