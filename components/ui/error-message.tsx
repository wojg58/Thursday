/**
 * @file error-message.tsx
 * @description 에러 메시지 컴포넌트
 *
 * API 에러, 네트워크 에러 등 다양한 에러 상황을 표시하는 컴포넌트입니다.
 * 재시도 버튼을 포함할 수 있습니다.
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 에러 타입에 따른 기본 메시지
   */
  type?: 'api' | 'network' | 'not-found' | 'generic';
  /**
   * 재시도 함수
   */
  onRetry?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 전체 화면 표시 여부
   */
  fullScreen?: boolean;
}

const defaultMessages = {
  api: '데이터를 불러오는 중 오류가 발생했습니다.',
  network: '네트워크 연결을 확인해주세요.',
  'not-found': '요청한 정보를 찾을 수 없습니다.',
  generic: '오류가 발생했습니다.',
};

export function ErrorMessage({
  message,
  type = 'generic',
  onRetry,
  className,
  fullScreen = false,
}: ErrorMessageProps) {
  const displayMessage = message || defaultMessages[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-8',
        fullScreen && 'min-h-[400px]',
        className
      )}
    >
      <AlertCircle className="w-12 h-12 text-destructive" />
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          {displayMessage}
        </p>
        {type === 'network' && (
          <p className="mt-2 text-sm text-muted-foreground">
            인터넷 연결 상태를 확인하고 다시 시도해주세요.
          </p>
        )}
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      )}
    </div>
  );
}

