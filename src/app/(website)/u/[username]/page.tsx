import { getPublicProfile } from "@/actions/profile";
import { client } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { ThemeConfig } from "@/types/linkhub";
import PublicPageClient from "./_components/public-page-client";

type Props = {
  params: { username: string };
};

export const revalidate = 60; // ISR

export default async function PublicProfilePage({ params }: Props) {
  const profile = await getPublicProfile(params.username);

  if (!profile || !profile.published) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  client.profile
    .update({ where: { id: profile.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  // Resolve template config
  const template = await client.template.findUnique({ where: { slug: profile.themeId } });
  const baseConfig = (template?.config ?? {}) as Partial<ThemeConfig>;

  return (
    <PublicPageClient
      profile={profile}
      links={profile.links as any}
      products={profile.products as any}
      baseTemplateConfig={baseConfig}
    />
  );
}
