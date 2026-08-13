"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PublicProfileRenderer from "@/components/global/public-profile-renderer";
import { type ThemeConfig } from "@/types/linkhub";

type Template = {
  id: string;
  slug: string;
  name: string;
  config: Partial<ThemeConfig>;
  usageCount: number;
};

const DEMO_LINKS = [
  { id: "1", label: "My Website", url: "https://example.com", icon: "link", clicks: 0 },
  { id: "2", label: "Instagram", url: "https://instagram.com", icon: "instagram", clicks: 0 },
  { id: "3", label: "YouTube", url: "https://youtube.com", icon: "youtube", clicks: 0 },
];

export default function TemplateGallery({ templates }: { templates: Template[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {templates.map((t) => {
        return (
          <div
            key={t.slug}
            className="group rounded-2xl border border-[#222] overflow-hidden bg-[#111] hover:border-[#444] transition-all"
          >
            {/* Mini preview */}
            <div className="h-56 overflow-hidden relative bg-white">
              <div
                style={{
                  width: "300%",
                  height: "300%",
                  transform: "scale(0.33)",
                  transformOrigin: "top left",
                }}
              >
                <PublicProfileRenderer
                  profile={{
                    displayName: "Your Name",
                    bio: "Your bio goes here",
                    avatarUrl: null,
                    themeId: t.slug,
                    themeConfig: {},
                  }}
                  links={DEMO_LINKS}
                  baseTemplateConfig={t.config}
                  preview={true}
                />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{t.name}</p>
                <span className="text-xs text-[#666]">{t.usageCount} uses</span>
              </div>
              <Link href={`/dashboard?apply=${t.slug}`}>
                <Button size="sm" className="w-full bg-[#3b82f6] hover:bg-[#2563eb]">
                  Apply to my page
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
