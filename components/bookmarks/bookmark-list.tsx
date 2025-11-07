/**
 * @file components/bookmarks/bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * PRD 2.4.5 북마크 목록 페이지 요구사항을 구현합니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시 (카드 레이아웃)
 * 2. 정렬 옵션 (최신순, 이름순, 지역별)
 * 3. 일괄 삭제 기능
 * 4. 빈 상태 처리
 *
 * @dependencies
 * - @/components/tour-card: TourCard 컴포넌트
 * - @/lib/api/supabase-api: 북마크 관련 함수들
 * - @/lib/api/tour-api: getDetailCommon
 * - @/lib/types/tour: TourItem, TourDetail
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, Trash2, CheckSquare, Square } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tour-card";
import { TourCardSkeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { Toast } from "@/components/ui/toast";
import {
  getBookmarks,
  removeBookmarks,
  type Bookmark,
} from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourItem, TourDetail } from "@/lib/types/tour";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BookmarkListProps {
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 정렬 옵션 타입
 */
type SortOption = "latest" | "name" | "region";

/**
 * 북마크 날짜 표시 컴포넌트
 * 
 * Hydration 에러를 방지하기 위해 클라이언트에서만 날짜를 포맷팅합니다.
 * 서버에서는 빈 문자열을 렌더링하고, 클라이언트에서 마운트된 후 날짜를 표시합니다.
 */
function BookmarkDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // 클라이언트에서만 날짜 포맷팅
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setFormattedDate(formatted);
  }, [dateString]);

  return (
    <div className="absolute bottom-2 left-2 z-10">
      <span className="px-2 py-1 text-xs rounded bg-background/80 backdrop-blur-sm border">
        {formattedDate || "..."}
      </span>
    </div>
  );
}

/**
 * TourDetail을 TourItem으로 변환
 * 북마크 목록에서 TourCard를 사용하기 위해 필요
 */
function tourDetailToTourItem(detail: TourDetail): TourItem {
  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: "", // TourDetail에는 없으므로 빈 문자열
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime: new Date().toISOString(), // TourDetail에는 없으므로 현재 시간 사용
  };
}

/**
 * clerk_id로 Supabase users 테이블에서 user_id (UUID) 가져오기
 */
async function getUserIdFromClerkId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      console.error("❌ 사용자 ID 조회 실패:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("❌ 사용자 ID 조회 중 오류 발생:", error);
    return null;
  }
}

/**
 * 북마크 목록 컴포넌트
 */
