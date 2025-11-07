# Vercel 배포 가이드 및 문제 해결

## 일반적인 Vercel 배포 오류 원인 및 해결 방법

### 1. 환경 변수 누락

**증상:**
- 빌드 중 `process.env.XXX is undefined` 에러
- 런타임에서 API 호출 실패
- 인증 관련 오류

**해결 방법:**

Vercel Dashboard → Project Settings → Environment Variables에서 다음 변수들을 설정하세요:

#### 필수 환경 변수

```bash
# 한국관광공사 API
NEXT_PUBLIC_TOUR_API_KEY=your_tour_api_key
TOUR_API_KEY=your_tour_api_key  # 백업용

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads

# 사이트 URL (선택사항, Open Graph용)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**주의사항:**
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트에 노출됩니다
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요
- Production, Preview, Development 환경별로 설정 가능

---

### 2. 빌드 타임 에러

**증상:**
- `Failed to compile` 에러
- 타입 에러
- 린트 에러

**해결 방법:**

#### 2-1. 로컬에서 빌드 테스트

```bash
# 로컬에서 빌드 테스트
pnpm run build

# 에러가 발생하면 수정 후 다시 빌드
```

#### 2-2. 일반적인 빌드 에러

**타입 에러:**
```bash
# 타입 체크만 실행
pnpm exec tsc --noEmit
```

**린트 에러:**
```bash
# 린트 체크
pnpm run lint
```

**의존성 문제:**
```bash
# node_modules 재설치
rm -rf node_modules .next
pnpm install
pnpm run build
```

---

### 3. Next.js 설정 문제

**증상:**
- 이미지 로드 실패
- 외부 API 호출 실패
- CORS 에러

**해결 방법:**

`next.config.ts` 파일 확인:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
      { hostname: "www.visitkorea.or.kr" },
      { hostname: "cdn.visitkorea.or.kr" },
    ],
  },
};

export default nextConfig;
```

---

### 4. Node.js 버전 문제

**증상:**
- 빌드 실패
- 런타임 에러

**해결 방법:**

Vercel Dashboard → Project Settings → General → Node.js Version을 확인하세요.

권장 버전: **20.x** (LTS)

`package.json`에 engines 필드 추가:

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

### 5. 빌드 명령어 및 출력 디렉토리

**기본 설정 (자동 감지):**
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `pnpm install`

**수동 설정이 필요한 경우:**

Vercel Dashboard → Project Settings → General에서 확인:
- Framework Preset: **Next.js**
- Root Directory: `./` (프로젝트 루트)

---

### 6. 의존성 설치 문제

**증상:**
- `pnpm install` 실패
- 패키지 버전 충돌

**해결 방법:**

#### 6-1. pnpm-lock.yaml 확인

```bash
# 로컬에서 lock 파일 재생성
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Update pnpm-lock.yaml"
git push
```

#### 6-2. package.json 확인

필수 의존성이 모두 포함되어 있는지 확인:

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.20.0",
    "@supabase/supabase-js": "^2.49.8",
    "next": "15.5.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

### 7. 런타임 에러

**증상:**
- 빌드는 성공하지만 페이지 로드 실패
- API 호출 실패
- 인증 오류

**해결 방법:**

#### 7-1. Vercel 로그 확인

Vercel Dashboard → Deployments → 최신 배포 → Functions 탭에서 로그 확인

#### 7-2. 환경 변수 확인

런타임에서 환경 변수가 제대로 로드되는지 확인:

```typescript
// 개발용 디버깅 코드 (프로덕션에서는 제거)
console.log('API Key exists:', !!process.env.NEXT_PUBLIC_TOUR_API_KEY);
```

#### 7-3. API 라우트 확인

Server Actions와 API Routes가 올바르게 설정되어 있는지 확인

---

### 8. 체크리스트

배포 전 확인사항:

- [ ] 로컬에서 `pnpm run build` 성공
- [ ] 로컬에서 `pnpm run lint` 통과
- [ ] 모든 환경 변수가 Vercel에 설정됨
- [ ] `next.config.ts` 설정 확인
- [ ] `package.json`의 의존성 버전 확인
- [ ] `pnpm-lock.yaml`이 최신 상태
- [ ] Node.js 버전이 20.x로 설정됨
- [ ] 이미지 도메인이 `remotePatterns`에 추가됨

---

### 9. 디버깅 팁

#### 9-1. Vercel 빌드 로그 확인

1. Vercel Dashboard → Deployments
2. 실패한 배포 클릭
3. Build Logs 탭에서 에러 확인

#### 9-2. 로컬 빌드와 Vercel 빌드 비교

```bash
# 로컬에서 프로덕션 빌드
pnpm run build

# 빌드 결과 확인
ls -la .next
```

#### 9-3. 환경 변수 확인

Vercel Dashboard에서 환경 변수가 올바르게 설정되었는지 확인:
- 변수명 오타 확인
- 값이 올바르게 입력되었는지 확인
- Production/Preview/Development 환경별 설정 확인

---

### 10. 일반적인 에러 메시지와 해결 방법

#### "Module not found"
- 의존성이 `package.json`에 추가되었는지 확인
- `pnpm install` 실행

#### "Type error"
- TypeScript 타입 에러 수정
- `tsconfig.json` 설정 확인

#### "Environment variable is missing"
- Vercel Dashboard에서 환경 변수 설정 확인
- 변수명이 정확한지 확인 (대소문자 구분)

#### "Image optimization failed"
- `next.config.ts`의 `remotePatterns`에 도메인 추가
- 이미지 URL이 유효한지 확인

#### "API route error"
- API 라우트 코드 확인
- 환경 변수 설정 확인
- CORS 설정 확인

---

### 11. 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [환경 변수 설정](https://vercel.com/docs/projects/environment-variables)

---

### 12. 지원

문제가 계속 발생하면:
1. Vercel 빌드 로그 전체 내용 확인
2. 에러 메시지의 정확한 파일 경로와 줄 번호 확인
3. 로컬 빌드와 Vercel 빌드 결과 비교

