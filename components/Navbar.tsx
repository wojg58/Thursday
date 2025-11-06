/**
 * @file Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 홈페이지 상단에 표시되는 헤더 네비게이션 바입니다.
 * 로고, 검색창, 메뉴, 사용자 인증 버튼을 포함합니다.
 *
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { TourSearch } from "@/components/tour-search";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* 로고 영역 - 왼쪽에 배치 (적절한 간격 유지) */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
          >
            <span className="text-2xl font-bold">My Trip</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              한국 관광지 정보
            </span>
          </Link>

          {/* 검색창 (데스크톱에서만 표시) - 중앙에 배치 */}
          <div className="hidden md:flex flex-1 justify-center max-w-[500px] mx-auto">
            <TourSearch inHeader />
          </div>

          {/* 네비게이션 영역 - 오른쪽에 배치 */}
          <nav className="flex items-center gap-4 shrink-0">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              관광지
            </Link>
            <Link
              href="/bookmarks"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              북마크
            </Link>
            <div className="flex gap-2 items-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm">로그인</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
