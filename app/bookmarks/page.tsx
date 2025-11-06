/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * PRD 2.4.5 북마크 목록 페이지 요구사항을 구현합니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시
 * 2. 정렬 옵션 (최신순, 이름순, 지역별)
 * 3. 일괄 삭제 기능
 * 4. 빈 상태 처리
 *
 * @dependencies
 * - @/components/bookmarks/bookmark-list: BookmarkList 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

import { Star } from "lucide-react";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 북마크 | My Trip",
  description: "북마크한 관광지 목록을 확인하세요.",
};

/**
 * 북마크 목록 페이지
 *
 * URL: /bookmarks
 */
export default function BookmarksPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* 페이지 헤더 */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
          <h1 className="text-3xl font-bold">내 북마크</h1>
        </div>
        <p className="text-muted-foreground">
          북마크한 관광지를 한눈에 확인하고 관리하세요.
        </p>
      </section>

      {/* 북마크 목록 */}
      <BookmarkList />
    </div>
  );
}

