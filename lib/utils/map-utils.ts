/**
 * @file map-utils.ts
 * @description 지도 관련 유틸리티 함수
 *
 * 네이버 지도 연동을 위한 좌표 변환 및 계산 함수들을 제공합니다.
 * PRD 2.2 기술 요구사항을 기반으로 구현되었습니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import type { TourItem } from "@/lib/types/tour";

/**
 * KATEC 좌표계를 WGS84 좌표계로 변환
 *
 * 한국관광공사 API는 두 가지 좌표 형식을 사용합니다:
 * 1. KATEC 좌표: 정수형 (예: 1269812345) - 10000000으로 나누어 변환
 * 2. WGS84 좌표: 이미 변환된 형식 (예: 126.9812345) - 변환 불필요
 *
 * 좌표값이 1000 이상이면 KATEC로 간주하고 변환합니다.
 *
 * @param katecCoord - 좌표값 (문자열)
 * @returns WGS84 좌표계 값 (숫자)
 *
 * @example
 * ```typescript
 * const lng1 = convertKatecToWgs84("1269812345"); // 126.9812345 (KATEC)
 * const lng2 = convertKatecToWgs84("126.9812345"); // 126.9812345 (이미 WGS84)
 * ```
 */
export function convertKatecToWgs84(katecCoord: string): number {
  const num = parseFloat(katecCoord);
  if (isNaN(num)) {
    console.warn(`[map-utils] Invalid coordinate: ${katecCoord}`);
    return 0;
  }
  
  // 좌표값이 1000 이상이면 KATEC 좌표 (정수형)로 간주하고 변환
  // WGS84 좌표는 위도: -90~90, 경도: -180~180 범위
  if (num >= 1000 || num <= -1000) {
    return num / 10000000;
  }
  
  // 이미 WGS84 형식이면 그대로 반환
  return num;
}

/**
 * 관광지 목록의 중심 좌표 계산
 *
 * 모든 관광지의 평균 좌표를 계산하여 지도의 초기 중심점을 결정합니다.
 * 좌표가 없는 관광지는 제외합니다.
 *
 * @param tours - 관광지 목록
 * @returns 중심 좌표 { lng: 경도, lat: 위도 } 또는 null (좌표가 없을 때)
 *
 * @example
 * ```typescript
 * const center = calculateCenter(tours);
 * if (center) {
 *   // 지도 중심 설정
 * }
 * ```
 */
export function calculateCenter(
  tours: TourItem[],
): { lng: number; lat: number } | null {
  const validTours = tours.filter(
    (tour) => tour.mapx && tour.mapy && tour.mapx !== "0" && tour.mapy !== "0",
  );

  if (validTours.length === 0) {
    return null;
  }

  let sumLng = 0;
  let sumLat = 0;

  for (const tour of validTours) {
    const lng = convertKatecToWgs84(tour.mapx);
    const lat = convertKatecToWgs84(tour.mapy);
    sumLng += lng;
    sumLat += lat;
  }

  return {
    lng: sumLng / validTours.length,
    lat: sumLat / validTours.length,
  };
}

/**
 * 기본 중심 좌표 (서울 시청)
 *
 * 관광지가 없거나 좌표가 없을 때 사용하는 기본 중심점입니다.
 */
export const DEFAULT_CENTER = {
  lng: 126.9780, // 서울 시청 경도
  lat: 37.5665, // 서울 시청 위도
} as const;

/**
 * 기본 줌 레벨
 */
export const DEFAULT_ZOOM = 12;

/**
 * 관광지 타입별 마커 색상 (선택 사항)
 *
 * PRD 2.2에 따르면 마커 색상을 관광 타입별로 구분할 수 있습니다.
 */
export function getMarkerColor(contentTypeId: string): string {
  const colorMap: Record<string, string> = {
    "12": "#3B82F6", // 관광지 - 파란색
    "14": "#8B5CF6", // 문화시설 - 보라색
    "15": "#EC4899", // 축제/행사 - 핑크색
    "25": "#10B981", // 여행코스 - 초록색
    "28": "#F59E0B", // 레포츠 - 주황색
    "32": "#6366F1", // 숙박 - 인디고색
    "38": "#EAB308", // 쇼핑 - 노란색
    "39": "#EF4444", // 음식점 - 빨간색
  };

  return colorMap[contentTypeId] || "#6B7280"; // 기본 - 회색
}

/**
 * 네이버 지도 길찾기 URL 생성
 *
 * PRD 2.4.4에 따라 네이버 지도 앱/웹으로 길찾기 기능을 제공합니다.
 *
 * @param lat - 위도 (WGS84 좌표계)
 * @param lng - 경도 (WGS84 좌표계)
 * @param title - 목적지 이름 (선택 사항)
 * @returns 네이버 지도 길찾기 URL
 *
 * @example
 * ```typescript
 * const url = generateNaverMapRouteUrl(37.5665, 126.9780, "서울시청");
 * // 모바일: nmap://route/car?dlat=37.5665&dlng=126.9780&dname=서울시청
 * // 웹: https://map.naver.com/v5/directions/-/-/-/서울시청?c=126.9780,37.5665,0,0,dh
 * ```
 */
export function generateNaverMapRouteUrl(
  lat: number,
  lng: number,
  title?: string,
): { mobile: string; web: string } {
  const encodedTitle = title ? encodeURIComponent(title) : "";

  // 모바일 앱 URL (네이버 지도 앱이 설치되어 있으면 앱 열기)
  const mobileUrl = `nmap://route/car?dlat=${lat}&dlng=${lng}${
    encodedTitle ? `&dname=${encodedTitle}` : ""
  }`;

  // 웹 URL (네이버 지도 웹)
  const webUrl = `https://map.naver.com/v5/directions/-/-/-/${
    encodedTitle || "목적지"
  }?c=${lng},${lat},0,0,dh`;

  return { mobile: mobileUrl, web: webUrl };
}

/**
 * 좌표 포맷팅
 *
 * WGS84 좌표를 읽기 쉬운 형식으로 포맷팅합니다.
 *
 * @param lat - 위도
 * @param lng - 경도
 * @param precision - 소수점 자릿수 (기본값: 6)
 * @returns 포맷팅된 좌표 문자열
 *
 * @example
 * ```typescript
 * const formatted = formatCoordinates(37.5665, 126.9780);
 * // "37.566500, 126.978000"
 * ```
 */
export function formatCoordinates(
  lat: number,
  lng: number,
  precision: number = 6,
): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

