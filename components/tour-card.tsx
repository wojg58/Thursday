/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록에서 각 관광지를 카드 형태로 표시하는 컴포넌트입니다.
 * PRD 2.1 목록 표시 정보를 기반으로 구현되었습니다.
 *
 * 표시 정보:
 * - 썸네일 이미지 (없으면 기본 이미지)
 * - 관광지명
 * - 주소
 * - 관광 타입 뱃지
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import Link from "next/link";
import Image from "next/image";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /**
   * 관광지 데이터
   */
  tour: TourItem;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 카드 클릭 시 호출되는 콜백 (지도 연동용, Link 기본 동작은 유지)
   */
  onClick?: (tour: TourItem) => void;
}

/**
 * 관광 타입 ID를 한글 이름으로 변환
 */
function getContentTypeName(contentTypeId: string): string {
  const typeMap: Record<string, string> = {
    [CONTENT_TYPE.TOURIST_SPOT]: "관광지",
    [CONTENT_TYPE.CULTURAL_FACILITY]: "문화시설",
    [CONTENT_TYPE.FESTIVAL]: "축제/행사",
    [CONTENT_TYPE.TRAVEL_COURSE]: "여행코스",
    [CONTENT_TYPE.LEISURE_SPORTS]: "레포츠",
    [CONTENT_TYPE.ACCOMMODATION]: "숙박",
    [CONTENT_TYPE.SHOPPING]: "쇼핑",
    [CONTENT_TYPE.RESTAURANT]: "음식점",
  };

  return typeMap[contentTypeId] || "기타";
}

/**
 * 관광 타입에 따른 뱃지 색상
 */
function getContentTypeColor(contentTypeId: string): string {
  const colorMap: Record<string, string> = {
    [CONTENT_TYPE.TOURIST_SPOT]:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    [CONTENT_TYPE.CULTURAL_FACILITY]:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    [CONTENT_TYPE.FESTIVAL]:
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    [CONTENT_TYPE.TRAVEL_COURSE]:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    [CONTENT_TYPE.LEISURE_SPORTS]:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    [CONTENT_TYPE.ACCOMMODATION]:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    [CONTENT_TYPE.SHOPPING]:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    [CONTENT_TYPE.RESTAURANT]:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    colorMap[contentTypeId] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  );
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 * 회색 플레이스홀더 이미지
 */
const DEFAULT_IMAGE = "/images/default/placeholder.svg";

/**
 * 이미지 URL 유효성 검사
 * 빈 문자열이나 유효하지 않은 URL인지 확인
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  // 기본 이미지 경로가 아닌 실제 URL인지 확인
  if (url.startsWith("/")) {
    return url !== DEFAULT_IMAGE;
  }
  // HTTP/HTTPS URL인지 확인
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

export function TourCard({ tour, className, onClick }: TourCardProps) {
  // 이미지 URL 우선순위: firstimage -> firstimage2 -> 기본 이미지
  const imageUrl = isValidImageUrl(tour.firstimage)
    ? tour.firstimage!
    : isValidImageUrl(tour.firstimage2)
    ? tour.firstimage2!
    : DEFAULT_IMAGE;

  const isDefaultImage = imageUrl === DEFAULT_IMAGE;

  // 디버깅: 이미지 URL이 기본 이미지인 경우 로그 출력
  if (isDefaultImage && (tour.firstimage || tour.firstimage2)) {
    console.log(`[TourCard] 이미지 없음: ${tour.title}`, {
      firstimage: tour.firstimage,
      firstimage2: tour.firstimage2,
    });
  }
  const address = tour.addr2 ? `${tour.addr1} ${tour.addr2}` : tour.addr1;
  const contentTypeName = getContentTypeName(tour.contenttypeid);
  const badgeColor = getContentTypeColor(tour.contenttypeid);

  const handleClick = () => {
    if (onClick) {
      onClick(tour);
    }
  };

  return (
    <Link
      href={`/places/${tour.contentid}`}
      onClick={handleClick}
      className={cn(
        "group block rounded-lg border bg-card overflow-hidden",
        "hover:shadow-lg transition-all duration-200",
        "hover:border-primary/50",
        className,
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        {isDefaultImage ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <div className="flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs font-medium">이미지 없음</span>
            </div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageUrl.startsWith("http://")}
          />
        )}
        {/* 관광 타입 뱃지 */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              "px-2 py-1 text-xs font-semibold rounded-full",
              badgeColor,
            )}
          >
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-4 space-y-2">
        {/* 관광지명 */}
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* 주소 */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          📍 {address}
        </p>

        {/* 전화번호 (있는 경우) */}
        {tour.tel && (
          <p className="text-xs text-muted-foreground">📞 {tour.tel}</p>
        )}
      </div>
    </Link>
  );
}
