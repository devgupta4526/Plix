import { getOrCreateProfile } from "@/actions/profile";
import LinkhubEditor from "./_components/linkhub-editor";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export default async function LinkhubPage({ params }: Props) {
  const res = await getOrCreateProfile();
  if (!res.data) notFound();

  const profile = res.data as any;

  return (
    <LinkhubEditor
      initialProfile={{
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        themeId: profile.themeId,
        themeConfig: profile.themeConfig,
        published: profile.published,
      }}
      initialLinks={profile.links ?? []}
      slug={params.slug}
    />
  );
}