export function BookmarkList({ className }: BookmarkListProps) {
  const { isLoaded: authLoaded, userId: clerkUserId } = useAuth();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [tourItems, setTourItems] = useState<TourItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * 북마크 목록 조회 및 관광지 정보 가져오기
   */
  useEffect(() => {
    async function loadBookmarks() {
      console.group("📚 북마크 목록 로드");
      setIsLoading(true);
      setError(null);

      // 인증이 로드되지 않았으면 대기
      if (!authLoaded) {
        console.log("⏳ 인증 로딩 중...");
        console.groupEnd();
        return;
      }

      // 로그인하지 않은 경우
      if (!clerkUserId || !user) {
        console.log("📱 로그인하지 않음");
        setBookmarks([]);
        setTourItems([]);
        setIsLoading(false);
        console.groupEnd();
        return;
      }

      try {
        // clerk_id로 user_id (UUID) 가져오기
        const userId = await getUserIdFromClerkId(supabase, clerkUserId);

        if (!userId) {
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        }

        // 북마크 목록 조회
        const bookmarkList = await getBookmarks(supabase, userId, {
          orderBy: "created_at",
          order: "desc",
        });

        console.log(`✅ 북마크 ${bookmarkList.length}개 조회 완료`);

        setBookmarks(bookmarkList);

        // 각 북마크의 관광지 정보 가져오기
        const tourDetails = await Promise.all(
          bookmarkList.map(async (bookmark) => {
            try {
              const detail = await getDetailCommon(bookmark.content_id);
              return detail ? tourDetailToTourItem(detail) : null;
            } catch (error) {
              console.error(
                `❌ 관광지 정보 조회 실패 (${bookmark.content_id}):`,
                error
              );
              return null;
            }
          })
        );

        // null 제거
        const validTourItems = tourDetails.filter(
          (item): item is TourItem => item !== null
        );

        console.log(`✅ 관광지 정보 ${validTourItems.length}개 로드 완료`);
        setTourItems(validTourItems);
      } catch (err) {
        console.error("❌ 북마크 목록 로드 실패:", err);
        setError(
          err instanceof Error ? err.message : "북마크 목록을 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    }

    loadBookmarks();
  }, [authLoaded, clerkUserId, user, supabase]);

  /**
   * 정렬된 관광지 목록
   */
  const sortedTourItems = useMemo(() => {
    const items = [...tourItems];

    switch (sortBy) {
      case "latest":
        // 북마크 생성일 기준 정렬 (최신순)
        return items.sort((a, b) => {
          const bookmarkA = bookmarks.find((bm) => bm.content_id === a.contentid);
          const bookmarkB = bookmarks.find((bm) => bm.content_id === b.contentid);
          if (!bookmarkA || !bookmarkB) return 0;
          return (
            new Date(bookmarkB.created_at).getTime() -
            new Date(bookmarkA.created_at).getTime()
          );
        });

      case "name":
        // 이름순 (가나다순)
        return items.sort((a, b) => a.title.localeCompare(b.title, "ko"));

      case "region":
        // 지역별 정렬 (areacode 기준, 없으면 주소 기준)
        return items.sort((a, b) => {
          const regionA = a.areacode || a.addr1;
          const regionB = b.areacode || b.addr1;
          return regionA.localeCompare(regionB, "ko");
        });

      default:
        return items;
    }
  }, [tourItems, bookmarks, sortBy]);

  /**
   * 선택 토글
   */
  const toggleSelection = (contentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  };

  /**
   * 전체 선택/해제
   */
  const toggleSelectAll = () => {
    if (selectedIds.size === sortedTourItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTourItems.map((item) => item.contentid)));
    }
  };

  /**
   * 일괄 삭제
   */
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      setToastMessage("삭제할 항목을 선택해주세요.");
      setToastOpen(true);
      return;
    }

    if (!clerkUserId || !user) {
      setToastMessage("로그인이 필요합니다.");
      setToastOpen(true);
      return;
    }

    console.group("🗑️ 북마크 일괄 삭제");
    console.log("선택된 항목:", Array.from(selectedIds));

    setIsDeleting(true);

    try {
      const userId = await getUserIdFromClerkId(supabase, clerkUserId);

      if (!userId) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      // 일괄 삭제
      await removeBookmarks(supabase, userId, Array.from(selectedIds));

      // 목록에서 제거
      setBookmarks((prev) =>
        prev.filter((bm) => !selectedIds.has(bm.content_id))
      );
      setTourItems((prev) =>
        prev.filter((item) => !selectedIds.has(item.contentid))
      );
      setSelectedIds(new Set());

      setToastMessage(`${selectedIds.size}개의 북마크가 삭제되었습니다.`);
      setToastOpen(true);
      console.log("✅ 일괄 삭제 완료");
    } catch (error) {
      console.error("❌ 일괄 삭제 실패:", error);
      setToastMessage("북마크 삭제 중 오류가 발생했습니다.");
      setToastOpen(true);
    } finally {
      setIsDeleting(false);
      console.groupEnd();
    }
  };

  /**
   * 개별 삭제
   */
  const handleDelete = async (contentId: string) => {
    if (!clerkUserId || !user) {
      setToastMessage("로그인이 필요합니다.");
      setToastOpen(true);
      return;
    }

    console.group("🗑️ 북마크 삭제");
    console.log("Content ID:", contentId);

    try {
      const userId = await getUserIdFromClerkId(supabase, clerkUserId);

      if (!userId) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const { removeBookmark } = await import("@/lib/api/supabase-api");
      await removeBookmark(supabase, userId, contentId);

      // 목록에서 제거
      setBookmarks((prev) =>
        prev.filter((bm) => bm.content_id !== contentId)
      );
      setTourItems((prev) =>
        prev.filter((item) => item.contentid !== contentId)
      );

      setToastMessage("북마크가 삭제되었습니다.");
      setToastOpen(true);
      console.log("✅ 삭제 완료");
    } catch (error) {
      console.error("❌ 삭제 실패:", error);
      setToastMessage("북마크 삭제 중 오류가 발생했습니다.");
      setToastOpen(true);
    } finally {
      console.groupEnd();
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <ErrorMessage type="api" message={error} />
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!clerkUserId || !user) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="rounded-lg border bg-card p-12 text-center">
          <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">로그인이 필요합니다</h3>
          <p className="text-muted-foreground mb-6">
            북마크 기능을 사용하려면 로그인해주세요.
          </p>
          <Link href="/sign-in">
            <Button>로그인하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 빈 목록
  if (sortedTourItems.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="rounded-lg border bg-card p-12 text-center">
          <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            아직 북마크한 관광지가 없습니다
          </h3>
          <p className="text-muted-foreground mb-6">
            관광지를 북마크하면 여기서 확인할 수 있습니다.
          </p>
          <Link href="/">
            <Button>관광지 둘러보기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {/* 컨트롤 바 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              총 {sortedTourItems.length}개
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 정렬 옵션 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-sm border rounded-md bg-background"
            >
              <option value="latest">최신순</option>
              <option value="name">이름순</option>
              <option value="region">지역별</option>
            </select>

            {/* 전체 선택 */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="gap-2"
            >
              {selectedIds.size === sortedTourItems.length ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span>전체 해제</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  <span>전체 선택</span>
                </>
              )}
            </Button>

            {/* 일괄 삭제 */}
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>삭제 ({selectedIds.size})</span>
              </Button>
            )}
          </div>
        </div>

        {/* 북마크 목록 */}
        <div
          className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {sortedTourItems.map((tour) => {
            const bookmark = bookmarks.find(
              (bm) => bm.content_id === tour.contentid
            );
            const isSelected = selectedIds.has(tour.contentid);

            return (
              <div key={tour.contentid} className="relative">
                {/* 체크박스 */}
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => toggleSelection(tour.contentid)}
                    className={cn(
                      "p-1 rounded bg-background/80 backdrop-blur-sm",
                      "hover:bg-background transition-colors",
                      "border",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                    aria-label={isSelected ? "선택 해제" : "선택"}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* 삭제 버튼 */}
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tour.contentid)}
                    className="h-8 w-8 p-0"
                    aria-label="북마크 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* 북마크 날짜 */}
                {bookmark && (
                  <BookmarkDate dateString={bookmark.created_at} />
                )}

                {/* 관광지 카드 */}
                <TourCard tour={tour} />
              </div>
            );
          })}
        </div>
      </div>

      <Toast
        message={toastMessage}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={2000}
      />
    </>
  );
}

