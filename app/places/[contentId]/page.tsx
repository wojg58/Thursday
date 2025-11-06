/**
 * @file app/places/[contentId]/page.tsx
 * @description 관광지 상세페이지
 *
 * 한국관광공사 API를 활용하여 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 개요)
 * 2. 뒤로가기 버튼
 * 3. 섹션별 구분된 레이아웃
 *
 * 핵심 구현 로직:
 * - Next.js 15 App Router 동적 라우팅 사용
 * - contentId를 URL 파라미터로 받아 API 호출
 * - detailCommon2 API 연동
 *
 * @dependencies
 * - @/lib/api/tour-api: getDetailCommon
 * - @/components/tour-detail/detail-info: DetailInfo 컴포넌트
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design.md} - 디자인 레이아웃
 */

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { getDetailCommon, getDetailIntro } from "@/lib/api/tour-api";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { ShareButton } from "@/components/tour-detail/share-button";
import { ErrorMessage } from "@/components/ui/error-message";
import type { Metadata } from "next";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * Open Graph 메타태그 동적 생성
 * PRD 2.4.5 공유 기능 요구사항
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const detail = await getDetailCommon(contentId);

    if (!detail) {
      return {
        title: "관광지 정보를 찾을 수 없습니다",
      };
    }

    // 이미지 URL 우선순위: firstimage -> firstimage2
    const imageUrl =
      detail.firstimage || detail.firstimage2 || undefined;

    // 개요를 100자 이내로 제한
    const description = detail.overview
      ? detail.overview.slice(0, 100).replace(/\n/g, " ") + "..."
      : `${detail.title} - 한국의 아름다운 관광지를 탐험하세요`;

    // 현재 페이지 URL 생성
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const pageUrl = `${baseUrl}/places/${contentId}`;

    console.group("📊 Open Graph 메타태그 생성");
    console.log("제목:", detail.title);
    console.log("설명:", description);
    console.log("이미지:", imageUrl);
    console.log("URL:", pageUrl);
    console.groupEnd();

    return {
      title: detail.title,
      description,
      openGraph: {
        title: detail.title,
        description,
        url: pageUrl,
        siteName: "My Trip",
        images: imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: detail.title,
              },
            ]
          : [],
        type: "website",
        locale: "ko_KR",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("❌ 메타데이터 생성 실패:", error);
    return {
      title: "관광지 상세 정보",
    };
  }
}

