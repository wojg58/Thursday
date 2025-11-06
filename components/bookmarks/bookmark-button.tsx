/**
 * @file components/bookmarks/bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지 상세페이지에서 북마크를 추가/제거할 수 있는 버튼 컴포넌트입니다.
 * PRD 2.4.5 북마크 기능을 구현합니다.
 *
 * 주요 기능:
 * 1. 북마크 추가/제거 (Supabase DB 연동)
 * 2. 인증된 사용자 확인 (Clerk)
 * 3. 로그인하지 않은 경우 localStorage 임시 저장
 * 4. 별 아이콘 (채워짐/비어있음)
 *
 * @dependencies
 * - @clerk/nextjs: useAuth, useUser
 * - @/lib/supabase/clerk-client: useClerkSupabaseClient
 * - @/lib/api/supabase-api: 북마크 관련 함수들
 * - lucide-react: Star 아이콘
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "@/lib/api/supabase-api";
import { cn } from "@/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

interface BookmarkButtonProps {
  /**
   * 관광지 콘텐츠 ID (한국관광공사 API의 contentid)
   */
  contentId: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * localStorage 키 (임시 북마크 저장용)
 */
const TEMP_BOOKMARKS_KEY = "mytrip_temp_bookmarks";

/**
 * localStorage에서 임시 북마크 목록 가져오기
 */
function getTempBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(TEMP_BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ localStorage 읽기 실패:", error);
    return [];
  }
}

/**
 * localStorage에 임시 북마크 저장
 */
function saveTempBookmark(contentId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const bookmarks = getTempBookmarks();
    if (!bookmarks.includes(contentId)) {
      bookmarks.push(contentId);
      localStorage.setItem(TEMP_BOOKMARKS_KEY, JSON.stringify(bookmarks));
      console.log("💾 임시 북마크 저장:", contentId);
    }
  } catch (error) {
    console.error("❌ localStorage 저장 실패:", error);
  }
}

/**
 * localStorage에서 임시 북마크 삭제
 */
function removeTempBookmark(contentId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const bookmarks = getTempBookmarks();
    const filtered = bookmarks.filter((id) => id !== contentId);
    localStorage.setItem(TEMP_BOOKMARKS_KEY, JSON.stringify(filtered));
    console.log("🗑️ 임시 북마크 삭제:", contentId);
  } catch (error) {
    console.error("❌ localStorage 삭제 실패:", error);
  }
}

/**
 * localStorage에서 임시 북마크 여부 확인
 */
function isTempBookmarked(contentId: string): boolean {
  const bookmarks = getTempBookmarks();
  return bookmarks.includes(contentId);
}

/**
 * clerk_id로 Supabase users 테이블에서 user_id (UUID) 가져오기
 */
