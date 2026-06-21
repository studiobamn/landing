"use client";

// Expanded product modal. Root box carries modalRef (the FLIP target driven by
// useProductModal). Swatches crossfade the main image (GSAP). The single CTA is
// an inline mini-form (Option A) that posts to /api/contact with the product
// name pre-filled — the only commerce interaction on the site.

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

const pSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");
import gsap from "gsap";
import { resolveMediaUrl } from "@/lib/drive";
import { CROSSFADE_S } from "./constants";
import type { ProductWithVariants } from "@/types";

interface ProductModalProps {
  product: ProductWithVariants;
  onClose: () => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
}

export function ProductModal({
  product,
  onClose,
  modalRef,
}: ProductModalProps) {
  const { t } = useTranslation();
  const slug = pSlug(product.name);
  const imgRef = useRef<HTMLImageElement>(null);
  const [variant, setVariant] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const variants = product.variants;
  const src = resolveMediaUrl(variants[variant]?.drive_id);

  useEffect(() => {
    if (imgRef.current) {
      gsap.fromTo(
        imgRef.current,
        { opacity: 0 },
        { opacity: 1, duration: CROSSFADE_S / 2, ease: "power1.out" },
      );
    }
  }, [variant]);

  const showVariant = (i: number) => {
    if (i === variant || !imgRef.current) return;
    gsap.to(imgRef.current, {
      opacity: 0,
      duration: CROSSFADE_S / 2,
      ease: "power1.in",
      onComplete: () => setVariant(i),
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.name,
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      setSent(res.ok);
    } catch {
      setSent(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      ref={modalRef}
      className="relative z-10 grid max-h-[85vh] w-[88vw] max-w-[900px] grid-cols-1 gap-8 overflow-y-auto bg-bamn-cream p-8 md:grid-cols-2"
      data-lenis-prevent
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.close")}
        className="font-secondary absolute top-4 right-4 cursor-pointer text-2xl leading-none text-bamn-black transition-opacity hover:opacity-60"
      >
        ×
      </button>

      {/* Left — image + swatches */}
      <div>
        <div className="relative aspect-[4/5] w-full select-none overflow-hidden">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt={product.name}
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bamn-muted/20 text-sm text-bamn-muted">
              {product.name}
            </div>
          )}
          {variants.length > 1 && (
            <>
              <div
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                onClick={() => showVariant((variant - 1 + variants.length) % variants.length)}
              />
              <div
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                onClick={() => showVariant((variant + 1) % variants.length)}
              />
            </>
          )}
        </div>
        {variants.length > 1 && (
          <div className="mt-4 flex gap-3">
            {variants.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => showVariant(i)}
                aria-label={
                  v.label ?? t("productModal.variant", { number: i + 1 })
                }
                className={`h-3 w-3 rounded-full border border-bamn-black transition-colors ${
                  i === variant ? "bg-bamn-black" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right — info + CTA */}
      <div className="flex flex-col">
        <h2 className="font-primary text-3xl font-bold text-bamn-black">
          {product.name}
        </h2>
        {product.volume && (
          <p className="font-secondary mt-1 text-xs tracking-wide text-bamn-muted">
            {product.volume}
          </p>
        )}
        {i18n.exists(`db.products.${slug}.description`) && (
          <p className="font-secondary mt-5 text-sm leading-relaxed text-bamn-black/80">
            {t(`db.products.${slug}.description`)}
          </p>
        )}
        <dl className="font-secondary mt-5 space-y-1 text-xs text-bamn-muted">
          {i18n.exists(`db.products.${slug}.materials`) && (
            <div className="flex gap-2">
              <dt className="uppercase">{t("productModal.materials")}</dt>
              <dd className="text-bamn-black/70">
                {t(`db.products.${slug}.materials`)}
              </dd>
            </div>
          )}
          {product.dimensions && (
            <div className="flex gap-2">
              <dt className="uppercase">{t("productModal.dimensions")}</dt>
              <dd className="text-bamn-black/70">{product.dimensions}</dd>
            </div>
          )}
        </dl>

        {product.available && (
          <div className="mt-auto pt-8">
            {!formOpen ? (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="font-secondary w-full cursor-pointer border border-bamn-black px-4 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream"
              >
                {t("productModal.getInTouch")}
              </button>
            ) : sent ? (
              <p className="font-secondary text-sm text-bamn-black">
                {t("productModal.thankYou", { productName: product.name })}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  name="name"
                  placeholder={t("form.name")}
                  required
                  className="font-secondary border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
                />
                <input
                  name="email"
                  type="email"
                  placeholder={t("form.email")}
                  required
                  className="font-secondary border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
                />
                <textarea
                  name="message"
                  rows={3}
                  defaultValue={t("productModal.interested", {
                    productName: product.name,
                  })}
                  className="font-secondary resize-none border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="font-secondary cursor-pointer border border-bamn-black px-4 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
                >
                  {sending ? t("form.sending") : t("form.sendInquiry")}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
