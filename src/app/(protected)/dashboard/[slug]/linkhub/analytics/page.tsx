import { client } from "@/lib/prisma";
import { onCurrentUser } from "@/actions/user";
import { notFound } from "next/navigation";
import AnalyticsChart from "./_components/analytics-chart";

type Props = { params: { slug: string } };

export default async function AnalyticsPage({ params }: Props) {
  const user = await onCurrentUser();
  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: {
      profile: {
        select: {
          views: true,
          links: { orderBy: { clicks: "desc" } },
          products: {
            orderBy: { clicks: "desc" },
            include: { Automation: { include: { listener: true } } },
          },
        },
      },
    },
  });

  if (!dbUser?.profile) notFound();

  const { views, links, products } = dbUser.profile;
  const totalLinkClicks = links.reduce((s, l) => s + l.clicks, 0);
  const linkChartData = links.map((l) => ({ name: l.label, clicks: l.clicks }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5">
          <p className="text-sm text-[#888]">Total page views</p>
          <p className="text-3xl font-bold text-white mt-1">{views.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5">
          <p className="text-sm text-[#888]">Total link clicks</p>
          <p className="text-3xl font-bold text-white mt-1">{totalLinkClicks.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5">
          <p className="text-sm text-[#888]">Click-through rate</p>
          <p className="text-3xl font-bold text-white mt-1">
            {views > 0 ? ((totalLinkClicks / views) * 100).toFixed(1) : "0"}%
          </p>
        </div>
      </div>

      {/* Links chart */}
      {linkChartData.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-wider mb-4">
            Clicks per link
          </h2>
          <AnalyticsChart data={linkChartData} />
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
          <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-wider mb-4">
            Product performance
          </h2>
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-[#222] pb-3 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{p.name}</p>
                  {p.Automation?.listener && (
                    <p className="text-xs text-[#666]">
                      DMs sent: {p.Automation.listener.dmCount} · Comments:{" "}
                      {p.Automation.listener.commentCount}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{p.clicks}</p>
                  <p className="text-xs text-[#666]">direct clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
