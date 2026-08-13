"use client";

import PublicProfileRenderer from "@/components/global/public-profile-renderer";
import type { ThemeConfig } from "@/types/linkhub";

type LinkRow = {
  id: string;
  label: string;
  url: string;
  icon?: string | null;
  clicks: number;
};

type ProductRow = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: string | null;
  promoUrl: string;
  ctaLabel: string;
  autoDmEnabled: boolean;
  Automation?: {
    keywords?: { word: string }[];
  } | null;
};

type Props = {
  profile: {
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    themeId: string;
    themeConfig?: unknown;
  };
  links: LinkRow[];
  products: ProductRow[];
  baseTemplateConfig: Partial<ThemeConfig>;
};

export default function PublicPageClient({ profile, links, products, baseTemplateConfig }: Props) {
  function track(type: "linkId" | "productId", id: string) {
    // Fire-and-forget click tracking
    fetch("/api/analytics/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [type]: id }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <PublicProfileRenderer
      profile={profile}
      links={links}
      products={products}
      baseTemplateConfig={baseTemplateConfig}
      onLinkClick={(id) => track("linkId", id)}
      onProductClick={(id) => track("productId", id)}
    />
  );
}
