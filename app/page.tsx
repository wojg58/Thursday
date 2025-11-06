/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용하여 전국 관광지 정보를 검색하고 조회하는 메인 페이지입니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시
 * - 지역/타입 필터
 * - 키워드 검색
 * - 검색 + 필터 조합
 * - 지도 연동 (내일 구현 예정)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import {
  getAreaCode,
  getAreaBasedList,
  searchKeyword,
} from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { ErrorMessage } from "@/components/ui/error-message";
import type { TourItem } from "@/lib/types/tour";

interface HomeProps {
  searchParams: Promise<{
    areaCode?: string;
    subAreaCode?: string;
    contentTypeId?: string;
    sort?: string;
    page?: string;
    keyword?: string;
  }>;
}

/**
 * 정렬 함수: 이름순 (가나다순)
 */
function sortByName(a: TourItem, b: TourItem): number {
  return a.title.localeCompare(b.title, "ko");
}

/**
 * 정렬 함수: 최신순 (modifiedtime 기준)
 */
function sortByLatest(a: TourItem, b: TourItem): number {
  return (
    new Date(b.modifiedtime).getTime() - new Date(a.modifiedtime).getTime()
  );
}

/**
 * 홈페이지 - 관광지 목록
 *
 * URL 쿼리 파라미터를 기반으로 필터링된 관광지 목록을 표시합니다.
 * - keyword: 검색 키워드 (있으면 검색 API 사용)
 * - areaCode: 지역코드 (없으면 전체)
 * - contentTypeId: 관광 타입 ID (쉼표로 구분, 없으면 전체)
 * - sort: 정렬 옵션 (latest: 최신순, name: 이름순)
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  console.group("🏠 홈페이지 - 관광지 목록 로드");
  console.log("필터 파라미터:", params);

  try {
    // 지역 목록 조회
    const areas = await getAreaCode();
    console.log(`✅ ${areas.length}개 지역 조회 완료`);

    // 필터 값 파싱
    const keyword = params.keyword?.trim() || "";

    // 기본값: 서울 (areaCode가 없거나 "all"이면 기본값 사용)
    const DEFAULT_AREA_CODE = "1"; // 서울

    // areaCode 처리: "all"이거나 없으면 기본값(서울) 사용
    const areaCode =
      params.areaCode && params.areaCode !== "all"
        ? params.areaCode
        : DEFAULT_AREA_CODE;

    // 시/군/구 코드 (subAreaCode)
    const subAreaCode =
      params.subAreaCode && params.subAreaCode !== "all"
        ? params.subAreaCode
        : undefined;

    const contentTypeIds = params.contentTypeId
      ? params.contentTypeId.split(",").filter(Boolean)
      : [];
    const sortBy = (params.sort as "latest" | "name") || "latest";

    console.log("필터 적용:", {
      keyword,
      areaCode,
      subAreaCode,
      contentTypeIds,
      sortBy,
    });

    let tours: TourItem[] = [];
    let totalCount = 0;

    // 검색 키워드가 있으면 검색 API 사용, 없으면 지역 기반 조회
    if (keyword) {
      console.log("🔍 키워드 검색 모드");
      // 검색 API는 단일 contentTypeId만 지원하므로, 여러 타입이 선택된 경우 첫 번째 타입 사용
      const contentTypeId =
        contentTypeIds.length > 0 ? contentTypeIds[0] : undefined;

      // 시/군/구가 선택된 경우 subAreaCode 사용, 아니면 areaCode 사용
      const searchAreaCode = subAreaCode || areaCode;

      const result = await searchKeyword(
        keyword,
        searchAreaCode,
        contentTypeId as any,
        1,
        20,
      );

      tours = result.items;
      totalCount = result.totalCount;

      // 여러 타입이 선택된 경우, 클라이언트 사이드에서 필터링
      if (contentTypeIds.length > 1) {
        tours = tours.filter((tour) =>
          contentTypeIds.includes(tour.contenttypeid),
        );
      }

      console.log(`✅ 검색 결과: ${tours.length}개 (전체 ${totalCount}개)`);
    } else {
      console.log("📍 지역 기반 조회 모드");
      // contentTypeId가 여러 개인 경우 첫 번째 타입으로 조회 (API는 단일 타입만 지원)
      const contentTypeId =
        contentTypeIds.length > 0 ? contentTypeIds[0] : undefined;

      // 시/군/구가 선택된 경우 subAreaCode 사용, 아니면 areaCode 사용
      const searchAreaCode = subAreaCode || areaCode;

      const result = await getAreaBasedList(
        searchAreaCode,
        contentTypeId as any,
        1,
        20, // 필터링 시 더 많은 결과 표시
      );

      tours = result.items;
      totalCount = result.totalCount;

      // 여러 타입이 선택된 경우, 클라이언트 사이드에서 필터링
      // (API는 단일 타입만 지원하므로)
      if (contentTypeIds.length > 1) {
        tours = tours.filter((tour) =>
          contentTypeIds.includes(tour.contenttypeid),
        );
      }

      console.log(`✅ ${tours.length}개의 관광지 조회 완료`);
    }

    // 정렬 적용
    if (sortBy === "name") {
      tours.sort(sortByName);
    } else {
      tours.sort(sortByLatest);
    }

    console.groupEnd();

    return (
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">전국 관광지 정보</h1>
          <p className="text-muted-foreground">
            한국관광공사 공공 API를 활용한 관광지 검색 및 조회 서비스
          </p>
        </section>

        {/* 모바일 검색창 (데스크톱은 헤더에 있음) */}
        <section className="mb-6 md:hidden">
          <TourSearch initialKeyword={keyword} />
        </section>

        {/* 검색 결과 정보 */}
        {keyword && (
          <section className="mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">"{keyword}"</span>
              {totalCount > 0 ? (
                <> 검색 결과 {totalCount}개</>
              ) : (
                <> 검색 결과가 없습니다</>
              )}
            </p>
          </section>
        )}

        {/* 필터 영역 */}
        <section className="mb-8">
          <TourFilters areas={areas} />
        </section>

        {/* 관광지 목록 영역 */}
        <section>
          <TourList tours={tours} searchKeyword={keyword || undefined} />
        </section>
      </div>
    );
  } catch (err) {
    console.error("❌ 관광지 목록 조회 실패:", err);
    console.groupEnd();

    const errorMessage =
      err instanceof Error
        ? err.message
        : "관광지 정보를 불러오는 중 오류가 발생했습니다.";

    // 에러 발생 시에도 지역 목록은 조회 시도
    let areas: Awaited<ReturnType<typeof getAreaCode>> = [];
    try {
      areas = await getAreaCode();
    } catch {
      // 지역 목록 조회 실패 시 빈 배열 사용
    }

    return (
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">전국 관광지 정보</h1>
          <p className="text-muted-foreground">
            한국관광공사 공공 API를 활용한 관광지 검색 및 조회 서비스
          </p>
        </section>

        {/* 모바일 검색창 (데스크톱은 헤더에 있음) */}
        <section className="mb-6 md:hidden">
          <TourSearch initialKeyword={params.keyword?.trim() || ""} />
        </section>

        {/* 필터 영역 (에러 시에도 표시) */}
        {areas.length > 0 && (
          <section className="mb-8">
            <TourFilters areas={areas} />
          </section>
        )}

        {/* 에러 메시지 */}
        <section>
          <ErrorMessage type="api" message={errorMessage} fullScreen />
        </section>
      </div>
    );
  }
}
