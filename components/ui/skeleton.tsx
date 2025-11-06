/**
 * @file skeleton.tsx
 * @description 스켈레톤 UI 컴포넌트
 *
 * 콘텐츠 로딩 중 표시되는 스켈레톤 UI 컴포넌트입니다.
 * 리스트, 카드 등 다양한 형태의 스켈레톤을 제공합니다.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 기본 스켈레톤 컴포넌트
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

/**
 * 카드 스켈레톤 컴포넌트
 */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 space-y-4',
        className
      )}
    >
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

/**
 * 리스트 스켈레톤 컴포넌트
 * @param count 표시할 스켈레톤 항목 수
 */
interface ListSkeletonProps extends SkeletonProps {
  count?: number;
}

export function ListSkeleton({
  count = 3,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-lg border bg-card p-4"
        >
          <Skeleton className="h-24 w-24 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 관광지 카드 스켈레톤 컴포넌트
 */
export function TourCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card overflow-hidden',
        className
      )}
    >
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * 그리드 스켈레톤 컴포넌트
 * @param columns 그리드 컬럼 수
 * @param rows 그리드 행 수
 */
interface GridSkeletonProps extends SkeletonProps {
  columns?: number;
  rows?: number;
}

export function GridSkeleton({
  columns = 3,
  rows = 2,
  className,
}: GridSkeletonProps) {
  const total = columns * rows;

  return (
    <div
      className={cn(
        'grid gap-4',
        `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`,
        className
      )}
    >
      {Array.from({ length: total }).map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  );
}

