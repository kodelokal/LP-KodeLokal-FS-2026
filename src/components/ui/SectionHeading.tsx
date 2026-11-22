"use client";

import * as React from "react";
import { FadeIn } from "@/components/ui/MotionPrimitives";

type SectionHeadingProps = {
  watermark: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  highlightColor?: "blue" | "orange";
  subtitle?: string;
};

export function SectionHeading({
  watermark,
  titlePrefix,
  titleHighlight,
  titleSuffix = "",
  highlightColor = "blue",
  subtitle,
}: SectionHeadingProps) {
  return (
    <FadeIn className="relative mx-auto max-w-3xl pt-6 text-center">
      {/* Large subtle watermark behind title */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-5xl font-black tracking-[0.14em] whitespace-nowrap text-ink/[0.045] uppercase select-none sm:text-7xl md:text-8xl dark:text-white/[0.045]"
      >
        {watermark}
      </span>

      <h2 className="relative z-10 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.14]">
        {titlePrefix}{" "}
        <span className={highlightColor === "orange" ? "text-brand-orange" : "text-brand-blue"}>
          {titleHighlight}
        </span>
        {titleSuffix ? ` ${titleSuffix}` : ""}
      </h2>

      {subtitle && (
        <p className="relative z-10 mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
