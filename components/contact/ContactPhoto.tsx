"use client";

// The single editorial photo of the studio principals — anchored bottom-right.

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/lib/drive";
import type { ContactPhoto as ContactPhotoData } from "@/types";

interface ContactPhotoProps {
  photo: ContactPhotoData;
}

export const ContactPhoto = forwardRef<HTMLDivElement, ContactPhotoProps>(
  function ContactPhoto({ photo }, ref) {
    const { t } = useTranslation();
    const src = resolveMediaUrl(photo.src);
    return (
      <figure ref={ref} className="w-full max-w-[460px]">
        <div className="aspect-[4/5] w-full overflow-hidden">
          {src ? (
            // Drive/external media → raw <img> (STACK.md).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={photo.caption ?? "BAMN studio"}
              draggable={false}
              className="h-full w-full object-cover grayscale"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bamn-muted/20 text-xs text-bamn-muted">
              studio
            </div>
          )}
        </div>
        {photo.caption && (
          <figcaption className="font-secondary mt-2 text-right text-xs text-bamn-muted">
            {t("db.siteContent.contactPhotoCaption", { defaultValue: photo.caption })}
          </figcaption>
        )}
      </figure>
    );
  },
);
