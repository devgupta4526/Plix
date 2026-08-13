"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createProduct } from "@/actions/products";

type Props = { slug: string };

export default function NewProductForm({ slug }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [promoUrl, setPromoUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Get it");

  // Auto-DM state
  const [autoDmEnabled, setAutoDmEnabled] = useState(false);
  const [dmMode, setDmMode] = useState<"comment" | "dm" | "smartai">("comment");
  const [keyword, setKeyword] = useState("");
  const [postId, setPostId] = useState("");

  function handleSubmit() {
    if (!name.trim() || !promoUrl.trim()) {
      toast.error("Name and promo URL are required");
      return;
    }
    if (autoDmEnabled && !keyword.trim()) {
      toast.error("Keyword is required for auto-DM");
      return;
    }

    startTransition(async () => {
      const res = await createProduct({
        name,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        price: price || undefined,
        promoUrl,
        ctaLabel,
        autoDmEnabled,
        dmMode: autoDmEnabled ? dmMode : undefined,
        keyword: autoDmEnabled ? keyword : undefined,
        postId: autoDmEnabled && dmMode === "comment" && postId ? postId : undefined,
      });

      if (res.status === 200) {
        toast.success("Product created!");
        router.push(`/dashboard/${slug}/products`);
        router.refresh();
      } else {
        toast.error(String(res.data) || "Failed to create product");
      }
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">New product</h1>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-[#aaa]">Product name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white"
            placeholder="My Amazing Course"
          />
        </div>
        <div>
          <label className="text-sm text-[#aaa]">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white resize-none"
            rows={3}
            placeholder="Short description…"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#aaa]">Price (display)</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white"
              placeholder="$29"
            />
          </div>
          <div>
            <label className="text-sm text-[#aaa]">CTA button label</label>
            <Input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="bg-[#1a1a1a] border-[#333] text-white"
              placeholder="Get it"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-[#aaa]">Promo / affiliate URL *</label>
          <Input
            value={promoUrl}
            onChange={(e) => setPromoUrl(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white"
            placeholder="https://yourproduct.com"
          />
        </div>
        <div>
          <label className="text-sm text-[#aaa]">Product image URL</label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white"
            placeholder="https://…"
          />
        </div>
      </div>

      <Separator className="bg-[#333]" />

      {/* Auto-DM toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Enable Auto-DM</p>
            <p className="text-xs text-[#888]">
              Automatically send this product link when someone uses a keyword
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoDmEnabled}
              onChange={(e) => setAutoDmEnabled(e.target.checked)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
          </label>
        </div>

        {autoDmEnabled && (
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 space-y-4">
            <div>
              <label className="text-sm text-[#aaa]">Trigger mode</label>
              <select
                value={dmMode}
                onChange={(e) => setDmMode(e.target.value as "comment" | "dm" | "smartai")}
                className="w-full mt-1 bg-[#1a1a1a] border border-[#333] text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="comment">Comment-triggered (post comment → auto-DM)</option>
                <option value="dm">DM-triggered (keyword in DM → auto-reply)</option>
                <option value="smartai">Smart AI (AI answers questions + sends link)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-[#aaa]">
                Keyword{" "}
                <span className="text-[#666]">
                  — when someone uses this word, they get the link
                </span>
              </label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white mt-1"
                placeholder={name || "PRODUCTNAME"}
              />
            </div>

            {dmMode === "comment" && (
              <div>
                <label className="text-sm text-[#aaa]">
                  Post ID{" "}
                  <span className="text-[#666] text-xs">(optional — leave blank to match any post)</span>
                </label>
                <Input
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white mt-1"
                  placeholder="Instagram post ID"
                />
              </div>
            )}

            {dmMode === "smartai" && (
              <div className="text-xs text-[#666] bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                💡 AI will receive your product name, description, and promo URL as context to answer
                follow-up questions naturally before sending the link.
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
      >
        {isPending ? "Creating…" : "Create product"}
      </Button>
    </div>
  );
}
