/**
 * @file tour-list-infinite.tsx
 * @description 무한 스크롤 관광지 목록 컴포넌트
 *
 * Intersection Observer를 사용하여 무한 스크롤을 구현한 관광지 목록 컴포넌트입니다.
 * PRD 2.6과 design.md의 무한 스크롤 요구사항을 기반으로 구현되었습니다.
 *
 * 기능:
 * - 무한 스크롤 (Intersection Observer)
 * - 추가 데이터 로드 (Server Action)
 * - 로딩 상태 표시 (Skeleton UI)
 * - 더 이상 데이터가 없을 때 안내 메시지
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TourItem, ContentTypeId } from "@/lib/types/tour";
import { TourCard } from "./tour-card";
import { GridSkeleton, TourCardSkeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import {
  loadMoreAreaBasedTours,
  loadMoreSearchResults,
} from "@/actions/tour-actions";

interface TourListInfiniteProps {
  /**
   * 초기 관광지 목록 데이터
   */
  initialTours: TourItem[];
  /**
   * 전체 항목 수
   */
  totalCount: number;
  /**
   * 검색 키워드 (검색 모드일 때)
   */
  keyword?: string;
  /**
   * 지역코드
   */
  areaCode: string;
  /**
   * 시/군/구 코드 (선택)
   */
  subAreaCode?: string;
  /**
   * 관광 타입 ID 목록
   */
  contentTypeIds: string[];
  /**
   * 정렬 옵션
   */
  sortBy: "latest" | "name";
  /**
   * 추가 클래스명
   */
  className?: string;
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
 * 빈 목록 메시지 컴포넌트
 */
function EmptyList({ searchKeyword }: { searchKeyword?: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-lg font-semibold text-muted-foreground mb-2">
        {searchKeyword
          ? `"${searchKeyword}"에 대한 검색 결과가 없습니다`
          : "관광지 정보가 없습니다"}
      </p>
      <p className="text-sm text-muted-foreground">
        {searchKeyword
          ? "다른 키워드로 검색하거나 필터를 조정해보세요."
          : "다른 조건으로 검색해보세요."}
      </p>
    </div>
  );
}

/**
 * 무한 스크롤 관광지 목록 컴포넌트
 */
export function TourListInfinite({
  initialTours,
  totalCount,
  keyword,
  areaCode,
  subAreaCode,
  contentTypeIds,
  sortBy,
  className,
}: TourListInfiniteProps) {
  // 서버에서 이미 정렬된 데이터를 받으므로, 초기값은 그대로 사용
  // useState의 초기값은 첫 렌더링에만 사용되므로 서버 데이터를 그대로 사용 (hydration 오류 방지)
  const [tours, setTours] = useState<TourItem[]>(() => initialTours);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(() => initialTours.length < totalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);
  const prevInitialToursRef = useRef<string>("");
  const isMountedRef = useRef(false);

  // 필터나 정렬이 변경되면 초기 데이터로 리셋
  // 서버에서 이미 정렬된 데이터를 받으므로 클라이언트에서 다시 정렬하지 않음
  useEffect(() => {
    // 마운트 후에만 실행 (초기 렌더링 제외)
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    // initialTours가 실제로 변경되었는지 확인 (참조 비교 대신 직렬화)
    const currentKey = JSON.stringify({
      tours: initialTours.map((t) => t.contentid),
      totalCount,
      sortBy,
    });

    // 실제로 변경된 경우에만 업데이트
    if (prevInitialToursRef.current !== currentKey) {
      setTours(initialTours);
      setCurrentPage(1);
      setHasMore(initialTours.length < totalCount);
      prevInitialToursRef.current = currentKey;
    }
  }, [initialTours, totalCount, sortBy]);

  /**
   * 추가 데이터 로드
   */
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    console.group("📄 무한 스크롤: 추가 데이터 로드");
    console.log("현재 페이지:", currentPage + 1);

    try {
      const nextPage = currentPage + 1;
      const searchAreaCode = subAreaCode || areaCode;
      const contentTypeId =
        contentTypeIds.length > 0
          ? (contentTypeIds[0] as ContentTypeId)
          : undefined;

      let result: {
        items: TourItem[];
        totalCount: number;
        hasMore: boolean;
      };

      if (keyword) {
        // 검색 모드
        result = await loadMoreSearchResults(
          keyword,
          searchAreaCode,
          contentTypeId,
          nextPage,
          20,
        );
      } else {
        // 지역 기반 모드
        result = await loadMoreAreaBasedTours(
          searchAreaCode,
          contentTypeId,
          nextPage,
          20,
        );
      }

      // 여러 타입이 선택된 경우 클라이언트 사이드에서 필터링
      let newItems = result.items;
      if (contentTypeIds.length > 1) {
        newItems = result.items.filter((tour) =>
          contentTypeIds.includes(tour.contenttypeid),
        );
      }

      // 정렬 적용
      if (sortBy === "name") {
        newItems.sort(sortByName);
      } else {
        newItems.sort(sortByLatest);
      }

      setTours((prev) => [...prev, ...newItems]);
      setCurrentPage(nextPage);
      setHasMore(result.hasMore && newItems.length > 0);

      console.log(
        `✅ ${newItems.length}개 항목 추가 완료 (전체: ${tours.length + newItems.length})`,
      );
      console.groupEnd();
    } catch (error) {
      console.error("❌ 추가 데이터 로드 실패:", error);
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    hasMore,
    currentPage,
    keyword,
    areaCode,
    subAreaCode,
    contentTypeIds,
    sortBy,
  ]);

  /**
   * Intersection Observer 설정
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: "100px", // 뷰포트 하단 100px 전에 로드 시작
      },
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // 빈 목록 처리
  if (tours.length === 0 && !isLoading) {
    return <EmptyList searchKeyword={keyword} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 관광지 목록 그리드 */}
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {tours.map((tour) => (
          <TourCard key={tour.contentid} tour={tour} />
        ))}
      </div>

      {/* 무한 스크롤 트리거 및 로딩 인디케이터 */}
      {hasMore && (
        <div ref={observerTarget} className="py-8">
          {isLoading && (
            <div
              className={cn(
                "grid gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 더 이상 데이터가 없을 때 */}
      {!hasMore && tours.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            모든 관광지를 불러왔습니다 ({tours.length}개)
          </p>
        </div>
      )}
    </div>
  );
}

