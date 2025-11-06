/**
 * @file components/tour-detail/share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 관광지 상세페이지에서 URL을 복사하여 공유할 수 있는 버튼 컴포넌트입니다.
 * PRD 2.4.5 공유 기능을 구현합니다.
 *
 * 주요 기능:
 * 1. URL 복사 기능 (클립보드 API)
 * 2. 복사 완료 토스트 메시지
 *
 * @dependencies
 * - navigator.clipboard: 클립보드 API
 * - @/components/ui/toast: Toast 컴포넌트
 * - lucide-react: Share2 아이콘
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

interface ShareButtonProps {
  /**
   * 공유할 URL (기본값: 현재 페이지 URL)
   */
  url?: string;
  /**
   * 공유할 제목 (선택 사항)
   */
  title?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * URL 복사 기능
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("클립보드 복사 실패:", error);
    return false;
  }
}

/**
 * 공유 버튼 컴포넌트
 */
export function ShareButton({
  url,
  title,
  className,
}: ShareButtonProps) {
  const [toastOpen, setToastOpen] = useState(false);

  /**
   * 공유 핸들러
   */
  const handleShare = async () => {
    console.group("🔗 URL 공유");
    
    // 공유할 URL 결정 (서버에서 전달받은 url 우선, 없으면 현재 페이지 URL)
    // 이벤트 핸들러는 클라이언트에서만 실행되므로 window 사용 가능
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    console.log("공유할 제목:", title);
    console.log("공유할 URL:", shareUrl);

    const success = await copyToClipboard(shareUrl);

    if (success) {
      setToastOpen(true);
      console.log("✅ URL 복사 성공");
    } else {
      console.error("❌ URL 복사 실패");
      // 복사 실패 시에도 사용자에게 알림 (선택 사항)
      alert("URL 복사에 실패했습니다. 브라우저가 클립보드 접근을 지원하지 않을 수 있습니다.");
    }
    
    console.groupEnd();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className={className}
        aria-label="URL 공유"
      >
        <Share2 className="h-4 w-4 mr-2" />
        <span>공유</span>
      </Button>
      
      {/* Toast는 내부에서 mounted 체크를 하므로 항상 렌더링 가능 */}
      <Toast
        message="URL이 클립보드에 복사되었습니다!"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={2000}
      />
    </>
  );
}

