/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 호출 함수
 *
 * 한국관광공사 KorService2 API를 호출하는 함수들을 제공합니다.
 * 모든 함수는 서버 사이드에서만 호출되어야 합니다.
 *
 * @see {@link /docs/PRD.md} - API 명세 (4장)
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  AreaCode,
  ApiResponse,
  ContentTypeId,
} from "@/lib/types/tour";

/**
 * API Base URL
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

/**
 * API 키 가져오기 (환경변수)
 * NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 사용
 */
function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Tour API key is missing. Please set NEXT_PUBLIC_TOUR_API_KEY or TOUR_API_KEY in environment variables.",
    );
  }

  return apiKey;
}

/**
 * API 호출 헬퍼 함수
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): Promise<ApiResponse<T>> {
  const apiKey = getApiKey();

  const searchParams = new URLSearchParams({
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== "",
      ) as [string, string][],
    ),
  });

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  console.group("🔍 Tour API 호출");
  console.log("URL:", url);
  console.log("Params:", params);

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse<T> = await response.json();

    console.log("응답 결과 코드:", data.response.header.resultCode);
    console.log("응답 메시지:", data.response.header.resultMsg);

    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
    }

    console.log("✅ API 호출 성공");
    console.groupEnd();

    return data;
  } catch (error) {
    console.error("❌ API 호출 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 지역코드 조회 (areaCode2)
 * @param areaCode 상위 지역코드 (선택, 없으면 전체 조회)
 * @returns 지역코드 목록
 */
export async function getAreaCode(areaCode?: string): Promise<AreaCode[]> {
  const response = await fetchTourApi<AreaCode>("/areaCode2", {
    areaCode,
  });

  const items = response.response.body.items.item;
  const areaList = Array.isArray(items) ? items : items ? [items] : [];

  // API가 모든 시/도를 반환하지 않을 수 있으므로, 누락된 지역을 추가
  // 한국관광공사 API의 표준 지역코드 구조
  const allAreas: AreaCode[] = [
    { code: "1", name: "서울" },
    { code: "2", name: "인천" },
    { code: "3", name: "대전" },
    { code: "4", name: "대구" },
    { code: "5", name: "광주" },
    { code: "6", name: "부산" },
    { code: "7", name: "울산" },
    { code: "8", name: "세종" },
    { code: "31", name: "경기도" },
    { code: "32", name: "강원도" },
    { code: "33", name: "충청북도" },
    { code: "34", name: "충청남도" },
    { code: "35", name: "경상북도" },
    { code: "36", name: "경상남도" },
    { code: "37", name: "전라북도" },
    { code: "38", name: "전라남도" },
    { code: "39", name: "제주도" },
  ];

  // API에서 반환된 지역과 하드코딩된 지역을 병합
  // 하드코딩된 목록을 우선 사용하여 일관된 지역명 표시
  if (areaList.length > 0) {
    // API 응답과 하드코딩된 목록을 병합 (중복 제거)
    const areaMap = new Map<string, string>();

    // API 응답을 먼저 추가
    areaList.forEach((area) => {
      areaMap.set(area.code, area.name);
    });

    // 하드코딩된 목록으로 덮어쓰기 (하드코딩된 값이 우선)
    // 이렇게 하면 세종, 강원도, 제주도 같은 간단한 이름이 유지됨
    allAreas.forEach((area) => {
      areaMap.set(area.code, area.name);
    });

    // 코드 순서대로 정렬하여 반환
    return allAreas.map((area) => ({
      code: area.code,
      name: areaMap.get(area.code) || area.name,
    }));
  }

  // API 응답이 없으면 하드코딩된 목록 반환
  return allAreas;
}

/**
 * 시/군/구 코드 조회 (areaCode2 - 하위 지역)
 * @param areaCode 상위 지역코드 (필수)
 * @returns 시/군/구 코드 목록
 */
export async function getSubAreaCode(areaCode: string): Promise<AreaCode[]> {
  const response = await fetchTourApi<AreaCode>("/areaCode2", {
    areaCode,
  });

  const items = response.response.body.items.item;
  const areaList = Array.isArray(items) ? items : items ? [items] : [];

  return areaList;
}

/**
 * 지역 기반 관광정보 조회 (areaBasedList2)
 * @param areaCode 지역코드
 * @param contentTypeId 관광 타입 ID
 * @param pageNo 페이지 번호 (기본값: 1)
 * @param numOfRows 페이지당 항목 수 (기본값: 10)
 * @returns 관광지 목록
 */
export async function getAreaBasedList(
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  pageNo: number = 1,
  numOfRows: number = 10,
): Promise<{ items: TourItem[]; totalCount: number }> {
  const response = await fetchTourApi<TourItem>("/areaBasedList2", {
    areaCode,
    contentTypeId,
    pageNo,
    numOfRows,
  });

  const items = response.response.body.items.item;
  const itemArray = Array.isArray(items) ? items : items ? [items] : [];

  return {
    items: itemArray,
    totalCount: response.response.body.totalCount,
  };
}

/**
 * 키워드 검색 (searchKeyword2)
 * @param keyword 검색 키워드
 * @param areaCode 지역코드 (선택)
 * @param contentTypeId 관광 타입 ID (선택)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @param numOfRows 페이지당 항목 수 (기본값: 10)
 * @returns 검색 결과 목록
 */
export async function searchKeyword(
  keyword: string,
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  pageNo: number = 1,
  numOfRows: number = 10,
): Promise<{ items: TourItem[]; totalCount: number }> {
  const response = await fetchTourApi<TourItem>("/searchKeyword2", {
    keyword,
    areaCode,
    contentTypeId,
    pageNo,
    numOfRows,
  });

  const items = response.response.body.items.item;
  const itemArray = Array.isArray(items) ? items : items ? [items] : [];

  return {
    items: itemArray,
    totalCount: response.response.body.totalCount,
  };
}

/**
 * 공통 정보 조회 (detailCommon2)
 * @param contentId 콘텐츠 ID
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  contentId: string,
): Promise<TourDetail | null> {
  const response = await fetchTourApi<TourDetail>("/detailCommon2", {
    contentId,
  });

  const items = response.response.body.items.item;
  return Array.isArray(items) ? items[0] : items || null;
}

/**
 * 소개 정보 조회 (detailIntro2)
 * @param contentId 콘텐츠 ID
 * @param contentTypeId 콘텐츠 타입 ID
 * @returns 관광지 소개 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string,
): Promise<TourIntro | null> {
  const response = await fetchTourApi<TourIntro>("/detailIntro2", {
    contentId,
    contentTypeId,
  });

  const items = response.response.body.items.item;
  return Array.isArray(items) ? items[0] : items || null;
}

/**
 * 이미지 목록 조회 (detailImage2)
 * @param contentId 콘텐츠 ID
 * @returns 이미지 목록
 */
export async function getDetailImage(contentId: string): Promise<TourImage[]> {
  const response = await fetchTourApi<TourImage>("/detailImage2", {
    contentId,
  });

  const items = response.response.body.items.item;
  return Array.isArray(items) ? items : items ? [items] : [];
}
