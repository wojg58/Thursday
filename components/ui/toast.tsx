/**
 * @file components/ui/toast.tsx
 * @description 토스트 메시지 컴포넌트
 *
 * 사용자에게 알림 메시지를 표시하는 토스트 컴포넌트입니다.
 * PRD 2.4.5 공유 기능의 복사 완료 메시지에 사용됩니다.
 */

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  /**
   * 토스트 메시지
   */
  message: string;
  /**
   * 표시 여부
   */
  open: boolean;
  /**
   * 닫기 콜백
   */
  onClose: () => void;
  /**
   * 자동 닫기 시간 (ms, 기본값: 2000)
   */
  duration?: number;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 토스트 컴포넌트
 */
export function Toast({
  message,
  open,
  onClose,
  duration = 2000,
  className,
}: ToastProps) {
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 마운트되도록 처리 (hydration 에러 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && mounted) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose, mounted]);

  // 서버 사이드 렌더링 시에는 렌더링하지 않음
  if (!mounted || !open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-lg",
        "transition-all duration-300 ease-in-out",
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded-md p-1 hover:bg-muted"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

