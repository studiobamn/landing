"use client";

// Single location (Caracas) with label/value rows. Email → mailto, phone → tel.

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { ContactLocation } from "@/types";

interface LocationBlockProps {
  location: ContactLocation;
}

export const LocationBlock = forwardRef<HTMLDivElement, LocationBlockProps>(
  function LocationBlock({ location }, ref) {
    const { t } = useTranslation();
    return (
      <div ref={ref}>
        <h2 className="font-primary text-2xl font-bold tracking-tight text-bamn-black">
          {location.city}
        </h2>

        <dl className="font-secondary mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          {location.phone && (
            <>
              <dt className="text-bamn-muted">{t("location.phone")}</dt>
              <dd>
                <a
                  href={`tel:${location.phone.replace(/\s+/g, "")}`}
                  className="text-bamn-black transition-opacity hover:opacity-60"
                >
                  {location.phone}
                </a>
              </dd>
            </>
          )}
          {location.email && (
            <>
              <dt className="text-bamn-muted">{t("location.email")}</dt>
              <dd>
                <a
                  href={`mailto:${location.email}`}
                  className="text-bamn-red transition-opacity hover:opacity-60"
                >
                  {location.email}
                </a>
              </dd>
            </>
          )}
          {location.address && location.address.length > 0 && (
            <>
              <dt className="text-bamn-muted">{t("location.address")}</dt>
              <dd className="text-bamn-black">
                {location.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
      </div>
    );
  },
);
