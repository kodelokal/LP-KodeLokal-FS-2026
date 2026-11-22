import Image from "next/image";

type BrandLogoProps = {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  className = "h-10 w-auto",
  priority = false,
}: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/brand/logo-mark.png"
        alt="Logo Maskot KodeLokal"
        width={120}
        height={132}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <span className="inline-flex items-center">
      <Image
        src="/brand/logo-full-light.png"
        alt="KodeLokal — Mitra Digital Anda"
        width={310}
        height={120}
        priority={priority}
        className={`block dark:hidden ${className}`}
      />
      <Image
        src="/brand/logo-full-dark.png"
        alt="KodeLokal — Mitra Digital Anda"
        width={310}
        height={120}
        priority={priority}
        className={`hidden dark:block ${className}`}
      />
    </span>
  );
}
