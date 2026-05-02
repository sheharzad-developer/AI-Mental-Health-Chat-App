import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Wellness Companion",
    short_name: "Wellness",
    description:
      "A calm, supportive space for everyday emotional well-being—not a substitute for professional care.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#e5f0eb",
    theme_color: "#0f766e",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
