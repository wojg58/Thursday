/**
 * @file route.ts
 * @description 시/군/구 목록 조회 API Route
 *
 * 클라이언트 컴포넌트에서 시/군/구 목록을 조회하기 위한 API Route입니다.
 */

import { getSubAreaCode } from '@/lib/api/tour-api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const areaCode = searchParams.get('areaCode');

  if (!areaCode) {
    return NextResponse.json(
      { error: 'areaCode 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const subAreas = await getSubAreaCode(areaCode);
    return NextResponse.json({ subAreas });
  } catch (error) {
    console.error('시/군/구 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '시/군/구 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

