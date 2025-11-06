/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 선택할 수 있는 필터 컴포넌트입니다.
 * PRD 2.1과 design.md의 필터 섹션을 기반으로 구현되었습니다.
 *
 * 기능:
 * - 지역 필터 (시/도 단위)
 * - 관광 타입 필터 (멀티 선택)
 * - 정렬 옵션 (최신순, 이름순)
 * - 선택된 필터 뱃지 표시
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Tag, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AreaCode } from '@/lib/types/tour';
import { CONTENT_TYPE } from '@/lib/types/tour';
import { cn } from '@/lib/utils';

interface TourFiltersProps {
  /**
   * 지역 목록
   */
  areas: AreaCode[];
}

/**
 * 관광 타입 ID를 한글 이름으로 변환
 */
function getContentTypeName(contentTypeId: string): string {
  const typeMap: Record<string, string> = {
    [CONTENT_TYPE.TOURIST_SPOT]: '관광지',
    [CONTENT_TYPE.CULTURAL_FACILITY]: '문화시설',
    [CONTENT_TYPE.FESTIVAL]: '축제/행사',
    [CONTENT_TYPE.TRAVEL_COURSE]: '여행코스',
    [CONTENT_TYPE.LEISURE_SPORTS]: '레포츠',
    [CONTENT_TYPE.ACCOMMODATION]: '숙박',
    [CONTENT_TYPE.SHOPPING]: '쇼핑',
    [CONTENT_TYPE.RESTAURANT]: '음식점',
  };

  return typeMap[contentTypeId] || '기타';
}

/**
 * 모든 관광 타입 목록
 */
const ALL_CONTENT_TYPES = Object.entries(CONTENT_TYPE).map(([key, value]) => ({
  id: value,
  name: getContentTypeName(value),
}));

export function TourFilters({ areas }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 현재 필터 값 읽기
  const selectedArea = searchParams.get('areaCode') || '';
  const selectedTypes = searchParams.get('contentTypeId')?.split(',') || [];
  const sortBy = (searchParams.get('sort') as 'latest' | 'name') || 'latest';

  /**
   * URL 쿼리 파라미터 업데이트
   */
  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // 페이지 번호 초기화
    params.delete('page');

    router.push(`/?${params.toString()}`, { scroll: false });
  };

  /**
   * 지역 변경 핸들러
   */
  const handleAreaChange = (areaCode: string) => {
    updateParams('areaCode', areaCode === 'all' ? null : areaCode);
  };

  /**
   * 관광 타입 토글 핸들러
   */
  const handleTypeToggle = (typeId: string) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter((id) => id !== typeId)
      : [...selectedTypes, typeId];

    updateParams('contentTypeId', newTypes.length > 0 ? newTypes.join(',') : null);
  };

  /**
   * 관광 타입 제거 핸들러
   */
  const handleTypeRemove = (typeId: string) => {
    const newTypes = selectedTypes.filter((id) => id !== typeId);
    updateParams('contentTypeId', newTypes.length > 0 ? newTypes.join(',') : null);
  };

  /**
   * 정렬 변경 핸들러
   */
  const handleSortChange = (sort: 'latest' | 'name') => {
    updateParams('sort', sort);
  };

  /**
   * 모든 필터 초기화
   */
  const handleReset = () => {
    router.push('/', { scroll: false });
  };

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        {/* 필터 컨트롤 */}
        <div className="flex flex-col gap-4">
          {/* 첫 번째 줄: 지역, 정렬, 초기화 */}
          <div className="flex flex-wrap items-center gap-4">
            {/* 지역 선택 */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={selectedArea || 'all'} onValueChange={handleAreaChange}>
                <SelectTrigger className="w-[140px] sm:w-[160px]">
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.code} value={area.code}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 정렬 선택 */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 필터 초기화 버튼 */}
            {(selectedArea || selectedTypes.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 ml-auto"
              >
                초기화
              </Button>
            )}
          </div>

          {/* 두 번째 줄: 관광 타입 선택 (모바일: 가로 스크롤) */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {ALL_CONTENT_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <Button
                    key={type.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeToggle(type.id)}
                    className="h-8 shrink-0"
                  >
                    {type.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 선택된 필터 뱃지 */}
        {(selectedArea || selectedTypes.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">선택된 필터:</span>
            {selectedArea && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {areas.find((a) => a.code === selectedArea)?.name || selectedArea}
                <button
                  onClick={() => handleAreaChange('all')}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  aria-label="지역 필터 제거"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedTypes.map((typeId) => (
              <Badge key={typeId} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {getContentTypeName(typeId)}
                <button
                  onClick={() => handleTypeRemove(typeId)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  aria-label="관광 타입 필터 제거"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

