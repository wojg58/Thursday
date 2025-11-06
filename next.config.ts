import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 이미지 도메인
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
      { hostname: "www.visitkorea.or.kr" },
      { hostname: "cdn.visitkorea.or.kr" },
    ],
    // 이미지 최적화 실패 시 원본 이미지 사용
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
