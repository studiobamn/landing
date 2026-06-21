import { ContactSocial } from "@/types";
import React from "react";
interface HomeFooterProps {
  socials: ContactSocial[] | null;
}

const HomeFooter: React.FC<HomeFooterProps> = ({ socials }) => {
  return (
    <div className="w-full flex justify-around items-center" data-drop>
      {socials?.map((s, i) => (
        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">
          <p className="text-bamn-red font-primary text-xs md:text-lg">
            {s.label}
          </p>
        </a>
      ))}
    </div>
  );
};

export default HomeFooter;
