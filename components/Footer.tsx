/**
 * @file Footer.tsx
 * @description 푸터 컴포넌트
 *
 * 홈페이지 하단에 표시되는 푸터 컴포넌트입니다.
 * 프로젝트 정보 및 링크를 제공합니다.
 */

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 프로젝트 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">My Trip</h3>
            <p className="text-sm text-muted-foreground">
              한국관광공사 공공 API를 활용한 전국 관광지 정보 서비스
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/bookmarks"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  북마크
                </Link>
              </li>
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">정보</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://www.data.go.kr/data/15101578/openapi.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  한국관광공사 API
                </a>
              </li>
              <li>© 2025 My Trip</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            본 서비스는 한국관광공사에서 제공하는 공공데이터를 활용합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}

