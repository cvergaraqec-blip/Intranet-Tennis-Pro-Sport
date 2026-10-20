import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deja subir archivos de inventario más grandes que el límite de 1 MB.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
