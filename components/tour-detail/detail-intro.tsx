/**
 * @file components/tour-detail/detail-intro.tsx
 * @description 관광지 운영 정보 컴포넌트
 *
 * 관광지 상세페이지에서 운영 정보를 표시하는 컴포넌트입니다.
 * PRD 2.4.2 운영 정보 섹션 요구사항을 구현합니다.
 *
 * 주요 기능:
 * 1. 운영시간 / 개장시간 표시
 * 2. 휴무일 표시
 * 3. 이용요금 표시
 * 4. 주차 가능 여부 표시
 * 5. 수용인원 표시
 * 6. 체험 프로그램 표시 (있는 경우)
 * 7. 유모차/반려동물 동반 가능 여부 표시
 *
 * @dependencies
 * - @/lib/types/tour: TourIntro 타입
 * - lucide-react: 아이콘
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

"use client";

import {
  Clock,
  CalendarX,
  DollarSign,
  Car,
  Users,
  Baby,
  Dog,
  Info,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailIntroProps {
  /**
   * 관광지 소개 정보
   */
  intro: TourIntro | null;
  /**
   * 콘텐츠 타입 ID (타입별로 다른 필드 사용)
   */
  contentTypeId: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * HTML 태그를 제거하고 줄바꿈 태그를 실제 줄바꿈으로 변환
 * @param text 원본 텍스트 (HTML 태그 포함 가능)
 * @returns 정제된 텍스트
 */
function sanitizeText(text: string): string {
  // <br>, <br/>, <br /> 태그를 줄바꿈으로 변환
  let sanitized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "");

  // 나머지 HTML 태그 제거
  sanitized = sanitized.replace(/<[^>]+>/g, "");

  // HTML 엔티티 디코딩
  sanitized = sanitized
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 연속된 공백 정리
  sanitized = sanitized.replace(/\n\s*\n\s*\n/g, "\n\n");
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * 정보 아이템 컴포넌트
 */
function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  if (!value || value.trim() === "" || value === "없음" || value === "-") {
    return null;
  }

  // HTML 태그 제거 및 정제
  const sanitizedValue = sanitizeText(value);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <p className="text-base leading-relaxed whitespace-pre-line">
            {sanitizedValue}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 관광지 운영 정보 컴포넌트
 */
export function DetailIntro({
  intro,
  contentTypeId,
  className,
}: DetailIntroProps) {
  // intro가 없으면 렌더링하지 않음
  if (!intro) {
    return null;
  }

  console.group("🔍 운영 정보 데이터 확인");
  console.log("Content Type ID:", contentTypeId);
  console.log("Intro 데이터:", JSON.stringify(intro, null, 2));
  console.groupEnd();

  // 타입별로 다른 필드 사용
  const getFieldValue = (fieldName: string): string | null => {
    const value = (intro as any)[fieldName];
    if (!value || value.trim() === "" || value === "없음" || value === "-") {
      return null;
    }
    return value.trim();
  };

  // 운영시간/개장시간 (타입별로 다른 필드)
  const operatingTime =
    contentTypeId === CONTENT_TYPE.RESTAURANT
      ? getFieldValue("opentimefood") // 음식점: 영업시간
      : getFieldValue("usetime") || // 관광지/문화시설: 이용시간
        getFieldValue("usetimeculture") ||
        getFieldValue("usetimeleports");

  // 휴무일
  const restDate =
    getFieldValue("restdate") ||
    getFieldValue("restdateculture") ||
    getFieldValue("restdateleports") ||
    getFieldValue("restdatefood");

  // 이용요금 (타입별로 다른 필드)
  const fee =
    getFieldValue("usefee") ||
    getFieldValue("usefeeleports") ||
    getFieldValue("usefeeculture");

  // 주차 가능 여부
  const parking = getFieldValue("parking");

  // 수용인원
  const capacity =
    getFieldValue("accomcount") ||
    getFieldValue("accomcountculture") ||
    getFieldValue("accomcountleports");

  // 체험 프로그램
  const experience =
    getFieldValue("expguide") ||
    getFieldValue("expagerange") ||
    getFieldValue("expagerangeleports");

  // 유모차 동반 가능 여부
  const chkbabycarriage = getFieldValue("chkbabycarriage");

  // 반려동물 동반 가능 여부
  const chkpet = getFieldValue("chkpet");

  // 숙박 타입의 경우 체크인/체크아웃 시간
  const checkinTime =
    contentTypeId === CONTENT_TYPE.ACCOMMODATION
      ? getFieldValue("checkintime")
      : null;
  const checkoutTime =
    contentTypeId === CONTENT_TYPE.ACCOMMODATION
      ? getFieldValue("checkouttime")
      : null;

  // 표시할 정보가 하나도 없으면 렌더링하지 않음
  const hasAnyInfo =
    operatingTime ||
    restDate ||
    fee ||
    parking ||
    capacity ||
    experience ||
    chkbabycarriage ||
    chkpet ||
    checkinTime ||
    checkoutTime;

  if (!hasAnyInfo) {
    return null;
  }

  return (
    <section className={cn("space-y-6", className)}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Info className="h-6 w-6" />
          <span>🕒 운영 정보</span>
        </h2>

        <div className="space-y-6">
          {/* 운영시간/개장시간 */}
          {operatingTime && (
            <InfoItem
              icon={Clock}
              label="운영시간"
              value={operatingTime}
            />
          )}

          {/* 체크인/체크아웃 시간 (숙박만) */}
          {checkinTime && (
            <InfoItem
              icon={Clock}
              label="체크인 시간"
              value={checkinTime}
            />
          )}
          {checkoutTime && (
            <InfoItem
              icon={Clock}
              label="체크아웃 시간"
              value={checkoutTime}
            />
          )}

          {/* 휴무일 */}
          {restDate && (
            <InfoItem
              icon={CalendarX}
              label="휴무일"
              value={restDate}
            />
          )}

          {/* 이용요금 */}
          {fee && (
            <InfoItem
              icon={DollarSign}
              label="이용요금"
              value={fee}
            />
          )}

          {/* 주차 가능 여부 */}
          {parking && (
            <InfoItem
              icon={Car}
              label="주차"
              value={parking}
            />
          )}

          {/* 수용인원 */}
          {capacity && (
            <InfoItem
              icon={Users}
              label="수용인원"
              value={capacity}
            />
          )}

          {/* 체험 프로그램 */}
          {experience && (
            <InfoItem
              icon={Info}
              label="체험 프로그램"
              value={experience}
            />
          )}

          {/* 유모차 동반 가능 여부 */}
          {chkbabycarriage && (
            <InfoItem
              icon={Baby}
              label="유모차 동반"
              value={chkbabycarriage}
            />
          )}

          {/* 반려동물 동반 가능 여부 */}
          {chkpet && (
            <InfoItem
              icon={Dog}
              label="반려동물 동반"
              value={chkpet}
            />
          )}
        </div>
      </div>
    </section>
  );
}

