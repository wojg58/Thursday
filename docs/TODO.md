# My Trip 프로젝트 TODO 리스트

## 프로젝트 기본 구조

- [x] `.cursor/` 디렉토리
  - [x] `rules/` 커서룰
  - [x] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [x] `.github/` 디렉토리
- [ ] `.husky/` 디렉토리
- [x] `app/` 디렉토리
  - [x] `favicon.ico` 파일
  - [ ] `not-found.tsx` 파일
  - [ ] `robots.ts` 파일
  - [ ] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일
- [x] `supabase/` 디렉토리
- [x] `public/` 디렉토리
  - [x] `icons/` 디렉토리
  - [x] `logo.png` 파일
  - [x] `og-image.png` 파일
- [x] `tsconfig.json` 파일
- [x] `.cursorignore` 파일
- [x] `.gitignore` 파일
- [x] `.prettierignore` 파일
- [x] `.prettierrc` 파일
- [x] `eslint.config.mjs` 파일
- [x] `AGENTS.md` 파일

---

## Phase 1: 기본 구조 & 공통 설정

- [x] 프로젝트 셋업
- [x] `lib/types/` 디렉토리
  - [x] `tour.ts` - 타입 정의 (TourItem, TourDetail, TourIntro 등)
- [x] `lib/api/` 디렉토리
  - [x] `tour-api.ts` - 한국관광공사 API 호출 함수들
    - [x] `areaCode2` - 지역코드 조회
    - [x] `areaBasedList2` - 지역 기반 관광정보 조회
    - [x] `searchKeyword2` - 키워드 검색
    - [x] `detailCommon2` - 공통 정보 조회
    - [x] `detailIntro2` - 소개 정보 조회
    - [x] `detailImage2` - 이미지 목록 조회
  - [x] `supabase-api.ts` - Supabase 쿼리 함수들 (북마크)
    - [x] 북마크 추가/삭제
    - [x] 북마크 목록 조회
    - [x] 북마크 여부 확인
- [x] `components/ui/` 디렉토리
  - [x] 기본 shadcn/ui 컴포넌트 (button, dialog, form, input, label, textarea, accordion)
  - [x] 공통 컴포넌트 (로딩 스피너, 에러 메시지, 스켈레톤 UI)
- [x] `app/` 디렉토리
  - [x] `layout.tsx` - 레이아웃 구조 (헤더 포함 Navbar 통합)
- [x] 환경변수 설정
  - [x] `.env` 파일에 한국관광공사 API 키 설정
  - [ ] `.env` 파일에 네이버 지도 클라이언트 ID 설정 (⏰ 내일 구현 예정)

---

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 2.1 페이지 기본 구조

- [x] `app/page.tsx` - 빈 레이아웃 생성
- [ ] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터)

### 2.2 관광지 목록 기능 (MVP 2.1)

- [ ] `components/tour-card.tsx` - 관광지 카드 컴포넌트 (기본 정보만)
- [ ] `components/tour-list.tsx` - 목록 표시 컴포넌트 (하드코딩 데이터로 테스트)
- [ ] API 연동하여 실제 데이터 표시
- [ ] 페이지 확인 및 스타일링 조정

### 2.3 필터 기능 추가

- [ ] `components/tour-filters.tsx` - 지역/타입 필터 UI
- [ ] 필터 동작 연결 (상태 관리)
- [ ] 필터링된 결과 표시
- [ ] 페이지 확인 및 UX 개선

### 2.4 검색 기능 추가 (MVP 2.3)

- [ ] `components/tour-search.tsx` - 검색창 UI
- [ ] 검색 API 연동 (`searchKeyword2`)
- [ ] 검색 결과 표시
- [ ] 검색 + 필터 조합 동작
- [ ] 페이지 확인 및 UX 개선

### 2.5 지도 연동 (MVP 2.2) - ⏰ 내일 진행

- [ ] `components/naver-map.tsx` - 기본 지도 표시
- [ ] 관광지 마커 표시
- [ ] 마커 클릭 시 인포윈도우
- [ ] 리스트-지도 연동 (클릭/호버)
- [ ] 반응형 레이아웃 (데스크톱: 분할, 모바일: 탭)
- [ ] 페이지 확인 및 인터랙션 테스트

