/**
 * @file detail-map.tsx
 * @description 상세페이지 지도 컴포넌트
 *
 * 관광지 상세페이지에서 해당 관광지의 위치를 지도에 표시하는 컴포넌트입니다.
 * PRD 2.4.4와 design.md의 지도 섹션 요구사항을 기반으로 구현되었습니다.
 *
 * 주요 기능:
 * - 단일 관광지 위치 표시 (마커 1개)
 * - 길찾기 버튼 (네이버 지도 앱/웹 연동)
 * - 좌표 복사 기능
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Navigation, Copy, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import type { TourDetail } from "@/lib/types/tour";
import {
  convertKatecToWgs84,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getMarkerColor,
  generateNaverMapRouteUrl,
  formatCoordinates,
} from "@/lib/utils/map-utils";
import { cn } from "@/lib/utils";

interface DetailMapProps {
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
 * 네이버 지도 API 타입 정의 (naver-map.tsx와 동일하게 간소화)
 * 두 파일에서 동일한 global 타입을 선언하므로, 타입 충돌을 방지하기 위해 간소화함
 */

/**
 * 상세페이지 지도 컴포넌트
 */
export function DetailMap({ detail, className }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /**
   * 클라이언트 마운트 확인 (hydration 에러 방지)
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 네이버 지도 API 키 가져오기
   */
  const apiKey =
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ||
    process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID;

  /**
   * 좌표 변환
   */
  const lng = convertKatecToWgs84(detail.mapx);
  const lat = convertKatecToWgs84(detail.mapy);
  const hasValidCoordinates = lng !== 0 && lat !== 0;

  /**
   * 네이버 지도 API 스크립트 로드 완료 핸들러
   */
  const handleScriptLoad = () => {
    console.group("🗺️ 상세페이지 지도 API 스크립트 로드");
    console.log("✅ 스크립트 로드 완료");
    console.log("관광지:", detail.title);
    console.log("좌표:", { lat, lng });

    // 네이버 지도 API 초기화 확인 (재시도 로직 포함)
    // maps 객체만 확인 (event는 나중에 확인)
    let retryCount = 0;
    const maxRetries = 15;
    const checkInterval = 100;

    const checkNaverMaps = setInterval(() => {
      retryCount++;

      if (window.naver?.maps) {
        console.log("✅ 네이버 지도 API 초기화 완료");
        console.log("재시도 횟수:", retryCount);
        console.log("event 객체 존재:", !!window.naver.maps.event);
        setIsLoaded(true);
        clearInterval(checkNaverMaps);
        console.groupEnd();
      } else if (retryCount >= maxRetries) {
        console.error("❌ 네이버 지도 API 객체를 찾을 수 없음");
        console.log("window.naver:", window.naver);
        setError(
          "네이버 지도 API가 로드되었지만 초기화에 실패했습니다. 페이지를 새로고침해주세요.",
        );
        clearInterval(checkNaverMaps);
        console.groupEnd();
      } else {
        console.log(
          `⏳ 네이버 지도 API 초기화 대기 중... (${retryCount}/${maxRetries})`,
        );
      }
    }, checkInterval);
  };

  /**
   * 네이버 지도 API 스크립트 로드 에러 핸들러
   */
  const handleScriptError = () => {
    const errorMessage = `네이버 지도 API를 불러오는데 실패했습니다. (API 키 또는 서비스 활성화 확인 필요)`;
    setError(errorMessage);
    console.error("[DetailMap] 네이버 지도 API 스크립트 로드 실패");
  };

  /**
   * 이미 로드된 API 확인 (클라이언트에서만 실행)
   */
  useEffect(() => {
    if (!mounted) return;
    
    // maps 객체만 확인 (event는 선택적)
    if (window.naver?.maps) {
      console.log("✅ 이미 로드된 네이버 지도 API 발견");
      console.log("event 객체 존재:", !!window.naver.maps.event);
      setIsLoaded(true);
    }
  }, [mounted]);

  /**
   * 지도 초기화 및 마커 표시
   */
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.naver?.maps) {
      return;
    }

    if (!hasValidCoordinates) {
      console.warn("⚠️ 유효한 좌표가 없어 지도를 표시할 수 없습니다.");
      setError("관광지 위치 정보가 없습니다.");
      return;
    }

    console.group("🗺️ 상세페이지 지도 초기화");
    console.log("관광지:", detail.title);
    console.log("좌표:", { lat, lng });

    let eventCheckInterval: NodeJS.Timeout | null = null;

    try {
      // 지도 초기화
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(lat, lng),
          zoom: 15, // 상세페이지는 더 가까운 줌 레벨
        });
        console.log("✅ 지도 초기화 완료");
      } else {
        // 기존 지도가 있으면 중심만 업데이트
        mapInstanceRef.current.setCenter(
          new window.naver.maps.LatLng(lat, lng),
        );
        mapInstanceRef.current.setZoom(15);
      }

      // 기존 마커 및 인포윈도우 제거
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // 마커 색상
      const markerColor = getMarkerColor(detail.contenttypeid);

      // 마커 아이콘 HTML
      const markerIcon = `
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${markerColor};
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        "></div>
      `;

      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: mapInstanceRef.current,
        icon: {
          content: markerIcon,
          anchor: { x: 16, y: 16 },
        },
      });

      markerRef.current = marker;

      // 인포윈도우 생성
      const fullAddress = detail.addr2
        ? `${detail.addr1} ${detail.addr2}`
        : detail.addr1;

      const infoWindowContent = `
        <div style="
          padding: 12px;
          min-width: 200px;
          max-width: 300px;
        ">
          <h3 style="
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1f2937;
          ">${detail.title}</h3>
          <p style="
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 0;
          ">📍 ${fullAddress}</p>
        </div>
      `;

      const infoWindow = new window.naver.maps.InfoWindow({
        content: infoWindowContent,
        maxWidth: 300,
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      });

      infoWindowRef.current = infoWindow;

      // 마커 클릭 시 인포윈도우 표시
      // event 객체가 존재하는지 확인 후 이벤트 리스너 추가
      // event 객체가 없어도 지도는 표시되지만, 클릭 이벤트는 작동하지 않음
      if (window.naver?.maps?.event) {
        window.naver.maps.event.addListener(marker, "click", () => {
          console.group("📍 마커 클릭");
          console.log("관광지:", detail.title);
          console.log("좌표:", { lat, lng });
          console.groupEnd();

          infoWindow.open(mapInstanceRef.current, marker);
        });
        console.log("✅ 마커 클릭 이벤트 리스너 추가 완료");
      } else {
        console.warn("⚠️ 네이버 지도 event 객체를 찾을 수 없습니다. 마커 클릭 이벤트가 작동하지 않을 수 있습니다.");
        // event 객체가 없어도 지도는 계속 표시
        // 나중에 event 객체가 로드되면 이벤트 리스너를 추가할 수 있도록 재시도
        let eventRetryCount = 0;
        const eventMaxRetries = 10;
        const eventCheckIntervalMs = 200;
        
        eventCheckInterval = setInterval(() => {
          eventRetryCount++;
          
          if (window.naver?.maps?.event && marker) {
            console.log("✅ event 객체 로드 확인, 이벤트 리스너 추가");
            window.naver.maps.event.addListener(marker, "click", () => {
              if (infoWindowRef.current && mapInstanceRef.current) {
                infoWindowRef.current.open(mapInstanceRef.current, marker);
              }
            });
            if (eventCheckInterval) {
              clearInterval(eventCheckInterval);
              eventCheckInterval = null;
            }
          } else if (eventRetryCount >= eventMaxRetries) {
            console.warn("⚠️ event 객체를 찾을 수 없어 마커 클릭 이벤트를 추가하지 못했습니다.");
            if (eventCheckInterval) {
              clearInterval(eventCheckInterval);
              eventCheckInterval = null;
            }
          }
        }, eventCheckIntervalMs);
      }

      // 초기 로드 시 인포윈도우 자동 표시
      infoWindow.open(mapInstanceRef.current, marker);

      console.log("✅ 마커 및 인포윈도우 표시 완료");
      console.groupEnd();
    } catch (err) {
      console.error("❌ 지도 초기화 실패:", err);
      setError("지도를 불러오는데 실패했습니다.");
    }

    // cleanup 함수: interval 정리
    return () => {
      if (eventCheckInterval) {
        clearInterval(eventCheckInterval);
      }
    };
  }, [isLoaded, detail, lat, lng, hasValidCoordinates]);

  /**
   * 길찾기 버튼 클릭 핸들러
   */
  const handleNavigation = () => {
    if (!hasValidCoordinates) {
      console.warn("⚠️ 유효한 좌표가 없어 길찾기를 할 수 없습니다.");
      return;
    }

    console.group("🚗 길찾기");
    console.log("목적지:", detail.title);
    console.log("좌표:", { lat, lng });

    const routeUrls = generateNaverMapRouteUrl(lat, lng, detail.title);

    // 모바일 환경 확인
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // 모바일: 앱이 설치되어 있으면 앱 열기, 없으면 웹 열기
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = routeUrls.mobile;
      document.body.appendChild(iframe);

      // 앱이 열리지 않으면 웹으로 폴백
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(routeUrls.web, "_blank");
      }, 500);
    } else {
      // 데스크톱: 웹으로 열기
      window.open(routeUrls.web, "_blank");
    }

    console.log("길찾기 URL (모바일):", routeUrls.mobile);
    console.log("길찾기 URL (웹):", routeUrls.web);
    console.groupEnd();
  };

  /**
   * 좌표 복사 핸들러
   */
  const handleCopyCoordinates = async () => {
    if (!hasValidCoordinates) {
      console.warn("⚠️ 유효한 좌표가 없어 복사할 수 없습니다.");
      return;
    }

    const coordinates = formatCoordinates(lat, lng);

    try {
      await navigator.clipboard.writeText(coordinates);
      setCopySuccess(true);
      setToastOpen(true);
      console.group("📍 좌표 복사");
      console.log("복사된 좌표:", coordinates);
      console.groupEnd();

      // 2초 후 복사 성공 메시지 제거
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("❌ 좌표 복사 실패:", error);
      setToastOpen(true);
    }
  };

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          "min-h-[400px] lg:min-h-[500px]",
          className,
        )}
      >
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">
            네이버 지도 API 키가 설정되지 않았습니다.
          </p>
        </div>
      </div>
    );
  }

  if (!hasValidCoordinates) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          "min-h-[400px] lg:min-h-[500px]",
          className,
        )}
      >
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            위치 정보가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Next.js Script 컴포넌트로 네이버 지도 API 로드 - 항상 렌더링 (hydration 에러 방지) */}
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${apiKey}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        id="naver-maps-script"
      />

      {/* 서버와 클라이언트에서 동일한 구조 렌더링 (hydration 에러 방지) */}
      {error ? (
        <div
          className={cn(
            "flex items-center justify-center bg-muted rounded-lg",
            "min-h-[400px] lg:min-h-[500px]",
            className,
          )}
        >
          <div className="text-center p-8">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">
              브라우저 콘솔에서 자세한 에러 정보를 확인하세요.
            </p>
          </div>
        </div>
      ) : !isLoaded || !mounted ? (
        <div
          className={cn(
            "flex items-center justify-center bg-muted rounded-lg",
            "min-h-[400px] lg:min-h-[500px]",
            className,
          )}
        >
          <div className="text-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">
              지도를 불러오는 중...
            </p>
          </div>
        </div>
      ) : (
        <div className={cn("space-y-4", className)}>
          {/* 지도 */}
          <div
            ref={mapRef}
            className={cn(
              "w-full rounded-lg overflow-hidden border",
              "min-h-[400px] lg:min-h-[500px]",
            )}
          />

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleNavigation}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              <span>길찾기</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCoordinates}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              <span>{copySuccess ? "복사됨!" : "좌표 복사"}</span>
            </Button>
            {copySuccess && (
              <p className="text-xs text-muted-foreground self-center">
                {formatCoordinates(lat, lng)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toast 메시지 */}
      <Toast
        message="좌표가 클립보드에 복사되었습니다!"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={2000}
      />
    </>
  );
}

