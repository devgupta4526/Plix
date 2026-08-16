import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * requireAdmin — call at the top of any agency/* server component or action.
 * Redirects to /dashboard if the user is not an admin.
 */
export async function requireAdmin() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await client.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true, isAdmin: true },
  });

  if (!dbUser?.isAdmin) redirect("/dashboard");

  return dbUser;
}
