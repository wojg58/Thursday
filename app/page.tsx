/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 API를 활용하여 전국 관광지 정보를 검색하고 조회하는 메인 페이지입니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시
 * - 지역/타입 필터 (향후 구현)
 * - 키워드 검색 (향후 구현)
 * - 지도 연동 (내일 구현 예정)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { getAreaBasedList } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { ErrorMessage } from "@/components/ui/error-message";

/**
 * 홈페이지 - 관광지 목록
 *
 * 초기 로드 시 서울 지역의 관광지 목록을 표시합니다.
 * 향후 필터 및 검색 기능이 추가되면 동적으로 변경됩니다.
 */
export default async function Home() {
  console.group("🏠 홈페이지 - 관광지 목록 로드");
  console.log("서울 지역 관광지 조회 시작...");

  try {
    // 초기 로드: 서울 지역(areaCode: 1)의 관광지 목록 조회
    // 페이지당 12개 항목 표시
    const result = await getAreaBasedList("1", undefined, 1, 12);
    const tours = result.items;

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

        {/* 필터 및 검색 영역 (향후 구현) */}
        <section className="mb-8">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground text-center">
              필터 및 검색 기능은 곧 추가될 예정입니다.
            </p>
          </div>
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

    return (
      <div className="container mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">전국 관광지 정보</h1>
          <p className="text-muted-foreground">
            한국관광공사 공공 API를 활용한 관광지 검색 및 조회 서비스
          </p>
        </section>

        {/* 에러 메시지 */}
        <section>
          <ErrorMessage type="api" message={errorMessage} fullScreen />
        </section>
      </div>
    );
  }
}
