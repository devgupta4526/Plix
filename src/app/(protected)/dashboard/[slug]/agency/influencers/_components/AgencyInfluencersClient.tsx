"use client";

import { useState } from "react";
import { approveInfluencerProfile } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
  ACTIVE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const NICHES_ALL = ["Fashion", "Tech", "Fitness", "Beauty", "Food", "Travel", "Lifestyle", "Gaming", "Finance", "Parenting"];

type Profile = {
  id: string;
  niche: string[];
  platforms: any;
  avgEngagementRate?: number | null;
  bio?: string | null;
  status: string;
  createdAt: Date;
  User: { email: string; firstname?: string | null; lastname?: string | null };
};

export default function AgencyInfluencersClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterNiche, setFilterNiche] = useState("ALL");

  const filtered = profiles.filter((p) => {
    if (filterStatus !== "ALL" && p.status !== filterStatus) return false;
    if (filterNiche !== "ALL" && !p.niche.includes(filterNiche)) return false;
    return true;
  });

  const selected = profiles.find((p) => p.id === selectedId);

  async function handleApprove(id: string) {
    const res = await approveInfluencerProfile(id);
    if (res.status === 200) {
      setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, status: "APPROVED" } : p));
      toast.success("Profile approved");
    }
  }

  const platforms: any[] = Array.isArray(selected?.platforms) ? selected.platforms : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
      {/* Filters + List */}
      <div className="lg:col-span-1 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Filter by status</p>
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "PENDING_REVIEW", "APPROVED", "ACTIVE"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                }`}
              >
                {s === "ALL" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Filter by niche</p>
          <div className="flex flex-wrap gap-1.5">
            {["ALL", ...NICHES_ALL].map((n) => (
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
        </div>
        <div className="space-y-2 mt-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedId === p.id ? "border-[#C4622D] bg-[#C4622D]/5" : "border-border hover:border-[#C4622D]/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">
                    {p.User.firstname} {p.User.lastname}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.User.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[p.status]}`}>
                  {p.status.replace("_", " ")}
                </span>
              </div>
              {p.niche.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.niche.slice(0, 3).map((n) => (
                    <span key={n} className="text-xs bg-[#8A9A5B]/20 text-[#8A9A5B] px-1.5 py-0.5 rounded">{n}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">No profiles found</p>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="flex items-center justify-center h-full border border-dashed border-border rounded-xl text-muted-foreground text-sm">
            Select a profile to review
          </div>
        ) : (
          <div className="border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {selected.User.firstname} {selected.User.lastname}
                </h2>
                <p className="text-muted-foreground text-sm">{selected.User.email}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full border font-medium ${STATUS_COLORS[selected.status]}`}>
                {selected.status.replace("_", " ")}
              </span>
            </div>

            {selected.bio && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Bio</p>
                <p className="text-sm">{selected.bio}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Niches</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.niche.map((n) => (
                  <span key={n} className="text-xs bg-[#8A9A5B]/20 text-[#8A9A5B] px-2.5 py-1 rounded-full">{n}</span>
                ))}
              </div>
            </div>

            {platforms.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Platforms</p>
                <div className="space-y-1">
                  {platforms.map((pl: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="capitalize text-muted-foreground w-20">{pl.platform}</span>
                      <span className="font-medium">{pl.handle}</span>
                      <span className="text-muted-foreground">{pl.followers?.toLocaleString()} followers</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.avgEngagementRate != null && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Avg. Engagement Rate</p>
                <p className="text-sm font-medium text-[#FF6B35]">{selected.avgEngagementRate}%</p>
              </div>
            )}

            {selected.status === "PENDING_REVIEW" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApprove(selected.id)}
              >
                Approve Profile
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
