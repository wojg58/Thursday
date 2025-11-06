/**
 * @file Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 홈페이지 상단에 표시되는 헤더 네비게이션 바입니다.
 * 로고, 메뉴, 사용자 인증 버튼을 포함합니다.
 */

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">My Trip</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            한국 관광지 정보
          </span>
        </Link>
        <nav className="flex items-center gap-4">
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
    </header>
  );
};

export default Navbar;
