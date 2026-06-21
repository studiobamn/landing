"use client";

// Inspect overlay — the expanded image + project info, in a layer covering the
// left region (decoupled from the columns' widths). The image and info refs are
// driven imperatively by useProjectsInspect (GSAP Flip.fit travel + fades).

import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { STAGE_WIDTH } from "./constants";
import { ProjectGallery } from "./ProjectGallery";
import { MainInfo } from "./MainInfo";
import { ProjectInfoImgs } from "./ProjectInfoImgs";
import { ProjectPhrases } from "./ProjectPhrases";
import type { ProjectWithImages } from "@/types";
import { resolveMediaUrl } from "@/lib/drive";
import useMobile from "@/hooks/useMobile";
import { CustomComp } from "@/components/CustomComp";

interface InspectStageProps {
  project: ProjectWithImages;
  onClose: () => void;
  imageRef: React.RefObject<HTMLDivElement | null>;
  infoRef: React.RefObject<HTMLDivElement | null>;
}

export function InspectStage({
  project,
  onClose,
  imageRef,
  infoRef,
}: InspectStageProps) {
  const { t } = useTranslation();
  const plain_h = resolveMediaUrl(project.plain_h_id);
  const isMobile = useMobile();
  return (
    <div
      data-root-inspect
      data-lenis-prevent
      className="pointer-events-auto absolute inset-y-0 left-0 overflow-x-hidden overflow-y-auto px-[6%] pt-5 pb-[8vh] mt-[8vh] scroll-bar-hidde"
      style={{ width: isMobile ? "100vw" : `${STAGE_WIDTH}vw` }}
    >
      <div className="relative inline-block w-full md:w-[95%] align-top">
        <ProjectGallery
          cover={project.cover_drive_id}
          images={project.images}
          stripWords={project.strip_words ?? []}
          imageRef={imageRef}
          onClose={onClose}
        />
      </div>

      <div
        ref={infoRef}
        className="mt-8 w-full md:w-[95%]"
        style={{ opacity: 0 }}
      >
        <h2 className="font-primary text-3xl md:text-5xl font-bold text-bamn-black">
          {project.title}
        </h2>

        <MainInfo project={project} />
        <ProjectInfoImgs project={project} />
        <div className="w-full flex justify-end">
          <ProjectPhrases
            phrases={project.phrases ?? []}
            slug={project.slug ?? ""}
          />
        </div>
        <div className="h-px w-full bg-bamn-muted" />
        <div className="flex flex-col md:flex-row gap-10 mt-5">
          {i18n.exists(`db.projects.${project.slug}.description`) && (
            <p className="font-secondary max-w-md text-sm text-justify leading-relaxed text-bamn-black/80">
              {t(`db.projects.${project.slug}.description`)}
            </p>
          )}
          {project.credits && Object.keys(project.credits).length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              {Object.keys(project.credits).map((name, i) => (
                <div
                  key={i}
                  className="flex gap-10 justify-between md:justify-start"
                >
                  <p className="font-secondary text-xs tracking-wide text-bamn-red">
                    {name}
                  </p>
                  <p className="font-secondary text-xs tracking-wide text-bamn-red">
                    {project.credits
                      ? t(`db.projectRoles.${project.credits[name]}`, {
                          defaultValue: project.credits[name],
                        })
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        {plain_h && (
          <div className="mt-24">
            <p className="uppercase text-bamn-black w-full text-right text-sm mb-2">
              {t("projects.architectPlan")}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plain_h}
              alt=""
              draggable={false}
              className="object-cover"
              style={{ width: "100%", height: isMobile ? 200 : 300 }}
            />
          </div>
        )}
        {project.sections.length > 0 && (
          <div className="flex flex-col gap-18 mt-16">
            {project.sections.map((section) => {
              const imgUrl = resolveMediaUrl(section.img) ?? section.img;
              return (
                <CustomComp
                  key={section.id}
                  imgUrl={imgUrl}
                  text={section.text}
                  imgPosition={section.img_position}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
