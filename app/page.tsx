/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용하여 전국 관광지 정보를 검색하고 조회하는 메인 페이지입니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시
 * - 지역/타입 필터
 * - 키워드 검색 (향후 구현)
 * - 지도 연동 (내일 구현 예정)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { getAreaCode, getAreaBasedList } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { ErrorMessage } from "@/components/ui/error-message";
import type { TourItem } from "@/lib/types/tour";

interface HomeProps {
  searchParams: Promise<{
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    page?: string;
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
    const areaCode =
      params.areaCode && params.areaCode !== "all" ? params.areaCode : "1"; // 기본값: 서울 (필터가 없거나 'all'인 경우)
    const contentTypeIds = params.contentTypeId
      ? params.contentTypeId.split(",").filter(Boolean)
      : [];
    const sortBy = (params.sort as "latest" | "name") || "latest";

    console.log("필터 적용:", { areaCode, contentTypeIds, sortBy });

    // 관광지 목록 조회
    // contentTypeId가 여러 개인 경우 첫 번째 타입으로 조회 (API는 단일 타입만 지원)
    // 실제로는 각 타입별로 조회 후 합치는 것이 이상적이지만, MVP에서는 첫 번째 타입만 사용
    const contentTypeId =
      contentTypeIds.length > 0 ? contentTypeIds[0] : undefined;

    const result = await getAreaBasedList(
      areaCode === "all" ? undefined : areaCode,
      contentTypeId as any,
      1,
      20, // 필터링 시 더 많은 결과 표시
    );

    let tours = result.items;

    // 여러 타입이 선택된 경우, 클라이언트 사이드에서 필터링
    // (API는 단일 타입만 지원하므로)
    if (contentTypeIds.length > 1) {
      tours = tours.filter((tour) =>
        contentTypeIds.includes(tour.contenttypeid),
      );
    }

    // 정렬 적용
    if (sortBy === "name") {
      tours.sort(sortByName);
    } else {
      tours.sort(sortByLatest);
    }

    console.log(`✅ ${tours.length}개의 관광지 조회 완료`);
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

        {/* 필터 영역 */}
        <section className="mb-8">
          <TourFilters areas={areas} />
        </section>

        {/* 관광지 목록 영역 */}
        <section>
          <TourList tours={tours} />
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
