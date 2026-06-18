import ProductView from "@/components/views/ProductView";
import { getProducts, getSiteContent } from "@/lib/queries";
import type { ProductLine } from "@/types";

export const revalidate = 60;

export default async function ProductPage() {
  const [products, line] = await Promise.all([
    getProducts(),
    getSiteContent<ProductLine>("product_line"),
  ]);
  return <ProductView products={products} line={line} />;
}
