/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * 네이버 지도 API v3 (NCP)를 사용하여 관광지 위치를 지도에 표시하는 컴포넌트입니다.
 * PRD 2.2와 design.md의 지도 연동 요구사항을 기반으로 구현되었습니다.
 *
 * 주요 기능:
 * - 관광지 마커 표시
 * - 마커 클릭 시 인포윈도우
 * - 리스트-지도 연동 (선택된 관광지 강조)
 * - 지도 컨트롤 (줌, 지도 타입)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { TourItem } from "@/lib/types/tour";
import {
  convertKatecToWgs84,
  calculateCenter,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getMarkerColor,
} from "@/lib/utils/map-utils";
import { cn } from "@/lib/utils";

interface NaverMapProps {
  /**
   * 표시할 관광지 목록
   */
  tours: TourItem[];
  /**
   * 선택된 관광지 ID (리스트에서 클릭한 항목)
   */
  selectedTourId?: string;
  /**
   * 마커 클릭 시 호출되는 콜백
   */
  onMarkerClick?: (tour: TourItem) => void;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 네이버 지도 API 타입 정의
 */
declare global {
  interface Window {
    naver?: {
      maps: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Map: new (element: HTMLElement, options: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LatLng: new (lat: number, lng: number) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Marker: new (options: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        InfoWindow: new (options: any) => any;
        event?: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addListener: (
            target: any,
            event: string,
            handler: () => void,
          ) => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          removeListener: (
            target: any,
            event: string,
            handler: () => void,
          ) => void;
        };
      };
    };
  }
}

/**
 * 네이버 지도 컴포넌트
 */
export function NaverMap({
  tours,
  selectedTourId,
  onMarkerClick,
  className,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
   * 네이버 지도 API 스크립트 로드 완료 핸들러
   */
  const handleScriptLoad = () => {
    console.group("🗺️ 네이버 지도 API 스크립트 로드");
    console.log("✅ 스크립트 로드 완료");
    console.log("API 키 존재:", !!apiKey);

    // 네이버 지도 API 초기화 확인 (재시도 로직 포함)
    let retryCount = 0;
    const maxRetries = 10;
    const checkInterval = 100;

    const checkNaverMaps = setInterval(() => {
      retryCount++;

      if (window.naver?.maps) {
        console.log("✅ 네이버 지도 API 초기화 완료");
        console.log("재시도 횟수:", retryCount);
        setIsLoaded(true);
        clearInterval(checkNaverMaps);
        console.groupEnd();
      } else if (retryCount >= maxRetries) {
        console.error("❌ 네이버 지도 API 객체를 찾을 수 없음");
        console.log("window.naver:", window.naver);
        console.log(
          "window 객체:",
          typeof window !== "undefined" ? "존재" : "없음",
        );
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
    const errorMessage = `네이버 지도 API를 불러오는데 실패했습니다. (406 에러: API 키 또는 서비스 활성화 확인 필요)`;
    setError(errorMessage);
    console.error("[NaverMap] 네이버 지도 API 스크립트 로드 실패");
    console.error("[NaverMap] API 키 확인:", apiKey ? "설정됨" : "설정 안됨");
    if (apiKey) {
      console.error(
        "[NaverMap] 스크립트 URL:",
        `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${apiKey.substring(
          0,
          10,
        )}...`,
      );
      console.error("[NaverMap] 가능한 원인:");
      console.error(
        "  1. 네이버 클라우드 플랫폼에서 Web Dynamic Map 서비스가 활성화되지 않음",
      );
      console.error("  2. API 키가 잘못되었거나 만료됨");
      console.error("  3. 도메인 등록이 되지 않음");
    }
  };

  /**
   * 이미 로드된 API 확인 및 주기적 확인
   */
  useEffect(() => {
    console.group("🗺️ 네이버 지도 API 상태 확인");
    console.log("window.naver 존재:", !!window.naver);
    console.log("window.naver.maps 존재:", !!window.naver?.maps);

    if (window.naver?.maps) {
      console.log("✅ 이미 로드된 네이버 지도 API 발견");
      setIsLoaded(true);
      console.groupEnd();
      return;
    }

    console.log("⏳ 네이버 지도 API 로드 대기 중...");
    console.groupEnd();

    // 주기적으로 API 로드 상태 확인 (최대 5초)
    let checkCount = 0;
    const maxChecks = 50; // 5초 (100ms * 50)

    const interval = setInterval(() => {
      checkCount++;

      if (window.naver?.maps) {
        console.log("✅ 네이버 지도 API 로드 확인됨 (주기적 확인)");
        setIsLoaded(true);
        clearInterval(interval);
      } else if (checkCount >= maxChecks) {
        console.warn("⚠️ 네이버 지도 API 로드 타임아웃");
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  /**
   * 지도 초기화 및 마커 표시
   */
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.naver?.maps) {
      return;
    }

    console.group("🗺️ 네이버 지도 초기화");
    console.log("관광지 개수:", tours.length);

    try {
      // 중심 좌표 계산
      const center = calculateCenter(tours) || DEFAULT_CENTER;
      console.log("지도 중심 좌표:", center);

      // 기존 마커 및 인포윈도우 제거
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      infoWindowsRef.current.forEach((infoWindow) => {
        infoWindow.close();
      });
      markersRef.current = [];
      infoWindowsRef.current = [];

      // 지도 초기화
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom: tours.length > 0 ? DEFAULT_ZOOM : 10,
        });
        console.log("✅ 지도 초기화 완료");
      } else {
        // 기존 지도가 있으면 중심만 업데이트
        mapInstanceRef.current.setCenter(
          new window.naver.maps.LatLng(center.lat, center.lng),
        );
        if (tours.length > 0) {
          mapInstanceRef.current.setZoom(DEFAULT_ZOOM);
        }
      }

      // 관광지가 없으면 종료
      if (tours.length === 0) {
        console.log("관광지가 없어 마커를 표시하지 않습니다.");
        console.groupEnd();
        return;
      }

      // 마커 생성
      tours.forEach((tour) => {
        const lng = convertKatecToWgs84(tour.mapx);
        const lat = convertKatecToWgs84(tour.mapy);

        // 좌표가 유효하지 않으면 스킵
        if (lng === 0 || lat === 0) {
          console.warn(`[NaverMap] 좌표가 유효하지 않음: ${tour.title}`);
          return;
        }

        // 마커 색상
        const markerColor = getMarkerColor(tour.contenttypeid);

        // 마커 아이콘 HTML (간단한 원형 마커)
        const markerIcon = `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `;

        // 선택된 관광지는 더 큰 마커로 표시
        const isSelected = selectedTourId === tour.contentid;
        const markerSize = isSelected ? 32 : 24;
        const markerIconSelected = `
          <div style="
            width: ${markerSize}px;
            height: ${markerSize}px;
            background-color: ${markerColor};
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            cursor: pointer;
            animation: pulse 2s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `;

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: mapInstanceRef.current,
          icon: {
            content: isSelected ? markerIconSelected : markerIcon,
            anchor: { x: markerSize / 2, y: markerSize / 2 },
          },
        });

        // 인포윈도우 생성
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
            ">${tour.title}</h3>
            <p style="
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            ">📍 ${tour.addr1}</p>
            <a href="/places/${tour.contentid}" style="
              display: inline-block;
              padding: 6px 12px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              margin-top: 8px;
            ">상세보기</a>
          </div>
        `;

        const infoWindow = new window.naver.maps.InfoWindow({
          content: infoWindowContent,
          maxWidth: 300,
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          anchorSize: { width: 10, height: 10 },
          anchorColor: "#ffffff",
        });

        // 마커 클릭 이벤트
        window.naver.maps.event.addListener(marker, "click", () => {
          console.group("📍 마커 클릭");
          console.log("관광지:", tour.title);
          console.log("좌표:", { lat, lng });
          console.groupEnd();

          // 기존 인포윈도우 닫기
          infoWindowsRef.current.forEach((iw) => iw.close());

          // 인포윈도우 열기
          infoWindow.open(mapInstanceRef.current, marker);
          infoWindowsRef.current.push(infoWindow);

          // 콜백 호출
          if (onMarkerClick) {
            onMarkerClick(tour);
          }
        });

        markersRef.current.push(marker);
      });

      // 선택된 관광지로 지도 이동
      if (selectedTourId) {
        const selectedTour = tours.find((t) => t.contentid === selectedTourId);
        if (selectedTour) {
          const lng = convertKatecToWgs84(selectedTour.mapx);
          const lat = convertKatecToWgs84(selectedTour.mapy);
          if (lng !== 0 && lat !== 0) {
            mapInstanceRef.current.setCenter(
              new window.naver.maps.LatLng(lat, lng),
            );
            mapInstanceRef.current.setZoom(15); // 선택된 항목은 더 가까이
          }
        }
      }

      console.log(`✅ ${markersRef.current.length}개 마커 표시 완료`);
      console.groupEnd();
    } catch (err) {
      console.error("❌ 지도 초기화 실패:", err);
      setError("지도를 불러오는데 실패했습니다.");
    }
  }, [isLoaded, tours, selectedTourId, onMarkerClick]);

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          "min-h-[400px] lg:min-h-[600px]",
          className,
        )}
      >
        <div className="text-center p-8">
          <p className="text-sm text-muted-foreground">
            네이버 지도 API 키가 설정되지 않았습니다.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 또는
            NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID 환경변수를 설정해주세요.
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
        // Error state
        <div
          className={cn(
            "flex items-center justify-center bg-muted rounded-lg",
            "min-h-[400px] lg:min-h-[600px]",
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
        // Loading state
        <div
          className={cn(
            "flex items-center justify-center bg-muted rounded-lg",
            "min-h-[400px] lg:min-h-[600px]",
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
        // Map display state
        <div
          ref={mapRef}
          className={cn(
            "w-full h-full rounded-lg overflow-hidden",
            "min-h-[400px] lg:min-h-[600px]",
            className,
          )}
        />
      )}
    </>
  );
}
