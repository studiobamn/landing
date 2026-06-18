"use client";

// Bottom-left inquiry blocks — red category labels + plain instruction lines.
// These replace a contact form: direct people to email. Each item is tagged
// data-inquiry so ContactView can stagger them in.

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { ContactInquiries } from "@/types";

interface InquiryBlocksProps {
  inquiries: ContactInquiries;
}

export const InquiryBlocks = forwardRef<HTMLDivElement, InquiryBlocksProps>(
  function InquiryBlocks({ inquiries }, ref) {
    const { t } = useTranslation();
    return (
      <div ref={ref} className="max-w-sm">
        {inquiries.heading && (
          <h3
            data-inquiry
            className="font-secondary mb-5 text-xs tracking-widest text-bamn-red uppercase"
          >
            {inquiries.heading}
          </h3>
        )}
        <div className="space-y-5">
          {inquiries.items.map((item, i) => (
            <div key={item.label} data-inquiry>
              <p className="font-secondary text-xs tracking-wide text-bamn-red">
                {t(`db.siteContent.contactInquiry${i}Label`, { defaultValue: item.label })}
              </p>
              <p className="font-secondary mt-1 text-sm text-bamn-black/80">
                {t(`db.siteContent.contactInquiry${i}Text`, { defaultValue: item.text })}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
