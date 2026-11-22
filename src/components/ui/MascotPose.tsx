"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export type MascotExpression =
  | "hello"
  | "thinking"
  | "confused"
  | "yay"
  | "coding"
  | "idea"
  | "sleepy"
  | "top";

const MASCOT_ALT: Record<MascotExpression, string> = {
  hello: "Maskot KodeLokal menyapa pengunjung",
  thinking: "Maskot KodeLokal sedang berpikir",
  confused: "Maskot KodeLokal sedang mencari",
  yay: "Maskot KodeLokal merayakan keberhasilan",
  coding: "Maskot KodeLokal sedang coding di laptop oranye",
  idea: "Maskot KodeLokal mendapatkan ide cemerlang",
  sleepy: "Maskot KodeLokal sedang beristirahat menunggu fitur baru",
  top: "Maskot KodeLokal mengacungkan jempol kualitas terbaik",
};

type MascotPoseProps = {
  pose: MascotExpression;
  size?: number;
  float?: boolean;
  bubble?: string;
  className?: string;
  priority?: boolean;
};

export function MascotPose({
  pose,
  size = 150,
  float = true,
  bubble,
  className = "",
  priority = false,
}: MascotPoseProps) {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {bubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mb-2 rounded-2xl border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm"
        >
          {bubble}
        </motion.div>
      )}
      <motion.div
        animate={
          float
            ? {
                y: [0, -7, 0],
              }
            : undefined
        }
        transition={
          float
            ? {
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : undefined
        }
        whileHover={{ scale: 1.06, rotate: pose === "yay" ? -3 : 2 }}
        className="select-none"
      >
        <Image
          src={`/mascot/${pose}.png`}
          alt={MASCOT_ALT[pose]}
          width={size}
          height={size}
          priority={priority}
          className="h-auto w-auto max-w-full drop-shadow-[0_12px_20px_rgba(20,58,89,0.16)] dark:drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
          style={{ width: size }}
        />
      </motion.div>
    </div>
  );
}
