/**
 * @file components/tour-detail/detail-info.tsx
 * @description 관광지 기본 정보 컴포넌트
 *
 * 관광지 상세페이지에서 기본 정보를 표시하는 컴포넌트입니다.
 * PRD 2.4.1 기본 정보 섹션 요구사항을 구현합니다.
 *
 * 주요 기능:
 * 1. 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
 * 2. 주소 복사 기능 (클립보드 API)
 * 3. 전화번호 클릭 시 전화 연결
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 * - @/lib/types/tour: TourDetail 타입
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Phone, ExternalLink, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailInfoProps {
  /**
   * 관광지 상세 정보
   */
  detail: TourDetail;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_IMAGE = "/images/default/placeholder.svg";

/**
 * 이미지 URL 유효성 검사
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  if (url.startsWith("/")) {
    return url !== DEFAULT_IMAGE;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
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
 * 주소 복사 기능
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("클립보드 복사 실패:", error);
    return false;
  }
}

/**
 * 관광지 기본 정보 컴포넌트
 */
export function DetailInfo({ detail, className }: DetailInfoProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // 이미지 URL 우선순위: firstimage -> firstimage2 -> 기본 이미지
  const imageUrl = isValidImageUrl(detail.firstimage)
    ? detail.firstimage!
    : isValidImageUrl(detail.firstimage2)
    ? detail.firstimage2!
    : DEFAULT_IMAGE;

  const isDefaultImage = imageUrl === DEFAULT_IMAGE;

  // 주소 (addr1 + addr2)
  const fullAddress = detail.addr2
    ? `${detail.addr1} ${detail.addr2}`
    : detail.addr1;

  // 관광 타입명
  const contentTypeName = getContentTypeName(detail.contenttypeid);

  /**
   * 주소 복사 핸들러
   */
  const handleCopyAddress = async () => {
    console.group("📋 주소 복사");
    console.log("복사할 주소:", fullAddress);

    const success = await copyToClipboard(fullAddress);

    if (success) {
      setCopySuccess(true);
      console.log("✅ 주소 복사 성공");
      // 2초 후 성공 메시지 숨김
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      console.error("❌ 주소 복사 실패");
    }
    console.groupEnd();
  };

  /**
   * 전화번호 클릭 핸들러
   */
  const handlePhoneClick = () => {
    if (!detail.tel) return;

    console.group("📞 전화 연결");
    console.log("전화번호:", detail.tel);
    console.log("전화 연결 실행");
    console.groupEnd();

    // tel: 프로토콜로 전화 연결
    window.location.href = `tel:${detail.tel.replace(/[^0-9]/g, "")}`;
  };

  /**
   * HTML 태그에서 URL 추출
   * <a href="...">...</a> 형식에서 href 속성 또는 텍스트 내용 추출
   */
  const extractUrlFromHtml = (html: string): string | null => {
    // href 속성 추출: <a href="URL">...</a>
    const hrefMatch = html.match(/href=["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1].trim();
    }
    
    // <a> 태그 내부 텍스트에서 URL 추출
    const textMatch = html.match(/<a[^>]*>([^<]+)<\/a>/i);
    if (textMatch && textMatch[1]) {
      const url = textMatch[1].trim();
      // URL 패턴 확인 (http:// 또는 https://로 시작)
      if (url.match(/^https?:\/\//i)) {
        return url;
      }
    }
    
    return null;
  };

  /**
   * 홈페이지 URL 정규화 및 검증
   * http:// 또는 https://가 없으면 추가
   * HTML 태그가 포함된 경우 URL 추출
   * 유효하지 않은 URL은 null 반환
   */
  const normalizeHomepageUrl = (url: string | undefined): string | null => {
    console.group("🔧 normalizeHomepageUrl 호출");
    console.log("입력 URL:", url);
    console.log("URL 타입:", typeof url);
    
    if (!url || url.trim() === "") {
      console.log("❌ 홈페이지 URL 없음 또는 빈 문자열");
      console.groupEnd();
      return null;
    }

    let trimmedUrl = url.trim();
    console.log("trimmed URL:", trimmedUrl);
    
    // HTML 태그가 포함된 경우 URL 추출
    if (trimmedUrl.includes("<") && trimmedUrl.includes(">")) {
      console.log("🔍 HTML 태그 감지, URL 추출 시도...");
      const extractedUrl = extractUrlFromHtml(trimmedUrl);
      if (extractedUrl) {
        console.log("✅ HTML에서 URL 추출 성공:", extractedUrl);
        trimmedUrl = extractedUrl;
      } else {
        console.log("⚠️ HTML에서 URL 추출 실패, 원본 사용");
      }
    }
    
    // 특수 케이스 처리: "없음", "N/A", "-" 등
    const invalidValues = ["없음", "N/A", "n/a", "-", "null", "undefined", ""];
    if (invalidValues.includes(trimmedUrl.toLowerCase())) {
      console.log("❌ 홈페이지 URL이 유효하지 않은 값:", trimmedUrl);
      console.groupEnd();
      return null;
    }

    // 이미 완전한 URL인 경우
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      try {
        const urlObj = new URL(trimmedUrl);
        console.log("✅ 완전한 URL 확인:", trimmedUrl);
        console.log("URL 객체:", urlObj);
        console.groupEnd();
        return trimmedUrl;
      } catch (error) {
        console.error("❌ 홈페이지 URL 파싱 실패:", trimmedUrl, error);
        console.groupEnd();
        return null;
      }
    }

    // 프로토콜이 없는 경우 https:// 추가
    try {
      const fullUrl = `https://${trimmedUrl}`;
      const urlObj = new URL(fullUrl); // URL 유효성 검증
      console.log("✅ 프로토콜 추가하여 URL 생성:", fullUrl);
      console.log("URL 객체:", urlObj);
      console.groupEnd();
      return fullUrl;
    } catch (error) {
      console.error("❌ 홈페이지 URL 생성 실패:", trimmedUrl, error);
      console.groupEnd();
      return null;
    }
  };

  // 디버깅: API 응답 데이터 확인
  console.group("🔍 상세 정보 데이터 확인");
  console.log("전화번호 (tel):", detail.tel);
  console.log("전화번호 타입:", typeof detail.tel);
  console.log("홈페이지 (homepage):", detail.homepage);
  console.log("홈페이지 타입:", typeof detail.homepage);
  console.log("홈페이지 길이:", detail.homepage?.length);
  console.log("전화번호 존재 여부:", !!detail.tel && detail.tel.trim() !== "");
  console.log("홈페이지 존재 여부:", !!detail.homepage && detail.homepage.trim() !== "");
  console.groupEnd();

  const homepageUrl = normalizeHomepageUrl(detail.homepage);
  
  // 홈페이지 URL 정규화 결과 디버깅
  console.group("🌐 홈페이지 URL 정규화");
  console.log("원본 homepage 값:", detail.homepage);
  console.log("정규화된 homepageUrl:", homepageUrl);
  console.log("homepageUrl 존재 여부:", !!homepageUrl);
  console.groupEnd();
  
  // 전화번호 검증 (빈 문자열이나 공백만 있는 경우 제외)
  const hasValidTel = detail.tel && detail.tel.trim() !== "";
  
  // 개발 환경에서만 API 응답 디버그 정보 표시
  const isDevelopment = process.env.NODE_ENV === 'development';
  const showDebugInfo = isDevelopment && !hasValidTel;

  return (
    <div className={cn("space-y-8 max-w-[700px] mx-auto", className)}>
      {/* 대표 이미지 */}
      <section>
        {/* 고정된 비율(16:9)로 일관된 이미지 크기 유지 */}
        {/* 픽셀 단위로 고정하여 font-size 설정과 무관하게 동일한 크기 보장 */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          {isDefaultImage ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                <svg
                  width="96"
                  height="96"
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
                <span className="text-sm font-medium">이미지 없음</span>
              </div>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={detail.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
              unoptimized={imageUrl.startsWith("http://")}
            />
          )}
        </div>
      </section>

      {/* 관광지명 및 타입 */}
      <section>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{detail.title}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">🎯 {contentTypeName}</span>
          {detail.addr1 && (
            <>
              <span className="text-sm">•</span>
              <span className="text-sm">📍 {detail.addr1}</span>
            </>
          )}
        </div>
      </section>

      {/* 기본 정보 카드 */}
      <section>
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">📋 기본 정보</h2>

          {/* 개발 환경 디버그 정보 */}
          {showDebugInfo && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🔍 디버그 정보 (개발 모드)
              </h3>
              <div className="text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                <p><strong>전화번호 (tel):</strong> {detail.tel || "없음"}</p>
                <p><strong>전화번호 타입:</strong> {typeof detail.tel}</p>
                <p>
                  <strong>해결 방법:</strong> 터미널 로그에서 "📋 detailCommon2 API 응답"과 "📋 detailIntro2 API 응답"을 확인하세요.
                </p>
              </div>
            </div>
          )}

          {/* 주소 */}
          {fullAddress && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    주소
                  </p>
                  <p className="text-base">{fullAddress}</p>
                  {detail.zipcode && (
                    <p className="text-sm text-muted-foreground mt-1">
                      우편번호: {detail.zipcode}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="gap-2 shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copySuccess ? "복사됨!" : "복사"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* 전화번호 */}
          {hasValidTel ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    전화번호
                  </p>
                  <p className="text-base">{detail.tel}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePhoneClick}
                  className="gap-2 shrink-0"
                >
                  <Phone className="h-4 w-4" />
                  <span>전화</span>
                </Button>
              </div>
            </div>
          ) : (
            !isDevelopment && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      전화번호
                    </p>
                    <p className="text-sm text-muted-foreground">
                      전화번호 정보가 제공되지 않습니다
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* 홈페이지 */}
          {homepageUrl && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    홈페이지
                  </p>
                  <a
                    href={homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-primary hover:underline break-all"
                    onClick={() => {
                      console.group("🌐 홈페이지 열기");
                      console.log("원본 URL:", detail.homepage);
                      console.log("정규화된 URL:", homepageUrl);
                      console.groupEnd();
                    }}
                  >
                    {homepageUrl}
                  </a>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2 shrink-0"
                >
                  <a
                    href={homepageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      console.group("🌐 홈페이지 열기 (버튼)");
                      console.log("원본 URL:", detail.homepage);
                      console.log("정규화된 URL:", homepageUrl);
                      console.groupEnd();
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>열기</span>
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 개요 */}
      {detail.overview && (
        <section>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-4">📝 개요</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-base leading-relaxed whitespace-pre-line">
                {detail.overview}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

