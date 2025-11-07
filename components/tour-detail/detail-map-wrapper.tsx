/**
 * @file detail-map-wrapper.tsx
 * @description DetailMap을 동적으로 로드하는 클라이언트 컴포넌트 래퍼
 * 
 * Server Component에서 next/dynamic with ssr: false를 사용할 수 없으므로
 * 이 클라이언트 컴포넌트에서 동적 로드를 처리합니다.
 */

"use client";

import dynamic from "next/dynamic";
import type { TourDetail } from "@/lib/types/tour";

const DetailMap = dynamic(
  () =>
    import("@/components/tour-detail/detail-map").then((mod) => ({
      default: mod.DetailMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-muted rounded-lg min-h-[400px] lg:min-h-[500px]">
        <div className="text-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            지도를 불러오는 중...
          </p>
        </div>
      </div>
    ),
  }
);

interface DetailMapWrapperProps {
  detail: TourDetail;
  className?: string;
}

export function DetailMapWrapper({ detail, className }: DetailMapWrapperProps) {
  return <DetailMap detail={detail} className={className} />;
}

