"use client";

import React, { FC, ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import heroDog from "@/public/images/hero-dog.png";

interface VolunteerTextProps {
  /** An array of string lines to be rendered */
  lines: string[];
  /** The HTML tag or component to use for each line (default = "p") */
  tag?: ElementType;
  /** Any additional classes to apply to each line */
  className?: string;
}

const VolunteerText: FC<VolunteerTextProps> = ({
  lines,
  tag: Tag = "p",
  className = "",
}) => {
  return (
    <>
      {lines.map((line, idx) => (
        <Tag key={idx} className={className}>
          {line}
        </Tag>
      ))}
    </>
  );
};

interface SectionHeadingProps {
  /** The text to be displayed by the heading */
  text: string;
}

const SectionHeading: FC<SectionHeadingProps> = ({ text }) => {
  return (
    <div className="relative mx-auto">
      <h2 className="text-[123px]/[153.75px] font-medium text-transparent font-outline-4">
        {text}
      </h2>
      <h2
        className="text-[123px]/[153.75px] font-medium text-[#ABE34D] top-0 absolute"
        aria-hidden="true"
      >
        {text}
      </h2>
    </div>
  );
};

export const VolunteerSection: FC = () => {
  const t = useTranslations("Volunteer");

  const volunteerContent1 = t.raw("content1") as string[];
  const volunteerContent2 = t.raw("content2") as string[];

  return (
    <section className="relative w-full bg-[#ABE34D] rounded-[20px] overflow-hidden px-4 py-8">
      {/* Background image */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
        <Image
          src={heroDog}
          alt={t("imageAlt")}
          priority
          className="object-contain max-w-[520px] max-h-[520px]"
        />
      </div>

      {/* Heading */}
      <div className="flex justify-center mb-20">
        <SectionHeading text={t("title")} />
      </div>

      {/* Content blocks */}
      <div className="flex flex-col">
        {/* Right-aligned text block */}
        <div className="flex justify-end">
          <div className="flex flex-col justify-start mr-40">
            <VolunteerText
              lines={volunteerContent2}
              tag="span"
              className="pl-10 text-black text-lg/[22.5px]"
            />
          </div>
        </div>

        {/* Left-aligned text block + button */}
        <div className="flex justify-start">
          <div className="flex flex-col gap-y-8">
            <div className="flex flex-col justify-start">
              <VolunteerText
                lines={volunteerContent1}
                tag="p"
                className="text-black text-lg/[22.5px]"
              />
            </div>
            <Link
              href="/listings/create"
              className="text-center inline-block bg-[#333333] text-white text-nowrap py-2 px-5 rounded-2xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
              aria-label={t("postListingAria")}
            >
              <span>{t("postListing")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
