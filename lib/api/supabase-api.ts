/**
 * @file supabase-api.ts
 * @description Supabase 북마크 관련 쿼리 함수
 *
 * 북마크 추가/삭제, 목록 조회, 북마크 여부 확인 기능을 제공합니다.
 * 서버 사이드와 클라이언트 사이드 모두에서 사용 가능합니다.
 *
 * @see {@link /supabase/migrations/mytrip_schema.sql} - 데이터베이스 스키마
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 북마크 테이블 타입 정의
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * 북마크 추가
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentId 관광지 콘텐츠 ID
 * @returns 생성된 북마크 또는 null (이미 존재하는 경우)
 */
export async function addBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<Bookmark | null> {
  console.group('📌 북마크 추가');
  console.log('User ID:', userId);
  console.log('Content ID:', contentId);

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        content_id: contentId,
      })
      .select()
      .single();

    if (error) {
      // UNIQUE 제약 조건 위반 (이미 북마크된 경우)
      if (error.code === '23505') {
        console.log('⚠️ 이미 북마크된 관광지입니다.');
        console.groupEnd();
        return null;
      }

      console.error('❌ 북마크 추가 실패:', error);
      console.groupEnd();
      throw error;
    }

    console.log('✅ 북마크 추가 성공:', data);
    console.groupEnd();
    return data;
  } catch (error) {
    console.error('❌ 북마크 추가 중 오류 발생:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 북마크 삭제
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentId 관광지 콘텐츠 ID
 * @returns 삭제 성공 여부
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<boolean> {
  console.group('🗑️ 북마크 삭제');
  console.log('User ID:', userId);
  console.log('Content ID:', contentId);

  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      console.error('❌ 북마크 삭제 실패:', error);
      console.groupEnd();
      throw error;
    }

    console.log('✅ 북마크 삭제 성공');
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ 북마크 삭제 중 오류 발생:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 북마크 여부 확인
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function isBookmarked(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (error) {
      // 데이터가 없는 경우 (북마크되지 않음)
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('❌ 북마크 여부 확인 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 북마크 목록 조회
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param options 정렬 옵션
 * @returns 북마크 목록
 */
export async function getBookmarks(
  supabase: SupabaseClient,
  userId: string,
  options?: {
    orderBy?: 'created_at' | 'content_id';
    order?: 'asc' | 'desc';
    limit?: number;
  }
): Promise<Bookmark[]> {
  console.group('📚 북마크 목록 조회');
  console.log('User ID:', userId);
  console.log('Options:', options);

  try {
    let query = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    // 정렬 옵션 적용
    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.order === 'asc',
      });
    } else {
      // 기본값: 최신순
      query = query.order('created_at', { ascending: false });
    }

    // 제한 적용
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ 북마크 목록 조회 실패:', error);
      console.groupEnd();
      throw error;
    }

    console.log(`✅ 북마크 ${data?.length || 0}개 조회 성공`);
    console.groupEnd();
    return data || [];
  } catch (error) {
    console.error('❌ 북마크 목록 조회 중 오류 발생:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 여러 북마크 일괄 삭제
 * @param supabase Supabase 클라이언트
 * @param userId 사용자 ID (UUID)
 * @param contentIds 삭제할 콘텐츠 ID 배열
 * @returns 삭제 성공 여부
 */
export async function removeBookmarks(
  supabase: SupabaseClient,
  userId: string,
  contentIds: string[]
): Promise<boolean> {
  console.group('🗑️ 북마크 일괄 삭제');
  console.log('User ID:', userId);
  console.log('Content IDs:', contentIds);

  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .in('content_id', contentIds);

    if (error) {
      console.error('❌ 북마크 일괄 삭제 실패:', error);
      console.groupEnd();
      throw error;
    }

    console.log('✅ 북마크 일괄 삭제 성공');
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ 북마크 일괄 삭제 중 오류 발생:', error);
    console.groupEnd();
    throw error;
  }
}

