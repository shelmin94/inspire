#!/bin/bash

echo "开始测试连续生成100条数据..."
echo "开始时间: $(date)"

# 初始化已使用名人列表
used_celebrities=()

for i in {1..100}; do
    echo -n "第$i次: "
    
    # 构建请求体，包含已使用的名人列表
    request_body="{\"usedQuotes\": ["
    if [ ${#used_celebrities[@]} -gt 0 ]; then
        for j in "${!used_celebrities[@]}"; do
            if [ $j -gt 0 ]; then
                request_body+=","
            fi
            request_body+="\"${used_celebrities[$j]}\""
        done
    fi
    request_body+="]}"
    
    # 发送请求并获取结果
    response=$(curl -X POST http://localhost:3000/api/generate-quote \
        -H "Content-Type: application/json" \
        -d "$request_body" \
        -s 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        # 提取作者和名言
        author=$(echo "$response" | jq -r '.author' 2>/dev/null)
        quote=$(echo "$response" | jq -r '.quote' 2>/dev/null)
        
        if [ "$author" != "null" ] && [ "$quote" != "null" ]; then
            echo "$author: $quote"
            # 将作者添加到已使用列表
            used_celebrities+=("$author")
        else
            echo "解析失败"
        fi
    else
        echo "请求失败"
    fi
    
    # 每10次显示一次进度
    if [ $((i % 10)) -eq 0 ]; then
        echo "--- 进度: $i/100, 已使用名人数量: ${#used_celebrities[@]} ---"
    fi
    
    sleep 0.5
done

echo "结束时间: $(date)"
echo "总共使用了 ${#used_celebrities[@]} 个不同的名人"
echo "已使用名人列表: ${used_celebrities[*]}"
