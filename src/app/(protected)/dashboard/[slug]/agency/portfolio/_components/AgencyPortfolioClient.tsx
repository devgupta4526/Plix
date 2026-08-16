"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createPortfolioItem,
  deletePortfolioItem,
  reorderPortfolioItems,
} from "@/actions/portfolio";
import { PortfolioItemSchema, type PortfolioItemInput } from "@/actions/portfolio/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GripVertical, Trash2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const CATEGORIES = ["AD", "SOCIAL_POST", "CAMPAIGN", "REEL", "BRAND_PROFILE"] as const;

type Item = {
  id: string;
  title: string;
  clientName: string;
  category: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  externalLink?: string | null;
  metrics?: any;
  featured: boolean;
  position: number;
  fullWriteup?: string | null;
  resultsSummary?: string | null;
  createdAt: Date;
};

function SortableItem({ item, onDelete }: { item: Item; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-background border border-border rounded-xl p-3"
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      {item.thumbnailUrl || item.mediaUrl ? (
        <img
          src={item.thumbnailUrl ?? item.mediaUrl}
          alt={item.title}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.clientName} · {item.category}</p>
      </div>
      {item.featured && (
        <span className="text-xs bg-[#C4622D]/20 text-[#C4622D] px-2 py-0.5 rounded-full">Featured</span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive flex-shrink-0"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function AgencyPortfolioClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const form = useForm<PortfolioItemInput>({
    resolver: zodResolver(PortfolioItemSchema),
    defaultValues: { title: "", clientName: "", category: "AD", mediaUrl: "", featured: false },
  });
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    await reorderPortfolioItems(newItems.map((i) => i.id));
  }

  async function handleDelete(id: string) {
    const res = await deletePortfolioItem(id);
    if (res.status === 200) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item deleted");
    }
  }

  async function onSubmit(data: PortfolioItemInput) {
    setSaving(true);
    const res = await createPortfolioItem(data);
    setSaving(false);
    if (res.status === 200) {
      setItems((prev) => [...prev, res.data as any]);
      reset();
      setShowForm(false);
      toast.success("Item added");
    } else {
      toast.error("Failed to add item");
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new item button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#FF6B35] hover:bg-[#C4622D] text-white"
        >
          {showForm ? <><X className="h-4 w-4 mr-1" /> Cancel</> : <><Plus className="h-4 w-4 mr-1" /> Add item</>}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-muted/40 border border-border rounded-2xl p-6">
          <h2 className="font-semibold mb-4">New portfolio item</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-sm">Title *</Label>
                <Input {...register("title")} />
                {errors.title && <p className="text-destructive text-xs mt-0.5">{errors.title.message}</p>}
              </div>
              <div>
                <Label className="mb-1 block text-sm">Client name *</Label>
                <Input {...register("clientName")} />
                {errors.clientName && <p className="text-destructive text-xs mt-0.5">{errors.clientName.message}</p>}
              </div>
              <div>
                <Label className="mb-1 block text-sm">Category *</Label>
                <select
                  {...register("category")}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1 block text-sm">Media URL *</Label>
                <Input {...register("mediaUrl")} placeholder="https://…" />
                {errors.mediaUrl && <p className="text-destructive text-xs mt-0.5">{errors.mediaUrl.message}</p>}
              </div>
              <div>
                <Label className="mb-1 block text-sm">Thumbnail URL</Label>
                <Input {...register("thumbnailUrl")} placeholder="https://… (optional)" />
              </div>
              <div>
                <Label className="mb-1 block text-sm">External link</Label>
                <Input {...register("externalLink")} placeholder="https://… (optional)" />
              </div>
            </div>
            <div>
              <Label className="mb-1 block text-sm">Description</Label>
              <Textarea {...register("description")} />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Results summary (case study)</Label>
              <Textarea {...register("resultsSummary")} placeholder="e.g. 2.3M reach, 8.4% engagement rate…" />
            </div>
            <div>
              <Label className="mb-1 block text-sm">Full write-up (case study body)</Label>
              <Textarea {...register("fullWriteup")} className="min-h-[120px]" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" {...register("featured")} className="rounded" />
              <Label htmlFor="featured" className="text-sm cursor-pointer">Feature this item on homepage</Label>
            </div>
            <Button type="submit" disabled={saving} className="bg-[#FF6B35] hover:bg-[#C4622D] text-white">
              {saving ? "Saving…" : "Add item"}
            </Button>
          </form>
        </div>
      )}

      {/* Sortable list */}
      {items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center text-muted-foreground text-sm">
          No portfolio items yet. Add your first one above.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
