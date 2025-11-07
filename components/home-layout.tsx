/**
 * @file home-layout.tsx
 * @description 홈페이지 레이아웃 컴포넌트 (리스트 + 지도)
 *
 * 관광지 목록과 지도를 함께 표시하는 레이아웃 컴포넌트입니다.
 * design.md의 레이아웃 요구사항을 기반으로 구현되었습니다.
 *
 * - 데스크톱: 리스트(좌측 50%) + 지도(우측 50%) 분할 레이아웃
 * - 모바일: 탭 형태로 리스트/지도 전환
 *
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useState, useEffect } from "react";
import { List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourListInfinite } from "@/components/tour-list-infinite";
import { NaverMap } from "@/components/naver-map";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface HomeLayoutProps {
  /**
   * 초기 관광지 목록
   */
  initialTours: TourItem[];
  /**
   * 전체 항목 수
   */
  totalCount: number;
  /**
   * 검색 키워드
   */
  keyword?: string;
  /**
   * 지역코드
   */
  areaCode: string;
  /**
   * 시/군/구 코드
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
}

type ViewMode = "list" | "map";

/**
 * 홈페이지 레이아웃 컴포넌트
 */
export function HomeLayout({
  initialTours,
  totalCount,
  keyword,
  areaCode,
  subAreaCode,
  contentTypeIds,
  sortBy,
}: HomeLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [tours, setTours] = useState<TourItem[]>(initialTours);

  // initialTours가 변경되면 tours 상태도 업데이트
  useEffect(() => {
    setTours(initialTours);
  }, [initialTours]);

  /**
   * 관광지 선택 핸들러 (리스트에서 클릭 시)
   */
  const handleTourSelect = (tour: TourItem) => {
    console.group("📍 관광지 선택");
    console.log("관광지:", tour.title);
    console.log("ID:", tour.contentid);
    console.groupEnd();

    setSelectedTourId(tour.contentid);
    
    // 모바일에서 리스트 클릭 시 지도 탭으로 전환
    if (window.innerWidth < 1024) {
      setViewMode("map");
    }
  };

  /**
   * 지도 마커 클릭 핸들러
   */
  const handleMarkerClick = (tour: TourItem) => {
    console.group("🗺️ 지도 마커 클릭");
    console.log("관광지:", tour.title);
    console.groupEnd();

    setSelectedTourId(tour.contentid);
    
    // 모바일에서 마커 클릭 시 리스트 탭으로 전환하지 않음 (지도에서 계속 보기)
  };

  /**
   * TourListInfinite의 tours 상태를 동기화하기 위한 콜백
   * 무한 스크롤로 추가된 관광지들을 지도에도 반영하기 위함
   */
  const handleToursUpdate = (updatedTours: TourItem[]) => {
    console.group("🔄 관광지 목록 업데이트");
    console.log("업데이트된 관광지 개수:", updatedTours.length);
    console.groupEnd();
    setTours(updatedTours);
  };

  return (
    <div className="w-full">
      {/* 모바일: 탭 전환 버튼 */}
      <div className="lg:hidden mb-4 flex gap-2 border-b">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          className={cn(
            "flex-1 rounded-none border-b-2 border-transparent",
            viewMode === "list" && "border-primary",
          )}
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4 mr-2" />
          <span>목록</span>
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "ghost"}
          className={cn(
            "flex-1 rounded-none border-b-2 border-transparent",
            viewMode === "map" && "border-primary",
          )}
          onClick={() => setViewMode("map")}
        >
          <MapIcon className="h-4 w-4 mr-2" />
          <span>지도</span>
        </Button>
      </div>

      {/* 데스크톱: 분할 레이아웃 */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:h-[calc(100vh-300px)]">
        {/* 좌측: 리스트 */}
        <div className="overflow-y-auto pr-2">
          <TourListInfinite
            initialTours={initialTours}
            totalCount={totalCount}
            keyword={keyword}
            areaCode={areaCode}
            subAreaCode={subAreaCode}
            contentTypeIds={contentTypeIds}
            sortBy={sortBy}
            onTourSelect={handleTourSelect}
            onToursUpdate={handleToursUpdate}
          />
        </div>

        {/* 우측: 지도 */}
        <div className="sticky top-0 h-full">
          <NaverMap
            tours={tours}
            selectedTourId={selectedTourId}
            onMarkerClick={handleMarkerClick}
            className="h-full"
          />
        </div>
      </div>

      {/* 모바일: 탭 전환 */}
      <div className="lg:hidden">
        {viewMode === "list" && (
          <div className="overflow-y-auto">
            <TourListInfinite
              initialTours={initialTours}
              totalCount={totalCount}
              keyword={keyword}
              areaCode={areaCode}
              subAreaCode={subAreaCode}
              contentTypeIds={contentTypeIds}
              sortBy={sortBy}
              onTourSelect={handleTourSelect}
              onToursUpdate={handleToursUpdate}
            />
          </div>
        )}

        {viewMode === "map" && (
          <div className="h-[calc(100vh-200px)]">
            <NaverMap
              tours={tours}
              selectedTourId={selectedTourId}
              onMarkerClick={handleMarkerClick}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

