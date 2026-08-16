"use client";

import { useState } from "react";
import { proposeInfluencer, updateMatchStatus, updateCampaignStatus } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

const CAMPAIGN_STATUSES = ["OPEN", "MATCHING", "ACTIVE", "COMPLETED"] as const;
const MATCH_STATUS_COLORS: Record<string, string> = {
  PROPOSED: "bg-yellow-500/20 text-yellow-400",
  ACCEPTED: "bg-green-500/20 text-green-400",
  DECLINED: "bg-red-500/20 text-red-400",
  DELIVERED: "bg-blue-500/20 text-blue-400",
  PAID: "bg-purple-500/20 text-purple-400",
};
const MATCH_STATUSES = ["PROPOSED", "ACCEPTED", "DECLINED", "DELIVERED", "PAID"] as const;

type Match = {
  id: string;
  status: string;
  agreedRate?: string | null;
  deliverables?: string | null;
  InfluencerProfile: {
    id: string;
    niche: string[];
    bio?: string | null;
    User: { email: string; firstname?: string | null; lastname?: string | null };
  };
};

type Campaign = {
  id: string;
  title: string;
  briefSummary?: string | null;
  status: string;
  BrandRequest: { companyName: string; campaignGoals?: string | null; deliverables: string[]; budgetRange?: string | null };
  matches: Match[];
};

type Influencer = {
  id: string;
  niche: string[];
  platforms: any;
  avgEngagementRate?: number | null;
  status: string;
  User: { email: string; firstname?: string | null; lastname?: string | null };
};

export default function AgencyCampaignClient({
  campaign: initialCampaign,
  approvedInfluencers,
  slug,
}: {
  campaign: Campaign;
  approvedInfluencers: Influencer[];
  slug: string;
}) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [filterNiche, setFilterNiche] = useState("ALL");
  const [proposing, setProposing] = useState<string | null>(null);

  const proposedIds = new Set(campaign.matches.map((m) => m.InfluencerProfile.id));

  const filteredInfluencers = filterNiche === "ALL"
    ? approvedInfluencers
    : approvedInfluencers.filter((i) => i.niche.includes(filterNiche));

  const allNiches = Array.from(new Set(approvedInfluencers.flatMap((i) => i.niche)));

  async function handlePropose(influencerProfileId: string) {
    setProposing(influencerProfileId);
    const res = await proposeInfluencer(campaign.id, influencerProfileId);
    setProposing(null);
    if (res.status === 200) {
      toast.success("Proposal sent");
      const inf = approvedInfluencers.find((i) => i.id === influencerProfileId)!;
      setCampaign((prev) => ({
        ...prev,
        matches: [
          ...prev.matches,
          {
            id: res.data.id,
            status: "PROPOSED",
            agreedRate: null,
            deliverables: null,
            InfluencerProfile: inf,
          },
        ],
      }));
    }
  }

  async function handleMatchStatus(matchId: string, status: typeof MATCH_STATUSES[number]) {
    const res = await updateMatchStatus(matchId, status);
    if (res.status === 200) {
      setCampaign((prev) => ({
        ...prev,
        matches: prev.matches.map((m) => m.id === matchId ? { ...m, status } : m),
      }));
      toast.success("Status updated");
    }
  }

  async function handleCampaignStatus(status: typeof CAMPAIGN_STATUSES[number]) {
    const res = await updateCampaignStatus(campaign.id, status);
    if (res.status === 200) {
      setCampaign((prev) => ({ ...prev, status }));
      toast.success("Campaign status updated");
    }
  }

  return (
    <div className="space-y-8">
      {/* Brief summary */}
      <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Brand</p>
            <p className="font-semibold">{campaign.BrandRequest.companyName}</p>
          </div>
          <select
            value={campaign.status}
            onChange={(e) => handleCampaignStatus(e.target.value as any)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm"
          >
            {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {campaign.BrandRequest.campaignGoals && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 font-semibold uppercase tracking-wider">Goals</p>
            <p className="text-sm">{campaign.BrandRequest.campaignGoals}</p>
          </div>
        )}
        {campaign.briefSummary && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5 font-semibold uppercase tracking-wider">Brief</p>
            <p className="text-sm">{campaign.briefSummary}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {campaign.BrandRequest.deliverables.map((d) => (
            <span key={d} className="text-xs bg-muted px-2 py-0.5 rounded">{d}</span>
          ))}
          {campaign.BrandRequest.budgetRange && (
            <span className="text-xs text-[#FF6B35] font-medium">{campaign.BrandRequest.budgetRange}</span>
          )}
        </div>
      </div>

      {/* Matched influencers */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Matched creators ({campaign.matches.length})</h2>
        {campaign.matches.length === 0 ? (
          <p className="text-muted-foreground text-sm">No creators proposed yet. Browse below.</p>
        ) : (
          <div className="space-y-2">
            {campaign.matches.map((match) => (
              <div key={match.id} className="border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">
                    {match.InfluencerProfile.User.firstname} {match.InfluencerProfile.User.lastname}
                  </p>
                  <p className="text-xs text-muted-foreground">{match.InfluencerProfile.User.email}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {match.InfluencerProfile.niche.map((n) => (
                      <span key={n} className="text-xs bg-[#8A9A5B]/20 text-[#8A9A5B] px-1.5 py-0.5 rounded">{n}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${MATCH_STATUS_COLORS[match.status]}`}>
                    {match.status}
                  </span>
                  <select
                    value={match.status}
                    onChange={(e) => handleMatchStatus(match.id, e.target.value as any)}
                    className="bg-background border border-border rounded-md px-2 py-1 text-xs"
                  >
                    {MATCH_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse approved influencers */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Propose creators</h2>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {["ALL", ...allNiches].map((n) => (
            <button
              key={n}
              onClick={() => setFilterNiche(n)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterNiche === n ? "bg-[#8A9A5B] text-white border-[#8A9A5B]" : "border-border text-muted-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredInfluencers.map((inf) => {
            const alreadyProposed = proposedIds.has(inf.id);
            const platforms: any[] = Array.isArray(inf.platforms) ? inf.platforms : [];
            return (
              <div key={inf.id} className={`border border-border rounded-xl p-4 ${alreadyProposed ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{inf.User.firstname} {inf.User.lastname}</p>
                    <p className="text-xs text-muted-foreground">{inf.User.email}</p>
                  </div>
                  {inf.avgEngagementRate != null && (
                    <span className="text-xs font-semibold text-[#FF6B35]">{inf.avgEngagementRate}% eng.</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {inf.niche.map((n) => (
                    <span key={n} className="text-xs bg-[#8A9A5B]/20 text-[#8A9A5B] px-1.5 py-0.5 rounded">{n}</span>
                  ))}
                </div>
                {platforms.slice(0, 2).map((pl: any, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground capitalize">
                    {pl.platform}: {pl.handle} · {pl.followers?.toLocaleString()} followers
                  </p>
                ))}
                <Button
                  size="sm"
                  disabled={alreadyProposed || proposing === inf.id}
                  onClick={() => handlePropose(inf.id)}
                  className="mt-3 w-full bg-[#FF6B35] hover:bg-[#C4622D] text-white text-xs"
                >
                  {alreadyProposed ? "Already proposed" : proposing === inf.id ? "Proposing…" : "Propose"}
                </Button>
              </div>
            );
          })}
          {filteredInfluencers.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-2">No approved creators for this niche</p>
          )}
        </div>
      </div>
    </div>
  );
}
