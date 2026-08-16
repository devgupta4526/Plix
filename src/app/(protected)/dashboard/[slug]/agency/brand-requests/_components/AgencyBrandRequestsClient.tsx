"use client";

import { useState } from "react";
import { updateBrandRequestStatus, createCampaign } from "@/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const STATUSES = ["NEW", "REVIEWING", "MATCHED", "IN_PROGRESS", "COMPLETED", "CLOSED"] as const;
const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400",
  REVIEWING: "bg-yellow-500/20 text-yellow-400",
  MATCHED: "bg-purple-500/20 text-purple-400",
  IN_PROGRESS: "bg-orange-500/20 text-orange-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
};

type BrandRequest = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  industry?: string | null;
  budgetRange?: string | null;
  campaignGoals?: string | null;
  targetAudience?: string | null;
  deliverables: string[];
  nicheNeeded: string[];
  timeline?: string | null;
  status: string;
  internalNotes?: string | null;
  createdAt: Date;
  campaigns: { id: string; title: string; status: string }[];
};

export default function AgencyBrandRequestsClient({ initialRequests }: { initialRequests: BrandRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [campaignTitle, setCampaignTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [creating, setCreating] = useState<string | null>(null);

  const selected = requests.find((r) => r.id === selectedId);
  const filtered = filterStatus === "ALL" ? requests : requests.filter((r) => r.status === filterStatus);

  async function handleStatusChange(id: string, status: string) {
    const req = requests.find((r) => r.id === id);
    const res = await updateBrandRequestStatus(id, status, notes[id] ?? req?.internalNotes ?? undefined);
    if (res.status === 200) {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success("Status updated");
    }
  }

  async function handleNotesSave(id: string) {
    const res = await updateBrandRequestStatus(id, requests.find((r) => r.id === id)!.status, notes[id]);
    if (res.status === 200) {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, internalNotes: notes[id] } : r));
      toast.success("Notes saved");
    }
  }

  async function handleCreateCampaign(brandRequestId: string) {
    if (!campaignTitle.trim()) { toast.error("Enter a campaign title"); return; }
    setCreating(brandRequestId);
    const res = await createCampaign(brandRequestId, campaignTitle);
    setCreating(null);
    if (res.status === 200) {
      toast.success("Campaign created");
      setCampaignTitle("");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === brandRequestId
            ? { ...r, campaigns: [...r.campaigns, { id: res.data.id, title: campaignTitle, status: "OPEN" }] }
            : r
        )
      );
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
      {/* List */}
      <div className="lg:col-span-1 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {["ALL", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {filtered.map((req) => (
          <div
            key={req.id}
            onClick={() => {
              setSelectedId(req.id);
              if (!notes[req.id]) setNotes((n) => ({ ...n, [req.id]: req.internalNotes ?? "" }));
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              selectedId === req.id ? "border-[#C4622D] bg-[#C4622D]/5" : "border-border hover:border-[#C4622D]/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{req.companyName}</p>
                <p className="text-xs text-muted-foreground">{req.contactName} · {req.contactEmail}</p>
                {req.budgetRange && <p className="text-xs text-muted-foreground mt-0.5">{req.budgetRange}</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status]}`}>
                {req.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No requests found</p>
        )}
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-2">
        {!selected ? (
          <div className="flex items-center justify-center h-full border border-dashed border-border rounded-xl text-muted-foreground text-sm">
            Select a request to view details
          </div>
        ) : (
          <div className="border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{selected.companyName}</h2>
                <p className="text-muted-foreground text-sm">{selected.contactName} · {selected.contactEmail}
                  {selected.contactPhone && ` · ${selected.contactPhone}`}</p>
              </div>
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-1.5 text-sm"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selected.industry && <div><span className="text-muted-foreground">Industry:</span> {selected.industry}</div>}
              {selected.budgetRange && <div><span className="text-muted-foreground">Budget:</span> {selected.budgetRange}</div>}
              {selected.timeline && <div><span className="text-muted-foreground">Timeline:</span> {selected.timeline}</div>}
            </div>

            {selected.campaignGoals && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Goals</p>
                <p className="text-sm">{selected.campaignGoals}</p>
              </div>
            )}

            {selected.targetAudience && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Target Audience</p>
                <p className="text-sm">{selected.targetAudience}</p>
              </div>
            )}

            {selected.deliverables.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Deliverables</p>
                <div className="flex flex-wrap gap-1">
                  {selected.deliverables.map((d) => (
                    <span key={d} className="text-xs bg-muted px-2 py-0.5 rounded">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.nicheNeeded.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Niches needed</p>
                <div className="flex flex-wrap gap-1">
                  {selected.nicheNeeded.map((n) => (
                    <span key={n} className="text-xs bg-[#8A9A5B]/20 text-[#8A9A5B] px-2 py-0.5 rounded">{n}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Internal notes */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Internal notes</p>
              <Textarea
                value={notes[selected.id] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [selected.id]: e.target.value }))}
                placeholder="Agency-only notes…"
                className="min-h-[80px] text-sm"
              />
              <Button size="sm" variant="outline" className="mt-2" onClick={() => handleNotesSave(selected.id)}>
                Save notes
              </Button>
            </div>

            {/* Campaigns */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Campaigns</p>
              {selected.campaigns.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {selected.campaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{c.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{c.status}</span>
                        <Link
                          href={`/dashboard/agency/campaigns/${c.id}`}
                          className="text-xs text-[#FF6B35] hover:underline"
                        >
                          Open →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">No campaigns yet</p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Campaign title"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => handleCreateCampaign(selected.id)}
                  disabled={creating === selected.id}
                  className="bg-[#FF6B35] hover:bg-[#C4622D] text-white whitespace-nowrap"
                >
                  {creating === selected.id ? "Creating…" : "Create campaign"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
