"use client";

// Strict CSS grid of product cards — the one rigidly-ordered view (PRODUCT.md).
// 2 cols mobile → 3 tablet → 4 desktop.

import { ProductCard } from "./ProductCard";
import type { ProductWithVariants } from "@/types";

interface ProductGridProps {
  products: ProductWithVariants[];
  onOpen: (product: ProductWithVariants, originEl: HTMLElement | null) => void;
}

export function ProductGrid({ products, onOpen }: ProductGridProps) {
  return (
    <div
      style={{ flexWrap: "wrap" }}
      className="flex w-full gap-[100px] justify-end"
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} />
      ))}
    </div>
  );
}
