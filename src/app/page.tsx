'use client';

import { useState, useEffect } from 'react';
import { QuoteCard } from '@/components/QuoteCard';
import { TimeDisplay } from '@/components/TimeDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Quote {
  id: string;
  quote: string;
  author: string;
  context: string;
  background: string;
  achievements: string;  // 添加生平成就字段
  timestamp: number;
  index: number;  // 添加索引字段
}

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const [usedAuthors, setUsedAuthors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 检查是否需要生成新的名言
  const shouldGenerateNewQuote = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 只在8:00-22:00之间工作
    if (hour < 8 || hour >= 22) {
      return false;
    }
    
    // 每半小时检查一次（0分和30分）
    return minute === 0 || minute === 30;
  };

  // 计算下次更新时间
  const calculateNextUpdate = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    let nextHour = hour;
    let nextMinute = minute < 30 ? 30 : 0;
    
    if (minute >= 30) {
      nextHour = hour + 1;
      nextMinute = 0;
    }
    
    // 如果超过22点，设置为明天8点
    if (nextHour >= 22) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      return tomorrow;
    }
    
    // 如果早于8点，设置为今天8点
    if (nextHour < 8) {
      const today = new Date(now);
      today.setHours(8, 0, 0, 0);
      return today;
    }
    
    const nextUpdate = new Date(now);
    nextUpdate.setHours(nextHour, nextMinute, 0, 0);
    return nextUpdate;
  };

  // 生成名言
  const generateQuote = async () => {
    setLoading(true);
    setError(null);
    console.log('🔄 开始生成名言...');
    
    // 获取最新的已使用作者列表
    const currentUsedAuthors = JSON.parse(localStorage.getItem('usedAuthors') || '[]');
    console.log('📝 当前已使用作者列表:', currentUsedAuthors);
    
    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usedQuotes: currentUsedAuthors
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`生成名言失败: ${response.status} ${errorText}`);
      }
      
      const quote = await response.json();
      console.log('✅ 收到名言:', quote.author, '-', quote.quote);
      
      // 验证返回的数据完整性
      if (!quote.quote || !quote.author || !quote.achievements) {
        throw new Error('返回的名言数据不完整');
      }
      
      setCurrentQuote(quote);
      
      // 将新名言的作者添加到已使用列表
      if (!currentUsedAuthors.includes(quote.author)) {
        const newUsedAuthors = [...currentUsedAuthors, quote.author];
        setUsedAuthors(newUsedAuthors);
        console.log('📝 更新已使用作者列表:', newUsedAuthors);
        
        // 保存到localStorage
        localStorage.setItem('usedAuthors', JSON.stringify(newUsedAuthors));
      }
      
      // 保存到localStorage
      localStorage.setItem('currentQuote', JSON.stringify(quote));
      localStorage.setItem('lastUpdate', Date.now().toString());
      console.log('💾 名言已保存到localStorage');
      
    } catch (error) {
      console.error('❌ 生成名言时出错:', error);
      setError(error instanceof Error ? error.message : '生成名言时发生未知错误');
    } finally {
      setLoading(false);
      console.log('🏁 生成名言完成');
    }
  };

  // 初始化
  useEffect(() => {
    const initializeApp = () => {
      // 加载已使用的作者列表
      const storedUsedAuthors = localStorage.getItem('usedAuthors');
      if (storedUsedAuthors) {
        setUsedAuthors(JSON.parse(storedUsedAuthors));
      }
      
      const storedQuote = localStorage.getItem('currentQuote');
      const lastUpdate = localStorage.getItem('lastUpdate');
      
      if (storedQuote && lastUpdate) {
        const lastUpdateTime = parseInt(lastUpdate);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        
        // 如果存储的名言超过30分钟，需要生成新的
        if (now - lastUpdateTime > thirtyMinutes) {
          generateQuote();
        } else {
          const quote = JSON.parse(storedQuote);
          setCurrentQuote(quote);
          // 将当前名言的作者也添加到已使用列表
          if (!usedAuthors.includes(quote.author)) {
            setUsedAuthors(prev => [...prev, quote.author]);
          }
        }
      } else {
        generateQuote();
      }
      
      setNextUpdate(calculateNextUpdate());
    };

    initializeApp();
    
    // 每分钟检查一次是否需要更新
    const interval = setInterval(() => {
      if (shouldGenerateNewQuote()) {
        generateQuote();
        setNextUpdate(calculateNextUpdate());
      }
    }, 60000); // 每分钟检查一次
    
    return () => clearInterval(interval);
  }, [usedAuthors]);

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* 头部 */}
          <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💡</span>
                </div>
                 <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                   人类群星闪耀时
                 </h1>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center px-2 leading-relaxed">
                每半小时为你提供人类历史上振聋发聩的名人名言
              </p>
            </div>
          </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-8">
        {/* 时间显示 */}
        <TimeDisplay nextUpdate={nextUpdate} />
        
            {/* 错误提示 */}
            {error && (
              <div className="mt-4 md:mt-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">生成名言时出错</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setError(null)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          关闭
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 名言卡片 */}
            <div className="mt-4 md:mt-8">
              {loading ? (
                <LoadingSpinner />
              ) : currentQuote ? (
                <QuoteCard quote={currentQuote} />
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">点击下方按钮获取精神激励</p>
                    <p className="text-gray-400 text-sm mt-2">每半小时自动更新，8:00-22:00</p>
                  </div>
                </div>
              )}
            </div>
        
            {/* 手动刷新按钮 */}
            <div className="mt-6 md:mt-8 text-center">
              <button
                onClick={generateQuote}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 text-sm md:text-base w-full max-w-sm shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                aria-label={loading ? "正在生成名言，请稍候" : "获取新的精神激励名言"}
                aria-describedby="button-description"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>AI正在生成中...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>获取新名言</span>
                  </>
                )}
              </button>
              <p className="text-gray-400 text-xs mt-2" id="button-description">
                {usedAuthors.length > 0 && `已使用 ${usedAuthors.length} 位名人`}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                点击获取AI生成的全新精神激励名言
              </p>
            </div>
      </main>
      
      {/* 底部 */}
      <footer className="mt-12 sm:mt-16 py-6 sm:py-8 text-center">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200">
            <p className="text-gray-600 text-sm sm:text-base font-medium mb-2">
              让历史名人的智慧点亮你的每一天
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>✨ 每半小时更新</span>
              <span>•</span>
              <span>🕐 8:00-22:00</span>
              <span>•</span>
              <span>🎯 永不重复</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}