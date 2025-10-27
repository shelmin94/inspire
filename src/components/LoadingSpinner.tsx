export function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center py-8 md:py-12">
      <div className="relative mb-6">
        {/* 外圈旋转 */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-500"></div>
        {/* 内圈反向旋转 */}
        <div className="absolute top-2 left-2 animate-spin rounded-full h-12 w-12 border-2 border-gray-100 border-b-blue-500" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
      </div>
      <div className="text-center">
        <div className="text-gray-600 font-medium mb-2 text-lg">AI正在生成名言...</div>
        <div className="text-gray-400 text-sm mb-4">请稍候，正在为您准备精神激励</div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
}
