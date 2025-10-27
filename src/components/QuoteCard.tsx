import React from 'react';

interface Quote {
  id: string;
  quote: string;
  author: string;
  context: string;
  background: string;
  achievements: string;  // 添加生平成就字段
  timestamp: number;
}

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto border border-gray-100" role="article" aria-labelledby="quote-title" aria-describedby="quote-content">
      {/* 名言内容 */}
      <div className="text-center mb-3 sm:mb-4 md:mb-6">
        <div className="mb-3 sm:mb-4">
               <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700" id="quote-title">
                 ⭐ 人类群星闪耀时
               </div>
        </div>
        <blockquote className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-800 leading-relaxed mb-2 sm:mb-3 md:mb-4 px-1 sm:px-2 relative" id="quote-content">
          <div className="absolute -left-1 sm:-left-2 -top-1 sm:-top-2 text-green-400 text-2xl sm:text-3xl md:text-4xl opacity-20" aria-hidden="true">&quot;</div>
          <div className="absolute -right-1 sm:-right-2 -bottom-1 sm:-bottom-2 text-green-400 text-2xl sm:text-3xl md:text-4xl opacity-20" aria-hidden="true">&quot;</div>
          「{quote.quote}」
        </blockquote>
        <cite className="text-sm sm:text-base md:text-lg text-gray-600 font-medium flex items-center justify-center gap-1 sm:gap-2">
          <div className="w-4 sm:w-6 md:w-8 h-px bg-gradient-to-r from-transparent to-gray-300" aria-hidden="true"></div>
          <span>{quote.author}</span>
          <div className="w-4 sm:w-6 md:w-8 h-px bg-gradient-to-l from-transparent to-gray-300" aria-hidden="true"></div>
        </cite>
      </div>
      
      {/* 出处信息 */}
      <div className="border-t border-gray-200 pt-3 sm:pt-4 md:pt-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full"></div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium">
            出处背景
          </div>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-medium">
          📖 {quote.context}
        </div>
        <div className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 sm:p-4">
          {quote.background}
        </div>
      </div>
      
      {/* 生平成就 */}
      <div className="border-t border-gray-200 pt-3 sm:pt-4 md:pt-6 mt-3 sm:mt-4 md:mt-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full"></div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium">
            生平成就
          </div>
        </div>
        <div className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed bg-green-50 rounded-lg p-3 sm:p-4">
          {quote.achievements}
        </div>
      </div>
      
      {/* 时间戳 */}
      <div className="mt-3 sm:mt-4 md:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-400">
          <svg className="h-2.5 sm:h-3 w-2.5 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>生成时间：{formatTime(quote.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
