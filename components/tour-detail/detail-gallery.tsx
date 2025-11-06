/**
 * @file components/tour-detail/detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지 상세페이지에서 이미지 갤러리를 표시하는 컴포넌트입니다.
 * PRD 2.4.3 이미지 갤러리 요구사항을 구현합니다.
 *
 * 주요 기능:
 * 1. 대표 이미지 + 서브 이미지들 표시
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 슬라이드 기능 (이전/다음 버튼)
 * 4. 이미지 없으면 기본 이미지 표시
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/components/ui/dialog: 모달 컴포넌트
 * - lucide-react: 아이콘
 * - @/lib/types/tour: TourImage 타입
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TourImage } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailGalleryProps {
  /**
   * 이미지 목록
   */
  images: TourImage[];
  /**
   * 관광지명 (이미지 alt 텍스트용)
   */
  title: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 기본 이미지 URL (이미지가 없을 때 사용)
 */
const DEFAULT_IMAGE = "/images/default/placeholder.svg";

/**
 * 이미지 URL 유효성 검사
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  if (url.startsWith("/")) {
    return url !== DEFAULT_IMAGE;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 관광지 이미지 갤러리 컴포넌트
 */
export function DetailGallery({
  images,
  title,
  className,
}: DetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 마운트되도록 처리 (hydration 에러 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 유효한 이미지 URL만 필터링 (useMemo로 메모이제이션)
  const validImages = useMemo(
    () =>
      images.filter((img) =>
        isValidImageUrl(img.originimgurl || img.smallimageurl),
      ),
    [images],
  );

  /**
   * 이미지 클릭 핸들러
   */
  const handleImageClick = (index: number) => {
    console.group("🖼️ 이미지 갤러리");
    console.log("선택된 이미지 인덱스:", index);
    console.log("이미지 URL:", validImages[index]?.originimgurl);
    console.groupEnd();
    setSelectedIndex(index);
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = () => {
    setSelectedIndex(null);
  };

  /**
   * 이전 이미지로 이동
   */
  const handlePrevious = () => {
    if (selectedIndex === null) return;
    const newIndex =
      selectedIndex === 0 ? validImages.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
  };

  /**
   * 다음 이미지로 이동
   */
  const handleNext = () => {
    if (selectedIndex === null) return;
    const newIndex =
      selectedIndex === validImages.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
  };

  // 키보드 네비게이션 (화살표 키) - 항상 Hook 호출 (조건부 실행은 내부에서)
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const newIndex =
          selectedIndex === 0 ? validImages.length - 1 : selectedIndex - 1;
        setSelectedIndex(newIndex);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const newIndex =
          selectedIndex === validImages.length - 1 ? 0 : selectedIndex + 1;
        setSelectedIndex(newIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, validImages.length]);

  const selectedImage =
    selectedIndex !== null ? validImages[selectedIndex] : null;

  // 이미지가 없으면 렌더링하지 않음 (모든 Hook 호출 후)
  if (!mounted || validImages.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-4">📸 이미지 갤러리</h2>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {validImages.map((image, index) => {
            const imageUrl = image.originimgurl || image.smallimageurl || "";
            const imageName = image.imagename || `${title} 이미지 ${index + 1}`;

            return (
              <button
                key={image.serialnum || index}
                onClick={() => handleImageClick(index)}
                className="relative aspect-video rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity group"
                aria-label={`${imageName} 보기`}
              >
                <Image
                  src={imageUrl}
                  alt={imageName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={imageUrl.startsWith("http://")}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* 이미지 개수 표시 */}
        <p className="text-sm text-muted-foreground mt-4 text-center">
          총 {validImages.length}개의 이미지
        </p>
      </div>

      {/* 전체화면 이미지 모달 */}
      {selectedImage && selectedIndex !== null && (
        <Dialog open={selectedIndex !== null} onOpenChange={handleClose}>
          <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 bg-black/95">
            <DialogHeader className="sr-only">
              <DialogTitle>{title} 이미지 갤러리</DialogTitle>
            </DialogHeader>

            <div className="relative w-full h-full flex items-center justify-center">
              {/* 이미지 */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={
                    selectedImage.originimgurl ||
                    selectedImage.smallimageurl ||
                    ""
                  }
                  alt={
                    selectedImage.imagename ||
                    `${title} 이미지 ${selectedIndex + 1}`
                  }
                  width={1920}
                  height={1080}
                  className="max-w-full max-h-[90vh] object-contain"
                  unoptimized={
                    (selectedImage.originimgurl || selectedImage.smallimageurl || "").startsWith(
                      "http://",
                    )
                  }
                  priority
                />
              </div>

              {/* 이전 버튼 */}
              {validImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePrevious}
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* 다음 버튼 */}
              {validImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                  onClick={handleNext}
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* 이미지 인덱스 표시 */}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                  {selectedIndex + 1} / {validImages.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

