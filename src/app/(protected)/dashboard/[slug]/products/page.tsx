import { getProducts } from "@/actions/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Bot } from "lucide-react";

type Props = { params: { slug: string } };

export default async function ProductsPage({ params }: Props) {
  const res = await getProducts();
  const products = res.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-[#888]">Manage your shop section and auto-DM promotions</p>
        </div>
        <Link href={`/dashboard/${params.slug}/products/new`}>
          <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">
            <Plus size={16} className="mr-2" /> Add product
          </Button>
        </Link>
      </div>

      {(products as any[]).length === 0 ? (
        <div className="border border-dashed border-[#333] rounded-2xl p-16 text-center">
          <p className="text-[#555] mb-4">No products yet</p>
          <Link href={`/dashboard/${params.slug}/products/new`}>
            <Button variant="outline" className="border-[#444]">
              <Plus size={16} className="mr-2" /> Add your first product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {(products as any[]).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 bg-[#1a1a1a] border border-[#333] rounded-xl p-4"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#333] flex items-center justify-center text-2xl flex-shrink-0">
                  🛍
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white truncate">{product.name}</p>
                  {product.price && (
                    <Badge variant="outline" className="text-xs border-[#444] text-[#888]">
                      {product.price}
                    </Badge>
                  )}
                  {product.autoDmEnabled && (
                    <Badge className="text-xs bg-purple-500/20 text-purple-300 border-0">
                      <Bot size={10} className="mr-1" /> Auto-DM
                    </Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-xs text-[#888] truncate">{product.description}</p>
                )}
                <div className="flex gap-4 mt-1 text-xs text-[#666]">
                  <span>{product.clicks} clicks</span>
                  {product.Automation?.listener && (
                    <>
                      <span>{product.Automation.listener.dmCount} DMs</span>
                      <span>{product.Automation.listener.commentCount} comments</span>
                    </>
                  )}
                </div>
              </div>
              <Link href={`/dashboard/${params.slug}/products/${product.id}/edit`}>
                <Button variant="ghost" size="icon" className="text-[#666] hover:text-white">
                  <Pencil size={16} />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
