/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색할 수 있는 검색창 컴포넌트입니다.
 * PRD 2.3과 design.md의 검색 섹션을 기반으로 구현되었습니다.
 *
 * 기능:
 * - 키워드 입력
 * - 엔터 또는 검색 버튼으로 검색 실행
 * - 검색 중 로딩 상태 표시
 * - URL 쿼리 파라미터로 검색 키워드 관리
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

interface TourSearchProps {
  /**
   * 검색창 너비 (모바일/데스크톱)
   */
  className?: string;
  /**
   * 검색창이 헤더에 있는지 여부
   */
  inHeader?: boolean;
  /**
   * 초기 검색 키워드 (서버에서 전달)
   */
  initialKeyword?: string;
}

/**
 * 관광지 검색 컴포넌트 (내부 구현)
 */
function TourSearchInner({
  className,
  inHeader = false,
  initialKeyword = '',
}: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 초기 상태는 서버에서 전달받은 값 또는 빈 문자열
  // hydration 오류 방지를 위해 클라이언트에서만 URL에서 읽기
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 마운트 후 URL에서 검색 키워드 읽기 (hydration 오류 방지)
  useEffect(() => {
    setIsMounted(true);
    const currentKeyword = searchParams.get('keyword') || '';
    setKeyword(currentKeyword);
  }, []);

  // URL 변경 시 검색 키워드 업데이트
  useEffect(() => {
    if (isMounted) {
      const currentKeyword = searchParams.get('keyword') || '';
      setKeyword(currentKeyword);
    }
  }, [searchParams, isMounted]);

  /**
   * 검색 실행
   */
  const handleSearch = (searchKeyword: string) => {
    console.group('🔍 관광지 검색');
    console.log('검색 키워드:', searchKeyword);

    if (!searchKeyword.trim()) {
      // 빈 검색어인 경우 keyword 파라미터 제거
      const params = new URLSearchParams(searchParams.toString());
      params.delete('keyword');
      params.delete('page'); // 페이지 번호 초기화
      router.push(`/?${params.toString()}`, { scroll: false });
      console.log('검색어가 비어있어 필터만 적용');
      console.groupEnd();
      return;
    }

    setIsSearching(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('keyword', searchKeyword.trim());
    params.delete('page'); // 페이지 번호 초기화

    router.push(`/?${params.toString()}`, { scroll: false });
    console.log('✅ 검색 실행 완료');
    console.groupEnd();

    // 검색 완료 후 로딩 상태 해제 (약간의 딜레이)
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  /**
   * 검색어 초기화
   */
  const handleClear = () => {
    setKeyword('');
    inputRef.current?.focus();

    const params = new URLSearchParams(searchParams.toString());
    params.delete('keyword');
    params.delete('page');
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  /**
   * 엔터 키 핸들러
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(keyword);
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center',
        inHeader ? 'w-full max-w-[500px]' : 'w-full',
        className
      )}
    >
      <div className="relative flex-1">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
            isSearching ? 'text-muted-foreground' : 'text-muted-foreground'
          )}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="관광지명, 주소, 설명으로 검색..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'pl-10 pr-10',
            inHeader
              ? 'h-9 text-sm min-w-[300px] sm:min-w-[400px]'
              : 'h-10 text-base'
          )}
          disabled={isSearching}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {keyword && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {!inHeader && (
        <Button
          onClick={() => handleSearch(keyword)}
          disabled={isSearching || !keyword.trim()}
          className="ml-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검색 중...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              검색
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * 관광지 검색 컴포넌트 (Suspense로 감싸서 hydration 오류 방지)
 */
export function TourSearch(props: TourSearchProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'relative flex items-center',
            props.inHeader ? 'w-full max-w-[500px]' : 'w-full',
            props.className
          )}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="관광지명, 주소, 설명으로 검색..."
              disabled
              className={cn(
                'pl-10 pr-10',
                props.inHeader
                  ? 'h-9 text-sm min-w-[300px] sm:min-w-[400px]'
                  : 'h-10 text-base'
              )}
            />
          </div>
        </div>
      }
    >
      <TourSearchInner {...props} />
    </Suspense>
  );
}

