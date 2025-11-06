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
 * - 지도 연동 (내일 구현 예정)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

export default function Home() {
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

      {/* 관광지 목록 영역 (향후 구현) */}
      <section>
        <div className="rounded-lg border bg-card p-12">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">
              관광지 목록이 여기에 표시됩니다
            </p>
            <p className="text-sm text-muted-foreground">
              Phase 2.2에서 구현 예정
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
