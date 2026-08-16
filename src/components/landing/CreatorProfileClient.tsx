"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getOrCreateInfluencerProfile,
  updateInfluencerProfile,
  respondToCampaignProposal,
  type InfluencerProfileInput,
} from "@/actions/marketplace";
import { InfluencerProfileSchema } from "@/actions/marketplace/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const NICHES = ["Fashion", "Tech", "Fitness", "Beauty", "Food", "Travel", "Lifestyle", "Gaming", "Finance", "Parenting"];
const PLATFORMS = ["instagram", "tiktok", "youtube", "twitter", "pinterest"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: "Pending Review", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  APPROVED: { label: "Approved", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  ACTIVE: { label: "Active", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const MATCH_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PROPOSED: { label: "Proposal received", color: "bg-orange-500/20 text-orange-400" },
  ACCEPTED: { label: "Accepted", color: "bg-green-500/20 text-green-400" },
  DECLINED: { label: "Declined", color: "bg-red-500/20 text-red-400" },
  DELIVERED: { label: "Delivered", color: "bg-blue-500/20 text-blue-400" },
  PAID: { label: "Paid", color: "bg-purple-500/20 text-purple-400" },
};

export default function CreatorProfileClient() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<InfluencerProfileInput>({
    resolver: zodResolver(InfluencerProfileSchema),
    defaultValues: { niche: [], platforms: [{ platform: "", handle: "", followers: 0 }] },
  });

  const { register, control, watch, setValue, handleSubmit, reset, formState: { errors } } = form;

  const { fields: platformFields, append: addPlatform, remove: removePlatform } = useFieldArray({
    control,
    name: "platforms",
  });

  const selectedNiches = watch("niche");

  function toggleNiche(n: string) {
    const current = form.getValues("niche");
    setValue("niche", current.includes(n) ? current.filter((v) => v !== n) : [...current, n], { shouldValidate: true });
  }

  useEffect(() => {
    async function load() {
      const res = await getOrCreateInfluencerProfile();
      if (res.status === 200 || res.status === 201) {
        setProfileData(res.data);
        const d = res.data as any;
        reset({
          niche: d.niche ?? [],
          platforms: Array.isArray(d.platforms) && d.platforms.length > 0
            ? d.platforms
            : [{ platform: "", handle: "", followers: 0 }],
          avgEngagementRate: d.avgEngagementRate ?? undefined,
          audienceSummary: d.audienceSummary ?? "",
          rateCard: d.rateCard ?? {},
          bio: d.bio ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, [reset]);

  async function onSubmit(data: InfluencerProfileInput) {
    setSaving(true);
    const res = await updateInfluencerProfile(data);
    setSaving(false);
    if (res.status === 200) {
      toast.success("Profile saved");
      setProfileData((prev: any) => ({ ...prev, ...res.data }));
    } else {
      toast.error("Failed to save profile");
    }
  }

  async function handleProposalResponse(matchId: string, response: "ACCEPTED" | "DECLINED") {
    const res = await respondToCampaignProposal(matchId, response);
    if (res.status === 200) {
      toast.success(response === "ACCEPTED" ? "Campaign accepted!" : "Proposal declined");
      setProfileData((prev: any) => ({
        ...prev,
        campaignMatches: prev.campaignMatches.map((m: any) =>
          m.id === matchId ? { ...m, status: response } : m
        ),
      }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const status = profileData?.status as string;
  const matches = profileData?.campaignMatches ?? [];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Creator Profile</h2>
        {status && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_LABELS[status]?.color}`}>
            {STATUS_LABELS[status]?.label ?? status}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bio */}
        <div>
          <Label className="mb-1 block">Bio</Label>
          <Textarea
            {...register("bio")}
            placeholder="Tell brands about your content style and audience…"
            className="min-h-[80px]"
          />
        </div>

        {/* Niches */}
        <div>
          <Label className="mb-2 block">Your niches</Label>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => toggleNiche(n)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedNiches.includes(n)
                    ? "bg-[#C4622D] border-[#C4622D] text-white"
                    : "bg-transparent border-border text-muted-foreground hover:border-[#C4622D]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {errors.niche && <p className="text-destructive text-xs mt-1">Select at least one niche</p>}
        </div>

        {/* Platforms */}
        <div>
          <Label className="mb-2 block">Platforms</Label>
          <div className="space-y-3">
            {platformFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <select
                  {...register(`platforms.${index}.platform`)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm capitalize"
                >
                  <option value="">Platform</option>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p} className="capitalize">{p}</option>
                  ))}
                </select>
                <Input
                  {...register(`platforms.${index}.handle`)}
                  placeholder="@handle"
                  className="flex-1"
                />
                <Input
                  {...register(`platforms.${index}.followers`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Followers"
                  className="w-28"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePlatform(index)}
                  disabled={platformFields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => addPlatform({ platform: "", handle: "", followers: 0 })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add platform
          </Button>
        </div>

        {/* Rate card */}
        <div>
          <Label className="mb-2 block">Rate card (USD)</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["reel", "post", "story"] as const).map((type) => (
              <div key={type}>
                <Label className="text-xs mb-1 block capitalize">{type}</Label>
                <Input
                  {...register(`rateCard.${type}`, { valueAsNumber: true })}
                  type="number"
                  placeholder="$"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Engagement rate */}
        <div>
          <Label className="mb-1 block">Average engagement rate (%)</Label>
          <Input
            {...register("avgEngagementRate", { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g. 4.5"
            className="max-w-xs"
          />
        </div>

        {/* Audience summary */}
        <div>
          <Label className="mb-1 block">Audience summary</Label>
          <Textarea
            {...register("audienceSummary")}
            placeholder="Describe your audience — age range, gender split, top countries…"
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-[#FF6B35] hover:bg-[#C4622D] text-white">
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>

      {/* Campaign proposals */}
      {matches.length > 0 && (
        <div className="border-t border-border pt-8">
          <h3 className="text-lg font-semibold mb-4">Campaign proposals</h3>
          <div className="space-y-3">
            {matches.map((match: any) => (
              <div key={match.id} className="bg-muted/50 border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{match.Campaign?.title ?? "Untitled campaign"}</p>
                    {match.Campaign?.briefSummary && (
                      <p className="text-muted-foreground text-xs mt-1">{match.Campaign.briefSummary}</p>
                    )}
                    {match.deliverables && (
                      <p className="text-xs mt-1 text-muted-foreground">Deliverables: {match.deliverables}</p>
                    )}
                    {match.agreedRate && (
                      <p className="text-xs mt-1 text-muted-foreground">Rate: {match.agreedRate}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${MATCH_STATUS_LABELS[match.status]?.color}`}>
                    {MATCH_STATUS_LABELS[match.status]?.label ?? match.status}
                  </span>
                </div>
                {match.status === "PROPOSED" && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      onClick={() => handleProposalResponse(match.id, "ACCEPTED")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleProposalResponse(match.id, "DECLINED")}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