async function getUserIdFromClerkId(
  supabase: SupabaseClient,
  clerkId: string
): Promise<string | null> {
  console.group("🔍 사용자 ID 조회");
  console.log("Clerk ID:", clerkId);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (error) {
      console.error("❌ 사용자 ID 조회 실패:", error);
      console.groupEnd();
      return null;
    }

    console.log("✅ 사용자 ID 조회 성공:", data.id);
    console.groupEnd();
    return data.id;
  } catch (error) {
    console.error("❌ 사용자 ID 조회 중 오류 발생:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 북마크 버튼 컴포넌트
 */
export function BookmarkButton({
  contentId,
  className,
}: BookmarkButtonProps) {
  const { isLoaded: authLoaded, userId: clerkUserId } = useAuth();
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  /**
   * 북마크 상태 확인
   */
  useEffect(() => {
    async function checkBookmarkStatus() {
      console.group("⭐ 북마크 상태 확인");
      console.log("Content ID:", contentId);
      console.log("Auth Loaded:", authLoaded);
      console.log("Clerk User ID:", clerkUserId);

      setIsLoading(true);

      // 인증이 로드되지 않았으면 대기
      if (!authLoaded) {
        console.log("⏳ 인증 로딩 중...");
        console.groupEnd();
        return;
      }

      // 로그인하지 않은 경우: localStorage 확인
      if (!clerkUserId || !user) {
        const tempBookmarked = isTempBookmarked(contentId);
        setIsBookmarkedState(tempBookmarked);
        console.log("📱 로그인하지 않음 - localStorage 확인:", tempBookmarked);
        setIsLoading(false);
        console.groupEnd();
        return;
      }

      // 로그인한 경우: Supabase에서 확인
      try {
        // clerk_id로 user_id (UUID) 가져오기
        const userId = await getUserIdFromClerkId(supabase, clerkUserId);

        if (!userId) {
          console.warn("⚠️ 사용자 ID를 찾을 수 없습니다.");
          setIsBookmarkedState(false);
          setIsLoading(false);
          console.groupEnd();
          return;
        }

        // 북마크 여부 확인
        const bookmarked = await isBookmarked(supabase, userId, contentId);
        setIsBookmarkedState(bookmarked);
        console.log("✅ 북마크 상태:", bookmarked);
      } catch (error) {
        console.error("❌ 북마크 상태 확인 실패:", error);
        setIsBookmarkedState(false);
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    }

    checkBookmarkStatus();
  }, [authLoaded, clerkUserId, user, contentId, supabase]);

  /**
   * 북마크 토글 핸들러
   */
  const handleToggleBookmark = async () => {
    console.group("⭐ 북마크 토글");
    console.log("Content ID:", contentId);
    console.log("현재 상태:", isBookmarkedState);

    if (isProcessing) {
      console.log("⏳ 이미 처리 중입니다.");
      console.groupEnd();
      return;
    }

    setIsProcessing(true);

    try {
      // 로그인하지 않은 경우: localStorage 사용
      if (!clerkUserId || !user) {
        if (isBookmarkedState) {
          removeTempBookmark(contentId);
          setIsBookmarkedState(false);
          setToastMessage("북마크가 제거되었습니다. 로그인하면 모든 기기에서 동기화됩니다.");
        } else {
          saveTempBookmark(contentId);
          setIsBookmarkedState(true);
          setToastMessage("북마크가 추가되었습니다. 로그인하면 모든 기기에서 동기화됩니다.");
        }
        setToastOpen(true);
        console.log("✅ localStorage 북마크 토글 완료");
        console.groupEnd();
        setIsProcessing(false);
        return;
      }

      // 로그인한 경우: Supabase 사용
      const userId = await getUserIdFromClerkId(supabase, clerkUserId);

      if (!userId) {
        setToastMessage("사용자 정보를 찾을 수 없습니다. 다시 시도해주세요.");
        setToastOpen(true);
        console.error("❌ 사용자 ID를 찾을 수 없습니다.");
        console.groupEnd();
        setIsProcessing(false);
        return;
      }

      if (isBookmarkedState) {
        // 북마크 제거
        await removeBookmark(supabase, userId, contentId);
        setIsBookmarkedState(false);
        setToastMessage("북마크가 제거되었습니다.");
        console.log("✅ 북마크 제거 완료");
      } else {
        // 북마크 추가
        const result = await addBookmark(supabase, userId, contentId);
        if (result) {
          setIsBookmarkedState(true);
          setToastMessage("북마크가 추가되었습니다.");
          console.log("✅ 북마크 추가 완료");
        } else {
          // 이미 북마크된 경우 (UNIQUE 제약)
          setIsBookmarkedState(true);
          setToastMessage("이미 북마크된 관광지입니다.");
          console.log("⚠️ 이미 북마크된 관광지");
        }
      }

      setToastOpen(true);
    } catch (error) {
      console.error("❌ 북마크 토글 실패:", error);
      setToastMessage("북마크 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setToastOpen(true);
    } finally {
      setIsProcessing(false);
      console.groupEnd();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleBookmark}
        disabled={isLoading || isProcessing}
        className={cn("gap-2", className)}
        aria-label={isBookmarkedState ? "북마크 제거" : "북마크 추가"}
      >
        <Star
          className={cn(
            "h-4 w-4",
            isBookmarkedState
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          )}
        />
        <span>{isBookmarkedState ? "북마크됨" : "북마크"}</span>
      </Button>

      <Toast
        message={toastMessage}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={2000}
      />
    </>
  );
}

