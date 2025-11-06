/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * PRD 2.1 UI 요구사항을 기반으로 구현되었습니다.
 *
 * 기능:
 * - 카드 형태의 그리드 레이아웃
 * - 반응형 디자인 (모바일/태블릿/데스크톱)
 * - 로딩 상태 표시
 * - 빈 목록 처리
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import type { TourItem } from '@/lib/types/tour';
import { TourCard } from './tour-card';
import { GridSkeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface TourListProps {
  /**
   * 관광지 목록 데이터
   */
  tours: TourItem[];
  /**
   * 로딩 상태
   */
  isLoading?: boolean;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 빈 목록 메시지 컴포넌트
 */
function EmptyList() {
  return (
    <div className="text-center py-12">
      <p className="text-lg font-semibold text-muted-foreground mb-2">
        관광지 정보가 없습니다
      </p>
      <p className="text-sm text-muted-foreground">
        다른 조건으로 검색해보세요.
      </p>
    </div>
  );
}

export function TourList({
  tours,
  isLoading = false,
  className,
}: TourListProps) {
  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading) {
    return <GridSkeleton columns={3} rows={2} className={className} />;
  }

  // 빈 목록 처리
  if (tours.length === 0) {
    return <EmptyList />;
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}

