import { client } from "@/lib/prisma";
import { type ThemeConfig } from "@/types/linkhub";
import TemplateGallery from "./_components/template-gallery";

export const revalidate = 300;

export default async function TemplatesPage() {
  const templates = await client.template.findMany({
    where: { isPublic: true },
    orderBy: [{ usageCount: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Template Gallery</h1>
        <p className="text-[#888] mb-10">
          Pick a template and apply it to your Plix LinkHub page.
        </p>
        <TemplateGallery
          templates={templates.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            config: t.config as Partial<ThemeConfig>,
            usageCount: t.usageCount,
          }))}
        />
      </div>
    </div>
  );
}
