/**
 * @file loading-spinner.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 표시되는 스피너 컴포넌트입니다.
 * 다양한 크기와 스타일을 지원합니다.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /**
   * 스피너 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 텍스트 표시 여부
   */
  showText?: boolean;
  /**
   * 커스텀 텍스트
   */
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export function LoadingSpinner({
  size = "md",
  className,
  showText = false,
  text = "로딩 중...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {showText && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