### 2.6 정렬 & 페이지네이션

- [ ] 정렬 옵션 추가 (최신순, 이름순)
- [ ] 페이지네이션 또는 무한 스크롤
- [ ] 로딩 상태 개선 (Skeleton UI)
- [ ] 최종 페이지 확인

---

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조

- [ ] `app/places/[contentId]/page.tsx` - 페이지 생성
- [ ] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
- [ ] 라우팅 테스트 (홈에서 클릭 시 이동)

### 3.2 기본 정보 섹션 (MVP 2.4.1)

- [ ] `components/tour-detail/detail-info.tsx` - 기본 정보 컴포넌트
- [ ] `detailCommon2` API 연동
- [ ] 관광지명, 이미지, 주소, 전화번호, 홈페이지, 개요 표시
- [ ] 주소 복사 기능
- [ ] 전화번호 클릭 시 전화 연결
- [ ] 페이지 확인 및 스타일링

### 3.3 지도 섹션 (MVP 2.4.4) - ⏰ 내일 진행

- [ ] `components/tour-detail/detail-map.tsx` - 상세페이지 지도 컴포넌트
- [ ] 해당 관광지 위치 표시 (마커 1개)
- [ ] "길찾기" 버튼 (네이버 지도 연동)
- [ ] 페이지 확인

### 3.4 공유 기능 (MVP 2.4.5)

- [ ] `components/tour-detail/share-button.tsx` - 공유 버튼 컴포넌트
- [ ] URL 복사 기능 (클립보드 API)
- [ ] 복사 완료 토스트 메시지
- [ ] Open Graph 메타태그 동적 생성
- [ ] 페이지 확인 및 공유 테스트

### 3.5 추가 정보 섹션 (향후 구현)

- [ ] `components/tour-detail/detail-intro.tsx` - 운영 정보 컴포넌트
- [ ] `detailIntro2` API 연동
- [ ] `components/tour-detail/detail-gallery.tsx` - 이미지 갤러리 컴포넌트
- [ ] `detailImage2` API 연동
- [ ] 페이지 확인

---

## Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 4.1 Supabase 설정

- [x] `supabase/migrations/` - 마이그레이션 파일 확인 (이미 `mytrip_schema.sql` 존재)
- [x] `bookmarks` 테이블 확인 (이미 생성됨)
- [x] RLS 정책 설정 (개발 환경에서는 비활성화 상태 유지)

### 4.2 북마크 기능 구현

- [ ] `components/bookmarks/bookmark-button.tsx` - 북마크 버튼 컴포넌트
- [ ] 상세페이지에 북마크 버튼 추가
- [ ] Supabase DB 연동
- [ ] 인증된 사용자 확인
- [ ] 로그인하지 않은 경우 localStorage 임시 저장
- [ ] 상세페이지에서 북마크 동작 확인

### 4.3 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` - 북마크 목록 페이지 생성
- [ ] `components/bookmarks/bookmark-list.tsx` - 북마크 목록 컴포넌트
- [ ] 북마크한 관광지 목록 표시
- [ ] 정렬 옵션 (최신순, 이름순, 지역별)
- [ ] 일괄 삭제 기능
- [ ] 페이지 확인

---

## Phase 5: 최적화 & 배포

- [x] `next.config.ts` - 이미지 최적화 (외부 도메인 설정)
- [ ] 전역 에러 핸들링 개선
- [ ] `app/not-found.tsx` - 404 페이지
- [ ] SEO 최적화
  - [ ] 메타태그
  - [ ] `app/sitemap.ts` - 사이트맵
  - [ ] `app/robots.ts` - robots.txt
- [ ] 성능 측정 (Lighthouse 점수 > 80)
- [ ] 환경변수 보안 검증
- [ ] Vercel 배포 및 테스트

---

## 참고사항

- Supabase DB 구조는 `supabase/migrations/mytrip_schema.sql` 참고
- 개발 환경에서는 RLS 비활성화 상태 유지
- 북마크 기능은 인증된 사용자만 사용 가능 (Clerk 연동)
- **지도 기능 (Phase 2.5, Phase 3.3)은 내일 진행 예정**