/**
 * 관광지 상세페이지
 *
 * URL: /places/[contentId]
 * 예시: /places/125266
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  const { contentId } = await params;

  console.group("📍 관광지 상세페이지 로드");
  console.log("Content ID:", contentId);

  try {
    // detailCommon2 API 호출 (기본 정보)
    const detail = await getDetailCommon(contentId);

    if (!detail) {
      console.error("❌ 관광지 정보를 찾을 수 없습니다");
      console.groupEnd();

      return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <section className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>뒤로가기</span>
              </Button>
            </Link>
          </section>
          <ErrorMessage
            type="not-found"
            message="관광지 정보를 찾을 수 없습니다."
          />
        </div>
      );
    }

    // API 응답 상세 로깅
    console.log("📋 detailCommon2 API 응답:");
    console.log("- tel 필드:", detail.tel);
    console.log("- tel 타입:", typeof detail.tel);
    console.log("- tel 길이:", detail.tel?.length);
    console.log("- homepage 필드:", detail.homepage);
    console.log("- homepage 타입:", typeof detail.homepage);
    console.log("- homepage 길이:", detail.homepage?.length);
    console.log("- 전체 detail 객체:", JSON.stringify(detail, null, 2));

    // detailIntro2 API 호출 (소개 정보 - 전화번호가 infocenter에 있을 수 있음)
    let intro = null;
    try {
      intro = await getDetailIntro(detail.contentid, detail.contenttypeid);
      console.log("✅ 소개 정보 조회 완료");
      console.log("📋 detailIntro2 API 응답:");
      console.log("- infocenter 필드:", intro?.infocenter);
      // detailIntro2에도 homepage가 있을 수 있음 (타입별로 다름)
      console.log("- 전체 intro 객체:", JSON.stringify(intro, null, 2));
      
      // detailIntro2에서 homepage 확인 (타입별 필드명이 다를 수 있음)
      const introHomepage = 
        intro.homepage || 
        intro.homepageculture ||
        intro.homepageleports ||
        intro.homepagelodging ||
        intro.homepageshopping ||
        intro.homepagefood;
      if (introHomepage) {
        console.log("🌐 detailIntro2에서 홈페이지 발견:", introHomepage);
      }
    } catch (error) {
      console.warn("⚠️ 소개 정보 조회 실패 (선택 사항):", error);
    }

    // 전화번호 병합 로직 개선
    // 1. detailCommon2.tel 확인 (빈 문자열도 체크)
    const hasTelFromCommon = detail.tel && detail.tel.trim() !== "";
    
    if (!hasTelFromCommon) {
      console.log("⚠️ detailCommon2에 전화번호가 없음, detailIntro2 확인 중...");
      
      // 타입별 infocenter 필드 확인
      const infocenterField = 
        intro?.infocenter || // 관광지(12)
        intro?.infocenterculture || // 문화시설(14)
        intro?.infocenterleports || // 레포츠(28)
        intro?.infocenterlodging || // 숙박(32)
        intro?.infocentershopping || // 쇼핑(38)
        intro?.infocenterfood; // 음식점(39)
      
      if (infocenterField) {
        console.log("📞 infocenter 값:", infocenterField);
        
        // 다양한 전화번호 패턴 추출
        // 예: "02-1234-5678", "010-1234-5678", "1588-1234", "02)1234-5678" 등
        const phonePatterns = [
          /(\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})/, // 일반 전화번호
          /(\d{4}[-.\s]?\d{4})/, // 1588-1234 형식
          /(\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4})/, // 괄호 포함
        ];
        
        let extractedPhone = null;
        for (const pattern of phonePatterns) {
          const match = infocenterField.match(pattern);
          if (match) {
            extractedPhone = match[1].replace(/[.\s()]/g, (m) => {
              if (m === '.') return '';
              if (m === ' ') return '';
              if (m === '(' || m === ')') return '';
              return m;
            });
            // 하이픈으로 통일
            extractedPhone = extractedPhone.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
            break;
          }
        }
        
        if (extractedPhone) {
          detail.tel = extractedPhone;
          console.log("✅ 전화번호 추출 성공:", detail.tel);
        } else {
          // 패턴이 없으면 infocenter 전체를 확인
          // 숫자만 있는 경우 전화번호로 간주
          const numbersOnly = infocenterField.replace(/[^\d]/g, '');
          if (numbersOnly.length >= 8 && numbersOnly.length <= 13) {
            // 전화번호 형식으로 변환
            if (numbersOnly.length === 10) {
              // 02-1234-5678 형식
              detail.tel = `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2, 6)}-${numbersOnly.slice(6)}`;
            } else if (numbersOnly.length === 11) {
              // 010-1234-5678 형식
              detail.tel = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`;
            } else {
              detail.tel = numbersOnly;
            }
            console.log("✅ 숫자만 추출하여 전화번호로 사용:", detail.tel);
          } else {
            // 전화번호로 보이지 않으면 infocenter 전체를 tel로 사용 (표시용)
            detail.tel = infocenterField.trim();
            console.log("⚠️ infocenter 전체를 전화번호로 사용:", detail.tel);
          }
        }
      } else {
        console.log("❌ detailIntro2에도 전화번호 정보가 없음");
        console.log("확인한 필드:", {
          infocenter: intro?.infocenter,
          infocenterculture: intro?.infocenterculture,
          infocenterleports: intro?.infocenterleports,
          infocenterlodging: intro?.infocenterlodging,
          infocentershopping: intro?.infocentershopping,
          infocenterfood: intro?.infocenterfood,
        });
      }
    } else {
      console.log("✅ detailCommon2에서 전화번호 확인:", detail.tel);
    }

    console.log("📞 최종 전화번호:", detail.tel);
    console.log("📞 최종 전화번호 유효성:", detail.tel && detail.tel.trim() !== "");

    // 홈페이지 병합 로직: detailCommon2.homepage가 없으면 detailIntro2에서 확인
    const hasHomepageFromCommon = detail.homepage && detail.homepage.trim() !== "";
    
    if (!hasHomepageFromCommon && intro) {
      console.log("⚠️ detailCommon2에 홈페이지가 없음, detailIntro2 확인 중...");
      
      // 타입별 homepage 필드 확인
      const introHomepage = 
        intro.homepage || // 관광지(12)
        intro.homepageculture || // 문화시설(14)
        intro.homepageleports || // 레포츠(28)
        intro.homepagelodging || // 숙박(32)
        intro.homepageshopping || // 쇼핑(38)
        intro.homepagefood; // 음식점(39)
      
      if (introHomepage && introHomepage.trim() !== "") {
        detail.homepage = introHomepage.trim();
        console.log("✅ 홈페이지를 detailIntro2에서 가져옴:", detail.homepage);
      } else {
        console.log("❌ detailIntro2에도 홈페이지 정보가 없음");
        console.log("확인한 필드:", {
          homepage: intro.homepage,
          homepageculture: intro.homepageculture,
          homepageleports: intro.homepageleports,
          homepagelodging: intro.homepagelodging,
          homepageshopping: intro.homepageshopping,
          homepagefood: intro.homepagefood,
        });
      }
    } else if (hasHomepageFromCommon) {
      console.log("✅ detailCommon2에서 홈페이지 확인:", detail.homepage);
    }

    console.log("🌐 최종 홈페이지:", detail.homepage);
    console.log("🌐 최종 홈페이지 유효성:", detail.homepage && detail.homepage.trim() !== "");
    console.groupEnd();

    // 현재 페이지 URL 생성 (공유 버튼용)
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
    const pageUrl = `${baseUrl}/places/${contentId}`;

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* 뒤로가기 버튼 및 공유 버튼 */}
        <section className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로가기</span>
            </Button>
          </Link>
          <ShareButton url={pageUrl} title={detail.title} />
        </section>

        {/* 기본 정보 섹션 */}
        <DetailInfo detail={detail} />

        {/* 지도 섹션 (3.3에서 구현 예정) */}
        <section className="mb-8 mt-8">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-4">🗺️ 위치 정보</h2>
            <p className="text-muted-foreground">
              지도 섹션은 Phase 3.3에서 구현 예정입니다.
            </p>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("❌ 관광지 상세 정보 조회 실패:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error
        ? error.message
        : "관광지 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <section className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로가기</span>
            </Button>
          </Link>
        </section>
        <ErrorMessage type="api" message={errorMessage} />
      </div>
    );
  }
}

