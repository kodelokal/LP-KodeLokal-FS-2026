import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KodeLokal — Mitra Digital Anda",
    short_name: "KodeLokal",
    description:
      "Jasa pembuatan website, landing page, toko online, aplikasi web custom, dan CMS modern dengan pelacakan progres real-time.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafbfd",
    theme_color: "#3592d4",
    lang: "id",
    icons: [
      {
        src: "/brand/icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
