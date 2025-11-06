# 이미지 폴더

이 폴더는 프로젝트에서 사용하는 이미지 파일들을 저장하는 곳입니다.

## 폴더 구조

- `default/`: 기본 이미지 (이미지가 없을 때 사용하는 플레이스홀더)
- `tours/`: 관광지 관련 이미지 (필요 시 사용)

## 사용 방법

### 기본 이미지
- 관광지 이미지가 없을 때 표시되는 기본 이미지를 `default/` 폴더에 저장하세요.
- 현재는 `public/logo.png`를 기본 이미지로 사용하고 있습니다.

### 관광지 이미지
- 필요 시 관광지별 커스텀 이미지를 `tours/` 폴더에 저장할 수 있습니다.
- 파일명 형식: `{contentid}.jpg` 또는 `{contentid}.png`

## 참고사항

- 이미지 파일은 Next.js의 `public/` 폴더에 저장되므로 `/images/...` 경로로 접근할 수 있습니다.
- 예: `public/images/default/placeholder.jpg` → `/images/default/placeholder.jpg`

