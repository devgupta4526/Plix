"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { listTemplates, applyTemplate, updateThemeOverride, publishTemplate } from "@/actions/templates";
import PublicProfileRenderer from "@/components/global/public-profile-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { mergeTheme, type ThemeConfig } from "@/types/linkhub";
import { toast } from "sonner";
import { Check } from "lucide-react";

type Template = {
  id: string;
  slug: string;
  name: string;
  config: unknown;
  isPremium: boolean;
  usageCount: number;
};

type Props = {
  profile: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    themeId: string;
    themeConfig: unknown;
    published: boolean;
  };
  links: { id: string; label: string; url: string; icon?: string | null; clicks: number }[];
};

export default function DesignClient({ profile, links }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState(profile.themeId);
  const [overrides, setOverrides] = useState<Partial<ThemeConfig>>(
    (profile.themeConfig as Partial<ThemeConfig>) ?? {}
  );
  const [isPending, startTransition] = useTransition();
  const [publishName, setPublishName] = useState("");
  const [showPublish, setShowPublish] = useState(false);

  useEffect(() => {
    listTemplates().then((r) => setTemplates(r.data as Template[]));
  }, []);

  const currentBase = (() => {
    const t = templates.find((t) => t.slug === currentThemeId);
    return (t?.config as Partial<ThemeConfig>) ?? {};
  })();

  const resolvedTheme = mergeTheme(currentBase, overrides);

  function handleApply(slug: string) {
    startTransition(async () => {
      const res = await applyTemplate(slug);
      if (res.status === 200) {
        setCurrentThemeId(slug);
        setOverrides({});
        toast.success("Template applied");
      } else {
        toast.error("Failed to apply template");
      }
    });
  }

  const debounceSave = useCallback(
    (() => {
      let timer: NodeJS.Timeout;
      return (overrides: Partial<ThemeConfig>) => {
        clearTimeout(timer);
        timer = setTimeout(() => updateThemeOverride(overrides as Record<string, unknown>), 800);
      };
    })(),
    []
  );

  function handleOverride(key: keyof ThemeConfig, value: string) {
    const updated = { ...overrides, [key]: value };
    setOverrides(updated);
    debounceSave(updated);
  }

  async function handlePublish() {
    if (!publishName.trim()) return;
    startTransition(async () => {
      const res = await publishTemplate(publishName);
      if (res.status === 200) {
        toast.success("Template published to gallery!");
        setShowPublish(false);
        setPublishName("");
      } else {
        toast.error("Failed to publish");
      }
    });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls */}
      <div className="flex-1 max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-white">Design</h1>

        {/* Template grid */}
        <div>
          <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-wider mb-3">
            Templates
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((t) => {
              const base = (t.config as Partial<ThemeConfig>) ?? {};
              const isActive = t.slug === currentThemeId;
              return (
                <button
                  key={t.slug}
                  onClick={() => handleApply(t.slug)}
                  className={`relative rounded-xl border-2 overflow-hidden h-36 transition-all ${
                    isActive ? "border-blue-500" : "border-[#333] hover:border-[#555]"
                  }`}
                >
                  {/* Mini preview */}
                  <div className="w-full h-full overflow-hidden">
                    <div
                      style={{
                        width: "300%",
                        height: "300%",
                        transform: "scale(0.33)",
                        transformOrigin: "top left",
                        background: base.background ?? "#fff",
                      }}
                    >
                      <PublicProfileRenderer
                        profile={{ ...profile, themeId: t.slug, themeConfig: {} }}
                        links={links.slice(0, 3)}
                        baseTemplateConfig={base}
                        preview={true}
                      />
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-xs text-white font-medium">{t.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-[#333]" />

        {/* Color overrides */}
        <div>
          <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-wider mb-3">
            Customize
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#aaa]">Background</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={resolvedTheme.background.startsWith("#") ? resolvedTheme.background : "#ffffff"}
                  onChange={(e) => handleOverride("background", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <Input
                  value={resolvedTheme.background}
                  onChange={(e) => handleOverride("background", e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#aaa]">Accent color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={resolvedTheme.accentColor}
                  onChange={(e) => handleOverride("accentColor", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <Input
                  value={resolvedTheme.accentColor}
                  onChange={(e) => handleOverride("accentColor", e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#aaa]">Text color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={resolvedTheme.textColor}
                  onChange={(e) => handleOverride("textColor", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <Input
                  value={resolvedTheme.textColor}
                  onChange={(e) => handleOverride("textColor", e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#aaa]">Button style</label>
              <div className="flex gap-2 mt-1">
                {(["pill", "square", "outline"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleOverride("buttonStyle", s)}
                    className={`flex-1 text-xs py-2 rounded-lg border capitalize ${
                      resolvedTheme.buttonStyle === s
                        ? "border-blue-500 text-blue-400 bg-blue-500/10"
                        : "border-[#333] text-[#888] hover:border-[#555]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-[#333]" />

        {/* Publish template */}
        <div>
          {!showPublish ? (
            <Button
              variant="outline"
              className="border-[#444] text-[#888] hover:text-white"
              onClick={() => setShowPublish(true)}
            >
              Share this design to gallery
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Template name…"
                value={publishName}
                onChange={(e) => setPublishName(e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white"
              />
              <Button onClick={handlePublish} disabled={isPending || !publishName.trim()}>
                Publish
              </Button>
              <Button variant="ghost" onClick={() => setShowPublish(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="hidden lg:block w-[300px] flex-shrink-0">
        <div className="sticky top-8">
          <p className="text-xs text-[#666] mb-2 text-center uppercase tracking-wider">Preview</p>
          <div
            className="w-[300px] h-[620px] rounded-[32px] border-4 border-[#333] overflow-hidden"
            style={{ boxShadow: "0 0 0 8px #111" }}
          >
            <div className="w-full h-full overflow-hidden">
              <div
                style={{
                  width: "285%",
                  height: "285%",
                  transform: "scale(0.35)",
                  transformOrigin: "top left",
                }}
              >
                <PublicProfileRenderer
                  profile={{ ...profile, themeId: currentThemeId, themeConfig: overrides }}
                  links={links}
                  baseTemplateConfig={currentBase}
                  preview={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
