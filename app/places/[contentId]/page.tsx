/**
 * @file app/places/[contentId]/page.tsx
 * @description 관광지 상세페이지
 *
 * 한국관광공사 API를 활용하여 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 개요)
 * 2. 뒤로가기 버튼
 * 3. 섹션별 구분된 레이아웃
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router 동적 라우팅 사용
 * - contentId를 URL 파라미터로 받아 API 호출
 * - detailCommon2 API 연동 (3.2에서 구현 예정)
 *
 * @dependencies
 * - next/navigation: useRouter (뒤로가기)
 * - @/lib/api/tour-api: detailCommon2 (향후 구현)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 관광지 상세페이지
 *
 * URL: /places/[contentId]
 * 예시: /places/125266
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  const { contentId } = await params;

  console.group("📍 관광지 상세페이지 로드");
  console.log("Content ID:", contentId);

  // TODO: 3.2에서 detailCommon2 API 연동 예정
  // const detail = await getDetailCommon(contentId);

  console.log("✅ 페이지 기본 구조 로드 완료");
  console.groupEnd();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 버튼 */}
      <section className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>뒤로가기</span>
          </Button>
        </Link>
      </section>

      {/* 페이지 제목 (임시) */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관광지 상세 정보</h1>
        <p className="text-muted-foreground">
          Content ID: {contentId}
        </p>
      </section>

      {/* 기본 정보 섹션 (3.2에서 구현 예정) */}
      <section className="mb-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">📋 기본 정보</h2>
          <p className="text-muted-foreground">
            기본 정보 섹션은 Phase 3.2에서 구현 예정입니다.
          </p>
        </div>
      </section>

      {/* 개요 섹션 (3.2에서 구현 예정) */}
      <section className="mb-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">📝 개요</h2>
          <p className="text-muted-foreground">
            개요 섹션은 Phase 3.2에서 구현 예정입니다.
          </p>
        </div>
      </section>

      {/* 지도 섹션 (3.3에서 구현 예정) */}
      <section className="mb-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">🗺️ 위치 정보</h2>
          <p className="text-muted-foreground">
            지도 섹션은 Phase 3.3에서 구현 예정입니다.
          </p>
        </div>
      </section>
    </div>
  );
}

