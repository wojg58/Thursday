/**
 * @file tour-actions.ts
 * @description 관광지 관련 Server Actions
 *
 * 클라이언트에서 호출할 수 있는 서버 액션들을 제공합니다.
 * 무한 스크롤을 위한 추가 페이지 데이터 로드에 사용됩니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

"use server";

import {
  getAreaBasedList,
  searchKeyword,
} from "@/lib/api/tour-api";
import type { TourItem, ContentTypeId } from "@/lib/types/tour";

/**
 * 추가 페이지 데이터 로드 (지역 기반)
 */
export async function loadMoreAreaBasedTours(
  areaCode: string,
  contentTypeId: ContentTypeId | undefined,
  pageNo: number,
  numOfRows: number = 20,
): Promise<{ items: TourItem[]; totalCount: number; hasMore: boolean }> {
  console.group("📄 Server Action: 추가 페이지 로드 (지역 기반)");
  console.log("파라미터:", { areaCode, contentTypeId, pageNo, numOfRows });

  try {
    const result = await getAreaBasedList(
      areaCode,
      contentTypeId,
      pageNo,
      numOfRows,
    );

    const hasMore = result.items.length === numOfRows;

    console.log(
      `✅ ${result.items.length}개 항목 로드 완료 (전체: ${result.totalCount}, 더 있음: ${hasMore})`,
    );
    console.groupEnd();

    return {
      items: result.items,
      totalCount: result.totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("❌ 추가 페이지 로드 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 추가 페이지 데이터 로드 (키워드 검색)
 */
export async function loadMoreSearchResults(
  keyword: string,
  areaCode: string | undefined,
  contentTypeId: ContentTypeId | undefined,
  pageNo: number,
  numOfRows: number = 20,
): Promise<{ items: TourItem[]; totalCount: number; hasMore: boolean }> {
  console.group("📄 Server Action: 추가 페이지 로드 (검색)");
  console.log("파라미터:", {
    keyword,
    areaCode,
    contentTypeId,
    pageNo,
    numOfRows,
  });

  try {
    const result = await searchKeyword(
      keyword,
      areaCode,
      contentTypeId,
      pageNo,
      numOfRows,
    );

    const hasMore = result.items.length === numOfRows;

    console.log(
      `✅ ${result.items.length}개 항목 로드 완료 (전체: ${result.totalCount}, 더 있음: ${hasMore})`,
    );
    console.groupEnd();

    return {
      items: result.items,
      totalCount: result.totalCount,
      hasMore,
    };
  } catch (error) {
    console.error("❌ 추가 페이지 로드 실패:", error);
    console.groupEnd();
    throw error;
  }
}

