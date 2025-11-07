# Hydration 에러 해결 가이드

## 문제 원인

React Hydration 에러는 서버에서 렌더링된 HTML과 클라이언트에서 렌더링된 HTML이 일치하지 않을 때 발생합니다.

### 발견된 문제

**위치**: `components/bookmarks/bookmark-list.tsx` (538번째 줄)

**원인**: `toLocaleDateString()` 메서드를 서버와 클라이언트에서 직접 사용

```typescript
// ❌ 문제가 있는 코드
{new Date(bookmark.created_at).toLocaleDateString("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})}
```

**왜 문제인가?**
- 서버와 클라이언트의 타임존/로케일 설정이 다를 수 있음
- 서버에서는 서버의 로케일을 사용하고, 클라이언트에서는 브라우저의 로케일을 사용
- 결과적으로 서버와 클라이언트에서 다른 문자열이 생성되어 hydration 불일치 발생

## 해결 방법

### 1. 클라이언트에서만 날짜 포맷팅

`BookmarkDate` 컴포넌트를 생성하여 클라이언트에서만 날짜를 포맷팅하도록 수정:

```typescript
/**
 * 북마크 날짜 표시 컴포넌트
 * 
 * Hydration 에러를 방지하기 위해 클라이언트에서만 날짜를 포맷팅합니다.
 * 서버에서는 빈 문자열을 렌더링하고, 클라이언트에서 마운트된 후 날짜를 표시합니다.
 */
function BookmarkDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // 클라이언트에서만 날짜 포맷팅
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setFormattedDate(formatted);
  }, [dateString]);

  return (
    <div className="absolute bottom-2 left-2 z-10">
      <span className="px-2 py-1 text-xs rounded bg-background/80 backdrop-blur-sm border">
        {formattedDate || "..."}
      </span>
    </div>
  );
}
```

### 2. 사용 방법

```typescript
{bookmark && (
  <BookmarkDate dateString={bookmark.created_at} />
)}
```

## Hydration 에러를 유발하는 일반적인 패턴

### 1. 날짜 포맷팅
```typescript
// ❌ 문제
{new Date().toLocaleDateString()}

// ✅ 해결
const [date, setDate] = useState("");
useEffect(() => {
  setDate(new Date().toLocaleDateString());
}, []);
```

### 2. `typeof window !== 'undefined'` 체크
```typescript
// ❌ 문제 (렌더링 단계에서 사용)
{typeof window !== "undefined" ? "클라이언트" : "서버"}

// ✅ 해결 (이벤트 핸들러나 useEffect 내부에서만 사용)
const handleClick = () => {
  if (typeof window !== "undefined") {
    // ...
  }
};
```

### 3. 동적 값 (`Date.now()`, `Math.random()`)
```typescript
// ❌ 문제
<div>{Date.now()}</div>

// ✅ 해결
const [timestamp, setTimestamp] = useState(0);
useEffect(() => {
  setTimestamp(Date.now());
}, []);
```

### 4. 브라우저 API 직접 사용
```typescript
// ❌ 문제 (렌더링 단계)
<div>{navigator.userAgent}</div>

// ✅ 해결 (이벤트 핸들러나 useEffect 내부에서만 사용)
const handleClick = () => {
  const userAgent = navigator.userAgent;
  // ...
};
```

## 확인된 안전한 패턴

다음 패턴들은 이벤트 핸들러나 `useEffect` 내부에서만 사용되므로 문제가 없습니다:

1. **`window.innerWidth`** - 이벤트 핸들러 내부에서만 사용
2. **`navigator.userAgent`** - 이벤트 핸들러 내부에서만 사용
3. **`window.naver?.maps`** - `useEffect` 내부에서만 사용
4. **`navigator.clipboard`** - 이벤트 핸들러 내부에서만 사용

## 참고 자료

- [Next.js Hydration Error 문서](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration 문서](https://react.dev/reference/react-dom/client/hydrateRoot)

