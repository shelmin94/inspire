import { useState, useEffect } from 'react';

interface TimeDisplayProps {
  nextUpdate: Date | null;
}

export function TimeDisplay({ nextUpdate }: TimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 确保只在客户端渲染
    setIsClient(true);
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatNextUpdate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilNext = () => {
    if (!nextUpdate || !currentTime) return '';
    
    const diff = nextUpdate.getTime() - currentTime.getTime();
    
    if (diff <= 0) return '即将更新';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟后更新`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒后更新`;
    } else {
      return `${seconds}秒后更新`;
    }
  };

  // 在客户端渲染之前显示占位符
  if (!isClient || !currentTime) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 text-center">
        <div className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
          当前时间：加载中...
        </div>
        {nextUpdate && (
          <div className="text-xs md:text-sm text-gray-500">
            <div className="hidden md:block">
              下次更新：{formatNextUpdate(nextUpdate)} (计算中...)
            </div>
            <div className="md:hidden">
              计算中...
            </div>
          </div>
        )}
      </div>
    );
  }

      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="text-sm font-medium text-gray-700">实时状态</div>
          </div>
          <div className="text-sm md:text-base text-gray-800 mb-2 font-mono">
            {formatTime(currentTime)}
          </div>
          {nextUpdate && (
            <div className="text-xs md:text-sm text-gray-500">
              <div className="hidden md:block">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>下次更新：{formatNextUpdate(nextUpdate)}</span>
                </div>
                <div className="mt-1 text-green-600 font-medium">
                  {getTimeUntilNext()}
                </div>
              </div>
              <div className="md:hidden">
                <div className="text-green-600 font-medium">
                  {getTimeUntilNext()}
                </div>
              </div>
            </div>
          )}
        </div>
      );
}
