import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shardstead",
    short_name: "Shardstead",
    description: "An endless 3D building frontier.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#08100f",
    theme_color: "#08100f",
    icons: [{ src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  };
}
