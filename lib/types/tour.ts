/**
 * @file tour.ts
 * @description 한국관광공사 API 응답 타입 정의
 *
 * 한국관광공사 공공 API (KorService2)의 응답 데이터 구조를 정의합니다.
 * PRD 5장 데이터 구조를 기반으로 작성되었습니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

/**
 * 관광지 목록 항목 (areaBasedList2 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string; // 경도 (KATEC 좌표계)
  mapy: string; // 위도 (KATEC 좌표계)
}

/**
 * 관광지 소개 정보 (detailIntro2 응답)
 * 타입별로 필드가 다르므로 선택적 필드로 정의
 */
export interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 공통 필드
  infocenter?: string; // 문의처 (관광지 12)
  infocenterculture?: string; // 문의처 (문화시설 14)
  infocenterleports?: string; // 문의처 (레포츠 28)
  infocenterlodging?: string; // 문의처 (숙박 32)
  infocentershopping?: string; // 문의처 (쇼핑 38)
  infocenterfood?: string; // 문의처 (음식점 39)
  // 홈페이지 (타입별로 필드명이 다를 수 있음)
  homepage?: string; // 홈페이지 (관광지 12)
  homepageculture?: string; // 홈페이지 (문화시설 14)
  homepageleports?: string; // 홈페이지 (레포츠 28)
  homepagelodging?: string; // 홈페이지 (숙박 32)
  homepageshopping?: string; // 홈페이지 (쇼핑 38)
  homepagefood?: string; // 홈페이지 (음식점 39)
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반
  // 관광지(12), 문화시설(14) 등
  usetime?: string; // 이용시간
  restdate?: string; // 휴무일
  // 숙박(32)
  checkintime?: string; // 체크인 시간
  checkouttime?: string; // 체크아웃 시간
  // 음식점(39)
  opentimefood?: string; // 영업시간
  reservationfood?: string; // 예약안내
  // 기타 타입별 필드들...
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  contentid: string;
  imagename?: string; // 이미지명
  originimgurl?: string; // 원본 이미지 URL
  smallimageurl?: string; // 썸네일 이미지 URL
  cpyrhtDivCd?: string; // 저작권 구분 코드
  serialnum?: string; // 일련번호
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
}

/**
 * Content Type ID (관광 타입)
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: '12', // 관광지
  CULTURAL_FACILITY: '14', // 문화시설
  FESTIVAL: '15', // 축제/행사
  TRAVEL_COURSE: '25', // 여행코스
  LEISURE_SPORTS: '28', // 레포츠
  ACCOMMODATION: '32', // 숙박
  SHOPPING: '38', // 쇼핑
  RESTAURANT: '39', // 음식점
} as const;

export type ContentTypeId = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

/**
 * API 응답 래퍼 타입
 */
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

