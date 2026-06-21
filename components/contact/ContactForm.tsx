"use client";

import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface ContactFormConfig {
  main: string[];
  options: Record<string, string[]>;
}

interface ContactFormProps {
  config: ContactFormConfig;
}

export const ContactForm = forwardRef<HTMLDivElement, ContactFormProps>(
  function ContactForm({ config }, ref) {
    const { t } = useTranslation();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [projectType, setProjectType] = useState("");
    const [projectCategory, setProjectCategory] = useState<string[]>([]);

    const subOptions = projectType ? (config.options[projectType] ?? []) : [];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      setSending(true);
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.get("name"),
            email: data.get("email"),
            phone: data.get("phone"),
            message: data.get("message"),
            projectType: projectType || undefined,
            projectCategory: projectCategory || undefined,
          }),
        });
        setSent(res.ok);
      } catch {
        setSent(false);
      } finally {
        setSending(false);
      }
    }

    const badgeBase =
      "font-secondary cursor-pointer border px-3 py-1 text-[10px] tracking-widest uppercase transition-colors";
    const inputBase =
      "font-secondary border border-bamn-muted/50 bg-transparent px-3 py-2 text-sm outline-none focus:border-bamn-black";

    return (
      <div ref={ref}>
        {sent ? (
          <p className="font-secondary text-sm text-bamn-black">
            {t("contact.thankYou")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Main type badges */}
            <div className="flex flex-col gap-2">
              {!projectType && <p>{t("form.projectType.label")}</p>}
              <div className="flex flex-wrap gap-2">
                {config.main.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setProjectType(type === projectType ? "" : type);
                      setProjectCategory([""]);
                    }}
                    className={`${badgeBase} ${
                      projectType === type
                        ? "border-bamn-black bg-bamn-black text-bamn-cream"
                        : "border-bamn-black bg-transparent text-bamn-black hover:bg-bamn-black hover:text-bamn-cream"
                    }`}
                  >
                    {/* {type} */}
                    {t("form.projectType." + type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-options — shown once a main type is selected */}
            {subOptions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      if (projectCategory.includes(opt)) {
                        setProjectCategory((prev) =>
                          prev.filter((c) => c !== opt),
                        );
                      } else {
                        setProjectCategory((prev) => [...prev, opt]);
                      }
                    }}
                    className={`${badgeBase} ${
                      projectCategory.includes(opt)
                        ? "border-bamn-black bg-bamn-black text-bamn-cream"
                        : "border-bamn-muted/50 bg-transparent text-bamn-black hover:border-bamn-black"
                    }`}
                  >
                    {t("form.projectType.options." + projectType + "." + opt)}
                  </button>
                ))}
              </div>
            )}
            {projectType && (
              <>
                <input
                  name="name"
                  placeholder={t("form.name")}
                  required
                  className={inputBase}
                />
                <input
                  name="email"
                  type="email"
                  placeholder={t("form.email")}
                  required
                  className={inputBase}
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Whatsapp"
                  className={inputBase}
                />
                <textarea
                  name="message"
                  rows={7}
                  placeholder={t("form.message")}
                  className={inputBase}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="font-secondary cursor-pointer border border-bamn-black px-4 py-3 text-xs tracking-widest uppercase transition-colors hover:bg-bamn-black hover:text-bamn-cream disabled:opacity-50"
                >
                  {sending ? t("form.sending") : t("form.sendInquiry")}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    );
  },
);
