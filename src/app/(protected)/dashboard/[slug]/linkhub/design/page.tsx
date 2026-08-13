import { getOrCreateProfile } from "@/actions/profile";
import { notFound } from "next/navigation";
import DesignClient from "./_components/design-client";

type Props = { params: { slug: string } };

export default async function DesignPage({ params }: Props) {
  const res = await getOrCreateProfile();
  if (!res.data) notFound();

  const profile = res.data as any;

  return (
    <DesignClient
      profile={{
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        themeId: profile.themeId,
        themeConfig: profile.themeConfig,
        published: profile.published,
      }}
      links={profile.links ?? []}
    />
  );
}
