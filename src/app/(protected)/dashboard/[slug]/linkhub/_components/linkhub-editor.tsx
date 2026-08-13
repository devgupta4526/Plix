"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  Trash2,
  GripVertical,
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import PublicProfileRenderer from "@/components/global/public-profile-renderer";
import { detectPlatformIcon } from "@/lib/platform-icon";
import {
  getOrCreateProfile,
  updateProfile,
  checkUsernameAvailable,
} from "@/actions/profile";
import { createLink, deleteLink, reorderLinks, updateLink } from "@/actions/links";
import type { ThemeConfig } from "@/types/linkhub";

// ── Types ──────────────────────────────────────────────────────────────────

type LinkRow = {
  id: string;
  label: string;
  url: string;
  icon?: string | null;
  clicks: number;
  active: boolean;
};

type ProfileData = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  themeId: string;
  themeConfig: unknown;
  published: boolean;
};

// ── Sortable link row ──────────────────────────────────────────────────────

function SortableLinkRow({
  link,
  onDelete,
  onToggle,
}: {
  link: LinkRow;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-[#666] hover:text-white">
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{link.label}</p>
        <p className="text-xs text-[#888] truncate">{link.url}</p>
      </div>
      <input
        type="checkbox"
        checked={link.active}
        onChange={(e) => onToggle(link.id, e.target.checked)}
        aria-label="Toggle link"
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <Button
        variant="ghost"
        size="icon"
        className="text-[#666] hover:text-red-400"
        onClick={() => onDelete(link.id)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

// ── Main editor ────────────────────────────────────────────────────────────

export default function LinkhubEditor({
  initialProfile,
  initialLinks,
  slug,
}: {
  initialProfile: ProfileData;
  initialLinks: LinkRow[];
  slug: string;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // ── debounced profile save ──
  const debouncedSave = useCallback(
    (updates: Partial<typeof profile>) => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(() => {
        startTransition(async () => {
          const res = await updateProfile(updates as Parameters<typeof updateProfile>[0]);
          if (res.status !== 200) toast.error("Failed to save profile");
        });
      }, 800);
    },
    []
  );

  function handleProfileChange<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    debouncedSave({ [key]: value });

    if (key === "username") {
      const val = value as string;
      setUsernameStatus("checking");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const res = await checkUsernameAvailable(val);
        setUsernameStatus(res.available ? "ok" : "taken");
      }, 500);
    }
  }

  // ── add link ──
  async function handleAddLink() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const icon = detectPlatformIcon(newUrl);
    startTransition(async () => {
      const res = await createLink({ label: newLabel, url: newUrl, icon });
      if (res.status === 200 && res.data) {
        setLinks((prev) => [...prev, { ...(res.data as any), active: true, clicks: 0 }]);
        setNewLabel("");
        setNewUrl("");
        toast.success("Link added");
      } else {
        toast.error("Failed to add link");
      }
    });
  }

  // ── delete link ──
  async function handleDeleteLink(id: string) {
    startTransition(async () => {
      const res = await deleteLink(id);
      if (res.status === 200) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
        toast.success("Link deleted");
      } else {
        toast.error("Failed to delete link");
      }
    });
  }

  // ── toggle active ──
  async function handleToggleLink(id: string, active: boolean) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, active } : l)));
    await updateLink(id, { active });
  }

  // ── drag end ──
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);
    setLinks(reordered);
    reorderLinks(reordered.map((l) => l.id));
  }

  // ── avatar upload ──
  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/linkhub/upload-avatar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.url) {
        handleProfileChange("avatarUrl", json.url);
        toast.success("Avatar updated");
      }
    } catch {
      toast.error("Upload failed");
    }
  }

  const activeLinks = links.filter((l) => l.active);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      {/* ── editor panel ── */}
      <div className="flex-1 max-w-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">LinkHub</h1>
            <p className="text-sm text-[#888]">
              {profile.published ? (
                <span className="text-green-400">● Live at /u/{profile.username}</span>
              ) : (
                <span className="text-yellow-400">● Draft — not published</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] hover:text-white"
            >
              <ExternalLink size={18} />
            </a>
            <div className="flex items-center gap-2">
              <label htmlFor="publish-toggle" className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="publish-toggle"
                  checked={profile.published}
                  onChange={(e) => handleProfileChange("published", e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <span className="text-sm text-[#888]">
                  {profile.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </span>
              </label>
            </div>
          </div>
        </div>

        <Separator className="bg-[#333]" />

        {/* Profile fields */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-wider">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border border-[#444]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center text-xl text-white font-bold">
                {(profile.displayName ?? "U").charAt(0)}
              </div>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
              <span className="flex items-center gap-1 text-sm text-[#888] hover:text-white border border-[#444] rounded-lg px-3 py-2">
                <Upload size={14} /> Upload avatar
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[#aaa] text-sm">Username</label>
              <div className="relative">
                <Input
                  value={profile.username}
                  onChange={(e) => handleProfileChange("username", e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white"
                  placeholder="yourname"
                />
                {usernameStatus === "taken" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400">
                    Taken
                  </span>
                )}
                {usernameStatus === "ok" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">
                    Available
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-[#aaa] text-sm">Display name</label>
              <Input
                value={profile.displayName ?? ""}
                onChange={(e) => handleProfileChange("displayName", e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="text-[#aaa] text-sm">Bio</label>
              <Textarea
                value={profile.bio ?? ""}
                onChange={(e) => handleProfileChange("bio", e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white resize-none"
                rows={3}
                maxLength={160}
                placeholder="Tell the world about yourself…"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-[#333]" />

        {/* Links section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#aaa] uppercase tracking-wider">Links</h2>
            <Badge variant="outline" className="text-[#666] border-[#444]">
              {links.length} link{links.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Add new link */}
          <div className="flex flex-col gap-2 bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
            <Input
              placeholder="Label (e.g. My YouTube)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="bg-[#111] border-[#333] text-white"
            />
            <Input
              placeholder="URL (e.g. https://youtube.com/…)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="bg-[#111] border-[#333] text-white"
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            />
            <Button
              onClick={handleAddLink}
              disabled={isPending || !newLabel.trim() || !newUrl.trim()}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
            >
              <Plus size={16} className="mr-2" /> Add link
            </Button>
          </div>

          {/* Sortable links */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {links.map((link) => (
                  <SortableLinkRow
                    key={link.id}
                    link={link}
                    onDelete={handleDeleteLink}
                    onToggle={handleToggleLink}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {links.length === 0 && (
            <p className="text-center text-[#555] text-sm py-6">No links yet — add one above</p>
          )}
        </div>

        {/* Design link */}
        <div className="pt-2">
          <a
            href={`/dashboard/${slug}/linkhub/design`}
            className="block w-full text-center text-sm text-[#888] hover:text-white border border-[#333] rounded-xl py-3"
          >
            🎨 Customize design & template →
          </a>
        </div>
      </div>

      {/* ── live preview ── */}
      <div className="hidden lg:block w-[300px] flex-shrink-0">
        <div className="sticky top-8">
          <p className="text-xs text-[#666] mb-2 text-center uppercase tracking-wider">Preview</p>
          <div
            className="w-[300px] h-[620px] rounded-[32px] border-4 border-[#333] overflow-hidden relative bg-white"
            style={{ boxShadow: "0 0 0 8px #111" }}
          >
            <div className="w-full h-full overflow-hidden">
              <div style={{ width: "285%", height: "285%", transform: "scale(0.35)", transformOrigin: "top left" }}>
                <PublicProfileRenderer
                  profile={profile}
                  links={activeLinks}
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
