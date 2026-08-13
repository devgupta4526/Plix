import React from "react";
import {
  Instagram,
  Twitter,
  Youtube,
  Github,
  Facebook,
  Link as LinkIcon,
  Music,
  Tv,
  Linkedin,
  ShoppingBag,
} from "lucide-react";
import { mergeTheme, type ThemeConfig } from "@/types/linkhub";

// ── types ──────────────────────────────────────────────────────────────────

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

type ProfileData = {
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  themeId: string;
  themeConfig?: unknown;
};

type Props = {
  profile: ProfileData;
  links: LinkRow[];
  products?: ProductRow[];
  baseTemplateConfig?: Partial<ThemeConfig>;
  /** true when rendered as a small preview tile */
  preview?: boolean;
  /** called when user clicks a link (for analytics) */
  onLinkClick?: (linkId: string) => void;
  /** called when user clicks a product CTA */
  onProductClick?: (productId: string) => void;
};

// ── platform icon lookup ────────────────────────────────────────────────────

function PlatformIcon({ platform, size = 18 }: { platform?: string | null; size?: number }) {
  const props = { size, strokeWidth: 1.5 };
  switch (platform) {
    case "instagram": return <Instagram {...props} />;
    case "x": return <Twitter {...props} />;
    case "youtube": return <Youtube {...props} />;
    case "github": return <Github {...props} />;
    case "facebook": return <Facebook {...props} />;
    case "spotify": return <Music {...props} />;
    case "twitch": return <Tv {...props} />;
    case "tiktok": return <Music {...props} />;
    case "linkedin": return <Linkedin {...props} />;
    default: return <LinkIcon {...props} />;
  }
}

// ── button shape helper ─────────────────────────────────────────────────────

function buttonClasses(style: ThemeConfig["buttonStyle"]) {
  const base = "flex items-center gap-3 w-full px-5 py-3 font-medium transition-opacity hover:opacity-80 active:opacity-60";
  if (style === "pill") return `${base} rounded-full`;
  if (style === "outline") return `${base} rounded-lg border-2 bg-transparent`;
  return `${base} rounded-md`;
}

// ── main component ──────────────────────────────────────────────────────────

export default function PublicProfileRenderer({
  profile,
  links,
  products = [],
  baseTemplateConfig = {},
  preview = false,
  onLinkClick,
  onProductClick,
}: Props) {
  const themeConfig = profile.themeConfig as Partial<ThemeConfig> | null | undefined;
  const theme = mergeTheme(baseTemplateConfig, themeConfig ?? {});

  const scale = preview ? "scale-[0.35] origin-top-left pointer-events-none" : "";
  const wrapperStyle: React.CSSProperties = preview
    ? { width: "285%", height: "285%", transformOrigin: "top left" }
    : {};

  const containerStyle: React.CSSProperties = {
    background: theme.background,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    minHeight: preview ? undefined : "100vh",
    padding: preview ? "16px" : "32px 16px",
  };

  const btnStyle: React.CSSProperties =
    theme.buttonStyle === "outline"
      ? { borderColor: theme.accentColor, color: theme.textColor }
      : { backgroundColor: theme.accentColor, color: "#fff" };

  return (
    <div className={`${scale} w-full`} style={wrapperStyle}>
      <div style={containerStyle}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {/* Avatar + bio */}
          <div className="flex flex-col items-center text-center mb-8 gap-3">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName ?? "avatar"}
                className="w-20 h-20 rounded-full object-cover border-2"
                style={{ borderColor: theme.accentColor }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: theme.accentColor, color: "#fff" }}
              >
                {(profile.displayName ?? "U").charAt(0).toUpperCase()}
              </div>
            )}
            {profile.displayName && (
              <h1 className="text-2xl font-bold" style={{ color: theme.textColor }}>
                {profile.displayName}
              </h1>
            )}
            {profile.bio && (
              <p className="text-sm opacity-70 max-w-xs" style={{ color: theme.textColor }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-col gap-3 mb-8">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses(theme.buttonStyle)}
                  style={btnStyle}
                  onClick={() => onLinkClick?.(link.id)}
                >
                  <PlatformIcon platform={link.icon} />
                  <span className="flex-1 text-center">{link.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Shop / Products */}
          {products.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4 opacity-70">
                <ShoppingBag size={16} />
                <span className="text-sm font-semibold uppercase tracking-wider">Shop</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => {
                  const keyword = product.Automation?.keywords?.[0]?.word;
                  const ctaText =
                    product.autoDmEnabled && keyword
                      ? `Comment '${keyword}' on my latest post 👇`
                      : product.ctaLabel;

                  return (
                    <div
                      key={product.id}
                      className="rounded-xl overflow-hidden border"
                      style={{ borderColor: `${theme.accentColor}40` }}
                    >
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <span className="font-semibold">{product.name}</span>
                          {product.price && (
                            <span
                              className="text-sm font-bold"
                              style={{ color: theme.accentColor }}
                            >
                              {product.price}
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs opacity-70">{product.description}</p>
                        )}
                        <a
                          href={product.promoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClasses(theme.buttonStyle)}
                          style={{ ...btnStyle, justifyContent: "center" }}
                          onClick={() => onProductClick?.(product.id)}
                        >
                          {ctaText}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Made with Plix badge */}
          {!preview && (
            <p className="text-center text-xs mt-12 opacity-40">
              Made with{" "}
              <a href="/" className="underline">
                Plix
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
