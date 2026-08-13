import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BUILT_IN_TEMPLATES = [
  {
    slug: "minimal-light",
    name: "Minimal Light",
    config: {
      background: "#ffffff",
      buttonStyle: "pill",
      fontFamily: "Inter, sans-serif",
      textColor: "#111111",
      accentColor: "#3b82f6",
    },
  },
  {
    slug: "minimal-dark",
    name: "Minimal Dark",
    config: {
      background: "#0f0f0f",
      buttonStyle: "pill",
      fontFamily: "Inter, sans-serif",
      textColor: "#f5f5f5",
      accentColor: "#818cf8",
    },
  },
  {
    slug: "gradient-wave",
    name: "Gradient Wave",
    config: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      buttonStyle: "pill",
      fontFamily: "Poppins, sans-serif",
      textColor: "#ffffff",
      accentColor: "#fbbf24",
    },
  },
  {
    slug: "terminal",
    name: "Terminal",
    config: {
      background: "#0d1117",
      buttonStyle: "square",
      fontFamily: "JetBrains Mono, monospace",
      textColor: "#39d353",
      accentColor: "#39d353",
    },
  },
  {
    slug: "pastel-cards",
    name: "Pastel Cards",
    config: {
      background: "#fef9f0",
      buttonStyle: "outline",
      fontFamily: "Nunito, sans-serif",
      textColor: "#4a4a4a",
      accentColor: "#f472b6",
    },
  },
  {
    slug: "bold-neon",
    name: "Bold Neon",
    config: {
      background: "#0a0a0a",
      buttonStyle: "square",
      fontFamily: "Space Grotesk, sans-serif",
      textColor: "#ffffff",
      accentColor: "#00ff87",
    },
  },
];

async function main() {
  for (const t of BUILT_IN_TEMPLATES) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        name: t.name,
        config: t.config,
        isPublic: true,
        isPremium: false,
        createdBy: null,
      },
    });
  }
  console.log("✅ Built-in templates seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
